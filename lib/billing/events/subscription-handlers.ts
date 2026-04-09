import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { customers, subscriptions, plans } from "@/drizzle/schema";
import { billingHooks } from "../hooks";
import type { EventHandlerContext } from "./types";

// Map Stripe subscription status to internal status while preserving original
const statusMap: Record<string, string> = {
  active: "active",
  trialing: "trialing",
  canceled: "canceled",
  past_due: "past_due",
  unpaid: "unpaid",
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  paused: "paused",
};

export async function handleSubscriptionCreated({
  event,
  stripe,
  tx,
  logger,
}: EventHandlerContext) {
  const subscription = event.data.object as Stripe.Subscription;
  const eventTimestamp = new Date(event.created * 1000);

  logger.info(
    { subscriptionId: subscription.id, customerId: subscription.customer },
    "Processing subscription created"
  );

  // Find customer in our database
  const customer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, subscription.customer as string),
  });

  if (!customer) {
    logger.error(
      { stripeCustomerId: subscription.customer },
      "Customer not found for subscription"
    );
    throw new Error(
      `Customer not found: ${subscription.customer}`
    );
  }

  // Fetch full subscription details from Stripe for complete data
  const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);

  // Map status preserving original Stripe status
  const stripeStatus = fullSubscription.status;
  const internalStatus = statusMap[stripeStatus] || "unknown";

  // Get plan information
  const priceId = fullSubscription.items.data[0]?.price.id;
  const plan = priceId
    ? await tx.query.plans.findFirst({
        where: eq(plans.stripePriceId, priceId),
      })
    : null;

  // Type assertion needed for Stripe SDK types
  const subData = fullSubscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    trial_start?: number;
    trial_end?: number;
    cancel_at_period_end?: boolean;
  };

  // Check for existing subscription (idempotency)
  const existing = await tx.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, fullSubscription.id),
  });

  if (existing) {
    // Check for out-of-order event
    if (
      existing.lastEventTimestamp &&
      eventTimestamp < existing.lastEventTimestamp
    ) {
      logger.info(
        { existingTimestamp: existing.lastEventTimestamp, eventTimestamp },
        "Ignoring stale subscription.created event"
      );
      return;
    }

    // Update existing
    await tx
      .update(subscriptions)
      .set({
        stripeStatus,
        status: internalStatus,
        planId: plan?.id || null,
        currentPeriodStart: subData.current_period_start
          ? new Date(subData.current_period_start * 1000)
          : null,
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000)
          : null,
        trialStart: subData.trial_start
          ? new Date(subData.trial_start * 1000)
          : null,
        trialEnd: subData.trial_end
          ? new Date(subData.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: subData.cancel_at_period_end ?? false,
        lastEventTimestamp: eventTimestamp,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));

    logger.info({ subscriptionId: existing.id }, "Updated existing subscription");
  } else {
    // Create new subscription
    const [newSubscription] = await tx
      .insert(subscriptions)
      .values({
        customerId: customer.id,
        stripeSubscriptionId: fullSubscription.id,
        stripeStatus,
        status: internalStatus,
        planId: plan?.id || null,
        currentPeriodStart: subData.current_period_start
          ? new Date(subData.current_period_start * 1000)
          : null,
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000)
          : null,
        trialStart: subData.trial_start
          ? new Date(subData.trial_start * 1000)
          : null,
        trialEnd: subData.trial_end
          ? new Date(subData.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: subData.cancel_at_period_end ?? false,
        lastEventTimestamp: eventTimestamp,
      })
      .returning();

    logger.info(
      { subscriptionId: newSubscription.id },
      "Created new subscription"
    );

    // Trigger subscription created hook
    await billingHooks.executeSubscriptionCreated({
      userId: customer.userId,
      customerId: customer.id,
      subscriptionId: newSubscription.id,
      planId: plan?.id || null,
    });
  }
}

