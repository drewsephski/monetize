import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { customers, subscriptions, plans } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import { createRequestLogger } from "@/lib/logger";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId, "/api/subscription/update");

  try {
    const body = await req.json();
    const {
      userId,
      newPriceId,
      prorationBehavior = "create_prorations",
      billingCycleAnchor = "now",
      preview = false,
    } = body;

    requestLogger.info(
      { userId, newPriceId, prorationBehavior, billingCycleAnchor, preview },
      "Processing subscription update"
    );

    if (!userId || !newPriceId) {
      requestLogger.warn("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: userId, newPriceId" },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    if (!customer?.stripeCustomerId) {
      requestLogger.warn({ userId }, "Customer not found");
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Find active subscription
    const userSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.customerId, customer.id),
    });

    const activeSubscription = userSubscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription?.stripeSubscriptionId) {
      requestLogger.warn({ userId }, "No active subscription found");
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Find new plan
    const newPlan = await db.query.plans.findFirst({
      where: eq(plans.stripePriceId, newPriceId),
    });

    if (!newPlan) {
      requestLogger.warn({ newPriceId }, "Plan not found");
      return NextResponse.json(
        { error: "Plan not found for provided price ID" },
        { status: 404 }
      );
    }

    // If preview mode, return upcoming invoice
    if (preview) {
      const currentSub = await stripe.subscriptions.retrieve(
        activeSubscription.stripeSubscriptionId
      );
      const currentItemId = currentSub.items.data[0]?.id;

      if (!currentItemId) {
        return NextResponse.json(
          { error: "No subscription items found" },
          { status: 500 }
        );
      }

      const upcomingInvoice = await stripe.invoices.createPreview({
        customer: customer.stripeCustomerId,
        subscription: activeSubscription.stripeSubscriptionId,
        subscription_details: {
          items: [
            {
              id: currentItemId,
              price: newPriceId,
              quantity: 1,
            },
          ],
          proration_behavior: prorationBehavior as "create_prorations" | "none",
        },
      });

      requestLogger.info(
        { amount: upcomingInvoice.amount_due },
        "Previewed upcoming invoice"
      );

      return NextResponse.json({
        preview: true,
        upcomingInvoice: {
          amountDue: upcomingInvoice.amount_due,
          currency: upcomingInvoice.currency,
          subtotal: upcomingInvoice.subtotal,
          total: upcomingInvoice.total,
          prorationDate: (upcomingInvoice as unknown as { proration_date?: number }).proration_date
            ? new Date((upcomingInvoice as unknown as { proration_date?: number }).proration_date! * 1000).toISOString()
            : null,
          lines: upcomingInvoice.lines.data.map((line: Stripe.InvoiceLineItem) => ({
            description: line.description,
            amount: line.amount,
            period: line.period,
          })),
        },
        newPlan: {
          id: newPlan.id,
          name: newPlan.name,
          priceId: newPlan.stripePriceId,
        },
      });
    }

    // Retrieve current subscription to get item ID
    const stripeSubscription = await stripe.subscriptions.retrieve(
      activeSubscription.stripeSubscriptionId
    );

    const currentItemId = stripeSubscription.items.data[0]?.id;

    if (!currentItemId) {
      requestLogger.error(
        { subscriptionId: activeSubscription.stripeSubscriptionId },
        "No subscription items found"
      );
      return NextResponse.json(
        { error: "Invalid subscription configuration" },
        { status: 500 }
      );
    }

    // Build update params
    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: [
        {
          id: currentItemId,
          price: newPriceId,
        },
      ],
      proration_behavior: prorationBehavior as Stripe.SubscriptionUpdateParams.ProrationBehavior,
    };

    // Handle billing cycle anchor
    if (billingCycleAnchor === "period_end") {
      updateParams.billing_cycle_anchor = "unchanged";
    } else if (billingCycleAnchor === "now") {
      updateParams.billing_cycle_anchor = "now";
    }

    // Update subscription in Stripe
    const updatedStripeSubscription = await stripe.subscriptions.update(
      activeSubscription.stripeSubscriptionId,
      updateParams,
      {
        idempotencyKey: `subscription-update-${userId}-${newPriceId}-${Date.now()}`,
      }
    );

    // Update local subscription record (Stripe webhooks will sync full details)
    await db
      .update(subscriptions)
      .set({
        planId: newPlan.id,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, activeSubscription.id));

    requestLogger.info(
      {
        subscriptionId: activeSubscription.id,
        newStatus: updatedStripeSubscription.status,
      },
      "Subscription updated successfully"
    );

    // Return normalized subscription
    return NextResponse.json({
      success: true,
      subscription: {
        id: activeSubscription.id,
        stripeSubscriptionId: updatedStripeSubscription.id,
        status: updatedStripeSubscription.status,
        planId: newPlan.id,
        planName: newPlan.name,
        currentPeriodStart: (updatedStripeSubscription as unknown as { current_period_start?: number }).current_period_start
          ? new Date((updatedStripeSubscription as unknown as { current_period_start?: number }).current_period_start! * 1000).toISOString()
          : null,
        currentPeriodEnd: (updatedStripeSubscription as unknown as { current_period_end?: number }).current_period_end
          ? new Date((updatedStripeSubscription as unknown as { current_period_end?: number }).current_period_end! * 1000).toISOString()
          : null,
        prorationBehavior,
        billingCycleAnchor,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    requestLogger.error({ error: errorMessage }, "Subscription update error");

    // Handle Stripe-specific errors
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message, code: err.code, requestId },
        { status: err.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage, requestId },
      { status: 500 }
    );
  }
}
