import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type Stripe from "stripe";
import type * as schema from "@/drizzle/schema";

export type DatabaseTransaction = NodePgDatabase<typeof schema>;

export interface EventHandlerContext {
  event: Stripe.Event;
  stripe: Stripe;
  tx: DatabaseTransaction;
  logger: import("pino").Logger;
}

export type EventHandler = (context: EventHandlerContext) => Promise<void>;

export const SUPPORTED_EVENTS = [
  // Checkout
  "checkout.session.completed",

  // Subscription lifecycle
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.past_due",

  // Invoice & Payment
  "invoice.created",
  "invoice.finalized",
  "invoice.payment_succeeded",
  "invoice.payment_failed",

  // Charge status
  "charge.succeeded",
  "charge.failed",

  // Customer cleanup
  "customer.deleted",
] as const;

export type SupportedEventType = (typeof SUPPORTED_EVENTS)[number];

export function isSupportedEventType(eventType: string): eventType is SupportedEventType {
  return SUPPORTED_EVENTS.includes(eventType as SupportedEventType);
}