export async function handleSubscriptionUpdated({
  event,
  stripe,
  tx,
  logger,
}: EventHandlerContext) {
  const subscription = event.data.object as Stripe.Subscription;
  const eventTimestamp = new Date(event.created * 1000);

  logger.info(
    { subscriptionId: subscription.id, status: subscription.status },
    "Processing subscription updated"
  );

  // Find existing subscription
  const existing = await tx.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (!existing) {
    // Subscription doesn't exist yet - treat as created
    logger.warn(
      { subscriptionId: subscription.id },
      "Subscription not found for update, treating as create"
    );
    return handleSubscriptionCreated({ event, stripe, tx, logger });
  }

  // Check for out-of-order event
  if (
    existing.lastEventTimestamp &&
    eventTimestamp < existing.lastEventTimestamp
  ) {
    logger.info(
      { existingTimestamp: existing.lastEventTimestamp, eventTimestamp },
      "Ignoring stale subscription.updated event"
    );
    return;
  }

  // Fetch full subscription from Stripe
  const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);

  // Map status
  const stripeStatus = fullSubscription.status;
  const internalStatus = statusMap[stripeStatus] || "unknown";

  // Get plan
  const priceId = fullSubscription.items.data[0]?.price.id;
  const plan = priceId
    ? await tx.query.plans.findFirst({
        where: eq(plans.stripePriceId, priceId),
      })
    : null;

  // Type assertion for Stripe SDK types
  const subData = fullSubscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    trial_start?: number;
    trial_end?: number;
    canceled_at?: number;
    cancel_at_period_end?: boolean;
  };

  // Check for cancellation
  const canceledAt = subData.canceled_at
    ? new Date(subData.canceled_at * 1000)
    : existing.canceledAt;

  // Track status change for hooks
  const oldStatus = existing.status;

  await tx
    .update(subscriptions)
    .set({
      stripeStatus,
      status: internalStatus,
      planId: plan?.id || null,
      currentPeriodStart: subData.current_period_start
        ? new Date(subData.current_period_start * 1000)
        : existing.currentPeriodStart,
      currentPeriodEnd: subData.current_period_end
        ? new Date(subData.current_period_end * 1000)
        : existing.currentPeriodEnd,
      trialStart: subData.trial_start
        ? new Date(subData.trial_start * 1000)
        : existing.trialStart,
      trialEnd: subData.trial_end
        ? new Date(subData.trial_end * 1000)
        : existing.trialEnd,
      trialActive: subData.trial_end
        ? new Date(subData.trial_end * 1000) > new Date()
        : existing.trialActive,
      canceledAt,
      cancelAtPeriodEnd: subData.cancel_at_period_end ?? false,
      lastEventTimestamp: eventTimestamp,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));

  logger.info(
    { subscriptionId: existing.id, stripeStatus, internalStatus },
    "Updated subscription"
  );

  // Trigger status change hook if status changed
  if (oldStatus !== internalStatus) {
    const customer = await tx.query.customers.findFirst({
      where: eq(customers.id, existing.customerId),
    });

    if (customer) {
      await billingHooks.executeSubscriptionStatusChange({
        userId: customer.userId,
        customerId: customer.id,
        subscriptionId: existing.id,
        oldStatus,
        newStatus: internalStatus,
      });
    }
  }
}

export async function handleSubscriptionDeleted({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const subscription = event.data.object as Stripe.Subscription;
  const eventTimestamp = new Date(event.created * 1000);

  logger.info(
    { subscriptionId: subscription.id },
    "Processing subscription deleted"
  );

  const existing = await tx.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (!existing) {
    logger.warn(
      { subscriptionId: subscription.id },
      "Subscription not found for deletion"
    );
    return;
  }

  // Check for out-of-order event
  if (
    existing.lastEventTimestamp &&
    eventTimestamp < existing.lastEventTimestamp
  ) {
    logger.info(
      { existingTimestamp: existing.lastEventTimestamp, eventTimestamp },
      "Ignoring stale subscription.deleted event"
    );
    return;
  }

  await tx
    .update(subscriptions)
    .set({
      stripeStatus: "canceled",
      status: "canceled",
      canceledAt: new Date(),
      lastEventTimestamp: eventTimestamp,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));

  logger.info({ subscriptionId: existing.id }, "Marked subscription as canceled");
}

export async function handleSubscriptionPastDue({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const subscription = event.data.object as Stripe.Subscription;
  const eventTimestamp = new Date(event.created * 1000);

  logger.info(
    { subscriptionId: subscription.id },
    "Processing subscription past_due"
  );

  const existing = await tx.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (!existing) {
    logger.error(
      { subscriptionId: subscription.id },
      "Subscription not found for past_due"
    );
    return;
  }

  // Check for out-of-order event
  if (
    existing.lastEventTimestamp &&
    eventTimestamp < existing.lastEventTimestamp
  ) {
    logger.info(
      { existingTimestamp: existing.lastEventTimestamp, eventTimestamp },
      "Ignoring stale subscription.past_due event"
    );
    return;
  }

  await tx
    .update(subscriptions)
    .set({
      stripeStatus: "past_due",
      status: "past_due",
      lastEventTimestamp: eventTimestamp,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));

  logger.info(
    { subscriptionId: existing.id },
    "Marked subscription as past_due"
  );
}
