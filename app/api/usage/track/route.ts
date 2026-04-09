import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usageEvents, customers, subscriptions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/billing/stripe";
import { trackMetric } from "@/lib/billing/metrics";

interface UsageTrackRequest {
  userId: string;
  feature: string;
  quantity: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /api/usage/track
 *
 * Records usage for metered billing and syncs to Stripe.
 * Core API for usage-based billing.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body: UsageTrackRequest = await request.json();
    const { userId, feature, quantity, timestamp, metadata } = body;

    // Validate required fields
    if (!userId || !feature || typeof quantity !== "number") {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, feature, quantity",
          requestId,
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        {
          error: "Quantity must be positive",
          requestId,
        },
        { status: 400 }
      );
    }

    // Get customer for this user
    const customer = await db
      .select({ id: customers.id, stripeCustomerId: customers.stripeCustomerId })
      .from(customers)
      .where(eq(customers.userId, userId))
      .limit(1);

    if (!customer.length) {
      return NextResponse.json(
        {
          error: "Customer not found for user",
          requestId,
        },
        { status: 404 }
      );
    }

    const customerId = customer[0].id;

    // Record the usage event
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
    const [usageEvent] = await db
      .insert(usageEvents)
      .values({
        userId,
        customerId,
        feature,
        quantity,
        timestamp: eventTimestamp,
        syncedToStripe: false,
        metadata: metadata || {},
      })
      .returning({ id: usageEvents.id });

    // Try to sync to Stripe if this is a metered feature
    let stripeRecordId: string | null = null;
    let syncError: string | null = null;

    try {
      // Find active subscription with metered billing for this feature
      const subscription = await db
        .select({
          id: subscriptions.id,
          stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.customerId, customerId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      if (subscription.length) {
        // Get the subscription items to find the metered one
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription[0].stripeSubscriptionId
        );

        // Find the subscription item for this feature
        const subscriptionItem = stripeSubscription.items.data.find((item) => {
          const price = item.price;
          // Match by metadata or nickname containing the feature name
          return (
            price.metadata?.feature === feature ||
            price.nickname?.toLowerCase().includes(feature.toLowerCase()) ||
            price.lookup_key?.includes(feature.toLowerCase())
          );
        });

        if (subscriptionItem) {
          // Create usage record in Stripe
          const usageRecord = await (stripe.subscriptionItems as unknown as {
            createUsageRecord: (
              id: string,
              params: { quantity: number; timestamp: number; action: string }
            ) => Promise<{ subscription_item: string }>;
          }).createUsageRecord(subscriptionItem.id, {
            quantity,
            timestamp: Math.floor(eventTimestamp.getTime() / 1000),
            action: "increment",
          });

          stripeRecordId = usageRecord.subscription_item;

          // Mark as synced
          await db
            .update(usageEvents)
            .set({
              syncedToStripe: true,
              syncedAt: new Date(),
              stripeUsageRecordId: stripeRecordId,
            })
            .where(eq(usageEvents.id, usageEvent.id));
        }
      }
    } catch (error) {
      syncError = error instanceof Error ? error.message : String(error);
      logger.warn({
        msg: "Failed to sync usage to Stripe",
        requestId,
        userId,
        feature,
        error: syncError,
      });
      // Don't fail the request - we'll retry later via cron
    }

    // Track metric
    await trackMetric({
      name: "usage_tracked",
      value: quantity,
      dimensions: {
        feature,
        synced: stripeRecordId ? "true" : "false",
      },
    });

    const durationMs = Date.now() - startTime;

    logger.info({
      msg: "Usage tracked",
      requestId,
      userId,
      feature,
      quantity,
      stripeSynced: !!stripeRecordId,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      usageEventId: usageEvent.id,
      stripeSynced: !!stripeRecordId,
      stripeRecordId,
      syncError,
      meta: {
        requestId,
        durationMs,
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      msg: "Failed to track usage",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    return NextResponse.json(
      {
        error: "Failed to track usage",
        requestId,
        meta: {
          durationMs,
        },
      },
      { status: 500 }
    );
  }
}
