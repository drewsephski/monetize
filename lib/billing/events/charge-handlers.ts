import type { EventHandlerContext } from "./types";
import Stripe from "stripe";

export async function handleChargeSucceeded({
  event,
  logger,
}: EventHandlerContext) {
  const charge = event.data.object as Stripe.Charge;

  logger.info(
    {
      chargeId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      customerId: charge.customer,
    },
    "Processing charge succeeded"
  );

  // Charge events are primarily for logging/tracking
  // The actual subscription status updates are handled by invoice.payment_succeeded
  // This handler can be extended for custom business logic like:
  // - Sending receipts
  // - Updating usage counters
  // - Triggering fulfillment workflows
}

export async function handleChargeFailed({
  event,
  logger,
}: EventHandlerContext) {
  const charge = event.data.object as Stripe.Charge;

  logger.warn(
    {
      chargeId: charge.id,
      amount: charge.amount,
      failureCode: charge.failure_code,
      failureMessage: charge.failure_message,
      customerId: charge.customer,
    },
    "Processing charge failed"
  );

  // Charge failure events are primarily for logging/alerting
  // The actual subscription status updates are handled by invoice.payment_failed
  // This handler can be extended for:
  // - Sending payment failure notifications
  // - Analytics/tracking
  // - Support ticket creation
}
