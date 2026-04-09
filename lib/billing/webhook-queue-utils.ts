import type Stripe from "stripe";

const RETRY_DELAYS = [60, 300, 900, 3600, 7200]; // seconds: 1min, 5min, 15min, 1hr, 2hr

export function getRetryDelaySeconds(attemptNumber: number): number {
  return RETRY_DELAYS[Math.min(Math.max(attemptNumber - 1, 0), RETRY_DELAYS.length - 1)]!;
}

export function toQueuedStripeEvent(
  stripeEventId: string,
  eventType: string,
  payload: unknown
): Stripe.Event {
  if (!payload || typeof payload !== "object") {
    throw new Error("Queued webhook payload is not a valid Stripe event");
  }

  const event = payload as Partial<Stripe.Event>;
  return {
    ...event,
    id: typeof event.id === "string" ? event.id : stripeEventId,
    type: typeof event.type === "string" ? event.type : eventType,
  } as Stripe.Event;
}

export function getStripeCustomerId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const customer = (payload as {
    data?: { object?: { customer?: unknown } };
  }).data?.object?.customer;

  if (typeof customer === "string") {
    return customer;
  }

  if (
    customer &&
    typeof customer === "object" &&
    "id" in customer &&
    typeof (customer as { id: unknown }).id === "string"
  ) {
    return (customer as { id: string }).id;
  }

  return null;
}
