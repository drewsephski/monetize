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

export * from "./types";
