import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  subscriptions,
  organizationSubscriptions,
  dunningAttempts,
} from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/billing/stripe";
import { billingHooks } from "@/lib/billing/hooks";

/**
 * POST /api/cron/dunning
 *
 * Cron job for smart dunning (revenue recovery).
 * Processes subscriptions with failed payments and executes dunning steps.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      processed: 0,
      dunningStepsTriggered: 0,
      downgraded: 0,
      errors: 0,
    };

    // Find subscriptions in past_due status
    const pastDueSubscriptions = await db
      .select({
        id: subscriptions.id,
        customerId: subscriptions.customerId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        failedPaymentCount: subscriptions.failedPaymentCount,
        pastDueSince: subscriptions.pastDueSince,
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, "past_due"));

    // Find organization subscriptions in past_due
    const pastDueOrgSubscriptions = await db
      .select({
        id: organizationSubscriptions.id,
        organizationId: organizationSubscriptions.organizationId,
        stripeSubscriptionId: organizationSubscriptions.stripeSubscriptionId,
        failedPaymentCount: organizationSubscriptions.failedPaymentCount,
        pastDueSince: organizationSubscriptions.pastDueSince,
      })
      .from(organizationSubscriptions)
      .where(eq(organizationSubscriptions.status, "past_due"));

    // Process user subscriptions
    for (const sub of pastDueSubscriptions) {
      try {
        results.processed++;

        // Calculate days since past_due
        const pastDueDays = sub.pastDueSince
          ? Math.floor(
              (Date.now() - new Date(sub.pastDueSince).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        // Determine dunning step
        const step = getDunningStep(pastDueDays, sub.failedPaymentCount || 0);

        // Get latest dunning attempt for this subscription
        const [latestAttempt] = await db
          .select({ step: dunningAttempts.step, createdAt: dunningAttempts.createdAt })
          .from(dunningAttempts)
          .where(eq(dunningAttempts.subscriptionId, sub.id))
          .orderBy(sql`${dunningAttempts.step} DESC`)
          .limit(1);

        // Check if we should trigger this step
        const shouldTriggerStep =
          !latestAttempt ||
          latestAttempt.step < step ||
          (latestAttempt.step === step &&
            new Date(latestAttempt.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000);

        if (shouldTriggerStep) {
          await executeDunningStep({
            step,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            pastDueDays,
            failedCount: sub.failedPaymentCount || 0,
            type: "user",
          });

          results.dunningStepsTriggered++;

          // Auto-downgrade after max steps
          if (step >= 4) {
            await autoDowngrade(sub.id, "user");
            results.downgraded++;
          }
        }
      } catch (error) {
        results.errors++;
        logger.error({
          msg: "Failed to process dunning for subscription",
          subscriptionId: sub.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Process org subscriptions (similar logic)
    for (const sub of pastDueOrgSubscriptions) {
      try {
        results.processed++;

        const pastDueDays = sub.pastDueSince
          ? Math.floor(
              (Date.now() - new Date(sub.pastDueSince).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        const step = getDunningStep(pastDueDays, sub.failedPaymentCount || 0);

        const [latestAttempt] = await db
          .select({ step: dunningAttempts.step, createdAt: dunningAttempts.createdAt })
          .from(dunningAttempts)
          .where(eq(dunningAttempts.orgSubscriptionId, sub.id))
          .orderBy(sql`${dunningAttempts.step} DESC`)
          .limit(1);

        const shouldTriggerStep =
          !latestAttempt ||
          latestAttempt.step < step ||
          (latestAttempt.step === step &&
            new Date(latestAttempt.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000);

        if (shouldTriggerStep) {
          await executeDunningStep({
            step,
            orgSubscriptionId: sub.id,
            organizationId: sub.organizationId,
            pastDueDays,
            failedCount: sub.failedPaymentCount || 0,
            type: "organization",
          });

          results.dunningStepsTriggered++;

          if (step >= 4) {
            await autoDowngrade(sub.id, "organization");
            results.downgraded++;
          }
        }
      } catch (error) {
        results.errors++;
        logger.error({
          msg: "Failed to process dunning for org subscription",
          subscriptionId: sub.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const durationMs = Date.now() - startTime;

    logger.info({
      msg: "Dunning cron completed",
      ...results,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      results,
      meta: {
        durationMs,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      msg: "Dunning cron failed",
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    return NextResponse.json(
      {
        error: "Dunning cron failed",
        meta: { durationMs },
      },
      { status: 500 }
    );
  }
}

/**
 * Determine the current dunning step based on days past due and failure count.
 */
