import type Stripe from "stripe";
import type { EventHandler, SupportedEventType } from "./types";
import { handleCheckoutSessionCompleted } from "./checkout-handlers";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleSubscriptionPastDue,
} from "./subscription-handlers";
import {
  handleInvoiceCreated,
  handleInvoiceFinalized,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
} from "./invoice-handlers";
import { handleChargeSucceeded, handleChargeFailed } from "./charge-handlers";
import { handleCustomerDeleted } from "./customer-handlers";
import { isSupportedEventType } from "./types";
import type { EventHandlerContext } from "./types";

export const eventHandlers: Record<SupportedEventType, EventHandler> = {
  // Checkout
  "checkout.session.completed": handleCheckoutSessionCompleted,

  // Subscription lifecycle
  "customer.subscription.created": handleSubscriptionCreated,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "customer.subscription.past_due": handleSubscriptionPastDue,

  // Invoice & Payment
  "invoice.created": handleInvoiceCreated,
  "invoice.finalized": handleInvoiceFinalized,
  "invoice.payment_succeeded": handleInvoicePaymentSucceeded,
  "invoice.payment_failed": handleInvoicePaymentFailed,

  // Charge status
  "charge.succeeded": handleChargeSucceeded,
  "charge.failed": handleChargeFailed,

  // Customer cleanup
  "customer.deleted": handleCustomerDeleted,
};

export function getEventHandler(eventType: string): EventHandler | null {
  if (!isSupportedEventType(eventType)) {
    return null;
  }

  return eventHandlers[eventType];
}

export async function dispatchStripeEvent(
  context: EventHandlerContext & { event: Stripe.Event }
): Promise<void> {
  const handler = getEventHandler(context.event.type);

  if (!handler) {
    throw new Error(`No handler found for event type: ${context.event.type}`);
  }

  await handler(context);
}

export * from "./types";
