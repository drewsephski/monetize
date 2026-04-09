import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  subscriptions,
  customers,
  invoices,
} from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/billing/stripe";

/**
 * POST /api/internal/reconcile
 *
 * Compares Stripe state with local DB and reports/fixes mismatches.
 * Critical for data integrity at scale.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default to dry run for safety
    const limit = Math.min(body.limit || 100, 500);

    logger.info({
      msg: "Starting reconciliation",
      requestId,
      dryRun,
      limit,
    });

    const mismatches: Array<{
      type: string;
      id: string;
      stripeValue: unknown;
      dbValue: unknown;
      field: string;
      action?: string;
    }> = [];

    // 1. Reconcile user subscriptions
    const dbSubscriptions = await db
      .select({
        id: subscriptions.id,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeStatus: subscriptions.stripeStatus,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .limit(limit);

    for (const dbSub of dbSubscriptions) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(
          dbSub.stripeSubscriptionId
        );

        // Check status mismatch
        if (stripeSub.status !== dbSub.stripeStatus) {
          mismatches.push({
            type: "subscription",
            id: dbSub.id,
            field: "stripeStatus",
            stripeValue: stripeSub.status,
            dbValue: dbSub.stripeStatus,
            action: dryRun ? "would_update" : "updated",
          });

          if (!dryRun) {
            await db
              .update(subscriptions)
              .set({
                stripeStatus: stripeSub.status,
                status: mapStripeStatus(stripeSub.status),
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, dbSub.id));
          }
        }

        // Check period end mismatch (within 1 minute tolerance)
        const stripePeriodEnd = new Date((stripeSub as unknown as { current_period_end: number }).current_period_end * 1000);
        const dbPeriodEnd = dbSub.currentPeriodEnd;
        if (
          dbPeriodEnd &&
          Math.abs(stripePeriodEnd.getTime() - dbPeriodEnd.getTime()) > 60000
        ) {
          mismatches.push({
            type: "subscription",
            id: dbSub.id,
            field: "currentPeriodEnd",
            stripeValue: stripePeriodEnd.toISOString(),
            dbValue: dbSub.currentPeriodEnd?.toISOString(),
            action: dryRun ? "would_update" : "updated",
          });

          if (!dryRun) {
            await db
              .update(subscriptions)
              .set({
                currentPeriodEnd: stripePeriodEnd,
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, dbSub.id));
          }
        }
      } catch (error) {
        // Stripe subscription not found - mark as deleted/canceled in DB
        if (
          error instanceof Error &&
          error.message.includes("No such subscription")
        ) {
          mismatches.push({
            type: "subscription",
            id: dbSub.id,
            field: "existence",
            stripeValue: "deleted",
            dbValue: "active",
            action: dryRun ? "would_mark_deleted" : "marked_deleted",
          });

          if (!dryRun) {
            await db
              .update(subscriptions)
              .set({
                status: "canceled",
                stripeStatus: "canceled",
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, dbSub.id));
          }
        }
      }
    }

    // 2. Check for invoices in DB that don't exist in Stripe
    const recentInvoices = await db
      .select({
        id: invoices.id,
        stripeInvoiceId: invoices.stripeInvoiceId,
        status: invoices.status,
      })
      .from(invoices)
      .where(sql`${invoices.createdAt} > NOW() - INTERVAL '7 days'`)
      .limit(limit);

    for (const dbInvoice of recentInvoices) {
      try {
        const stripeInvoice = await stripe.invoices.retrieve(
          dbInvoice.stripeInvoiceId
        );

        if (stripeInvoice.status !== dbInvoice.status) {
          mismatches.push({
            type: "invoice",
            id: dbInvoice.id,
            field: "status",
            stripeValue: stripeInvoice.status,
            dbValue: dbInvoice.status,
            action: dryRun ? "would_update" : "updated",
          });

          if (!dryRun) {
            await db
              .update(invoices)
              .set({
                status: stripeInvoice.status || "unknown",
              })
              .where(eq(invoices.id, dbInvoice.id));
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("No such invoice")
        ) {
          mismatches.push({
            type: "invoice",
            id: dbInvoice.id,
            field: "existence",
            stripeValue: "deleted",
            dbValue: dbInvoice.status,
            action: "requires_manual_review",
          });
        }
      }
    }

    // 3. Check for orphaned customers (no Stripe customer ID)
    const orphanedCustomers = await db
      .select({
        id: customers.id,
        stripeCustomerId: customers.stripeCustomerId,
      })
      .from(customers)
      .where(sql`${customers.stripeCustomerId} IS NULL`)
      .limit(50);

    for (const orphan of orphanedCustomers) {
      mismatches.push({
        type: "customer",
        id: orphan.id,
        field: "stripeCustomerId",
        stripeValue: "missing",
        dbValue: orphan.stripeCustomerId,
        action: "requires_manual_fix",
      });
    }

    // 4. Summary statistics
    const summary = {
      totalChecked: dbSubscriptions.length + recentInvoices.length,
      mismatchesFound: mismatches.length,
      fixed: dryRun ? 0 : mismatches.filter((m) => m.action?.includes("updated")).length,
      byType: mismatches.reduce(
        (acc, m) => {
          acc[m.type] = (acc[m.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    logger.info({
      msg: "Reconciliation complete",
      requestId,
      dryRun,
      summary,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      dryRun,
      summary,
      mismatches: mismatches.slice(0, 100), // Limit response size
      meta: {
        requestId,
        durationMs: Date.now() - startTime,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({
      msg: "Reconciliation failed",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: "Reconciliation failed",
        requestId,
        meta: {
          durationMs: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    paused: "paused",
  };
  return statusMap[stripeStatus] || stripeStatus;
}