function getDunningStep(pastDueDays: number, failedCount: number): number {
  // Step 1: Reminder (1-2 days past due)
  if (pastDueDays <= 2 && failedCount < 2) return 1;

  // Step 2: Warning (3-5 days past due or 2nd failure)
  if (pastDueDays <= 5 || failedCount === 2) return 2;

  // Step 3: Restriction (6-10 days past due or 3rd failure)
  if (pastDueDays <= 10 || failedCount === 3) return 3;

  // Step 4: Downgrade (10+ days past due or 4th failure)
  return 4;
}

interface DunningContext {
  step: number;
  subscriptionId?: string;
  orgSubscriptionId?: string;
  customerId?: string;
  organizationId?: string;
  pastDueDays: number;
  failedCount: number;
  type: "user" | "organization";
}

/**
 * Execute a dunning step action.
 */
async function executeDunningStep(ctx: DunningContext): Promise<void> {
  const stepNames: Record<number, string> = {
    1: "reminder",
    2: "warning",
    3: "restriction",
    4: "downgrade",
  };

  // Record the dunning attempt
  const [attempt] = await db
    .insert(dunningAttempts)
    .values({
      subscriptionId: ctx.subscriptionId,
      orgSubscriptionId: ctx.orgSubscriptionId,
      step: ctx.step,
      status: "sent",
      sentAt: new Date(),
      metadata: {
        pastDueDays: ctx.pastDueDays,
        failedCount: ctx.failedCount,
        type: ctx.type,
      },
    })
    .returning({ id: dunningAttempts.id });

  // TODO: Add dunning step hook when billingHooks system supports custom events
  // await billingHooks.trigger("dunningStep", { ... });

  logger.info({
    msg: "Dunning step executed",
    step: ctx.step,
    stepName: stepNames[ctx.step],
    subscriptionId: ctx.subscriptionId || ctx.orgSubscriptionId,
    type: ctx.type,
    pastDueDays: ctx.pastDueDays,
  });
}

/**
 * Auto-downgrade a subscription after max dunning steps.
 */
async function autoDowngrade(
  subscriptionId: string,
  type: "user" | "organization"
): Promise<void> {
  try {
    if (type === "user") {
      // Get subscription details
      const [sub] = await db
        .select({ stripeSubscriptionId: subscriptions.stripeSubscriptionId })
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (sub) {
        // Cancel subscription in Stripe
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      }

      // Update local status
      await db
        .update(subscriptions)
        .set({
          status: "canceled",
          stripeStatus: "canceled",
          canceledAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
    } else {
      // Org subscription
      const [sub] = await db
        .select({ stripeSubscriptionId: organizationSubscriptions.stripeSubscriptionId })
        .from(organizationSubscriptions)
        .where(eq(organizationSubscriptions.id, subscriptionId))
        .limit(1);

      if (sub) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      }

      await db
        .update(organizationSubscriptions)
        .set({
          status: "canceled",
          stripeStatus: "canceled",
          canceledAt: new Date(),
        })
        .where(eq(organizationSubscriptions.id, subscriptionId));
    }

    // TODO: Add downgrade hook when billingHooks system supports custom events
    // await billingHooks.trigger("dunningDowngrade", { ... });

    logger.info({
      msg: "Auto-downgrade completed",
      subscriptionId,
      type,
    });
  } catch (error) {
    logger.error({
      msg: "Auto-downgrade failed",
      subscriptionId,
      type,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
