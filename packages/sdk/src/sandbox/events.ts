// Sandbox Event Simulator - Trigger fake Stripe events for testing
// Usage: npx @drew/billing sandbox event <event-type>

import { sandboxStorage } from "./storage.js";
import type { SandboxSubscription, SandboxCheckoutSession } from "./storage.js";

export type SandboxEventType =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed"
  | "customer.created"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed";

interface EventSimulator {
  name: string;
  description: string;
  params: string[];
  simulate: (params: Record<string, string>) => Promise<unknown>;
}

export const eventSimulators: Record<SandboxEventType, EventSimulator> = {
  "checkout.session.completed": {
    name: "Checkout Session Completed",
    description: "Simulates a successful checkout completion",
    params: ["session_id"],
    simulate: async (params) => {
      const sessionId = params.session_id || params["session-id"];
      if (!sessionId) {
        throw new Error("session_id is required");
      }

      const subscription = sandboxStorage.completeCheckoutSession(sessionId);
      if (!subscription) {
        throw new Error(`No open checkout session found with ID: ${sessionId}`);
      }

      const session = sandboxStorage.getCheckoutSession(sessionId)!;
      sandboxStorage.createEvent("checkout.session.completed", session);

      return {
        session,
        subscription,
        message: "Checkout completed successfully",
      };
    },
  },

  "customer.subscription.created": {
    name: "Subscription Created",
    description: "Creates a new subscription for a customer",
    params: ["customer_id", "price_id"],
    simulate: async (params) => {
      const customerId = params.customer_id || params["customer-id"];
      const priceId = params.price_id || params["price-id"] || "price_free";

      if (!customerId) {
        throw new Error("customer_id is required");
      }

      const customer = sandboxStorage.getCustomer(customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${customerId}`);
      }

      const subscription = sandboxStorage.createSubscription({
        customerId,
        priceId,
        status: "active",
        cancelAtPeriodEnd: false,
        items: [
          {
            id: sandboxStorage["generateId"]("si"),
            priceId,
            quantity: 1,
          },
        ],
      });

      sandboxStorage.createEvent("customer.subscription.created", subscription);

      return {
        subscription,
        message: `Subscription created for ${customer.email}`,
      };
    },
  },

  "customer.subscription.updated": {
    name: "Subscription Updated",
    description: "Updates an existing subscription (upgrade/downgrade)",
    params: ["subscription_id", "new_price_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"];
      const newPriceId = params.new_price_id || params["new-price-id"];

      if (!subscriptionId) {
        throw new Error("subscription_id is required");
      }

      const subscription = sandboxStorage.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      const updates: Partial<typeof subscription> = {};
      if (newPriceId) {
        updates.priceId = newPriceId;
        updates.items = subscription.items.map((item) => ({
          ...item,
          priceId: newPriceId,
        }));
      }

      const updated = sandboxStorage.updateSubscription(subscriptionId, updates);
      sandboxStorage.createEvent("customer.subscription.updated", updated);

      return {
        previous: subscription,
        current: updated,
        message: "Subscription updated successfully",
      };
    },
  },

  "customer.subscription.deleted": {
    name: "Subscription Canceled",
    description: "Cancels a subscription immediately",
    params: ["subscription_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"];

      if (!subscriptionId) {
        throw new Error("subscription_id is required");
      }

      const subscription = sandboxStorage.cancelSubscription(subscriptionId, false);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      sandboxStorage.createEvent("customer.subscription.deleted", subscription);

      return {
        subscription,
        message: "Subscription canceled",
      };
    },
  },

  "invoice.payment_succeeded": {
    name: "Payment Succeeded",
    description: "Simulates a successful invoice payment",
    params: ["subscription_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"];

      const invoice = {
        id: sandboxStorage["generateId"]("in"),
        subscription: subscriptionId,
        status: "paid",
        amount: 1900,
        currency: "usd",
        created: Date.now(),
      };

      sandboxStorage.createEvent("invoice.payment_succeeded", invoice);

      return {
        invoice,
        message: "Payment succeeded",
      };
    },
  },

  "invoice.payment_failed": {
    name: "Payment Failed",
    description: "Simulates a failed invoice payment",
    params: ["subscription_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"];

      const invoice = {
        id: sandboxStorage["generateId"]("in"),
        subscription: subscriptionId,
        status: "open",
        amount: 1900,
        currency: "usd",
        created: Date.now(),
        attempt_count: 1,
        next_payment_attempt: Date.now() + 24 * 60 * 60 * 1000,
      };

      // Update subscription status to past_due
      if (subscriptionId) {
        sandboxStorage.updateSubscription(subscriptionId, { status: "past_due" });
      }

      sandboxStorage.createEvent("invoice.payment_failed", invoice);

      return {
        invoice,
        message: "Payment failed - subscription now past_due",
      };
    },
  },

  "customer.created": {
    name: "Customer Created",
    description: "Creates a new customer",
    params: ["email", "name"],
    simulate: async (params) => {
      const email = params.email || `test-${Date.now()}@example.com`;
      const name = params.name || "Test User";

      const customer = sandboxStorage.createCustomer({
        email,
        name,
        subscriptions: [],
      });

      sandboxStorage.createEvent("customer.created", customer);

      return {
        customer,
        message: `Customer created: ${email}`,
      };
    },
  },

  "payment_intent.succeeded": {
    name: "Payment Intent Succeeded",
    description: "Simulates a successful one-time payment",
    params: ["amount"],
    simulate: async (params) => {
      const amount = parseInt(params.amount || "1000", 10);

      const paymentIntent = {
        id: sandboxStorage["generateId"]("pi"),
        amount,
        currency: "usd",
        status: "succeeded",
        created: Date.now(),
      };

      sandboxStorage.createEvent("payment_intent.succeeded", paymentIntent);

      return {
        paymentIntent,
        message: `Payment of $${amount / 100} succeeded`,
      };
    },
  },

  "payment_intent.payment_failed": {
    name: "Payment Intent Failed",
    description: "Simulates a failed one-time payment",
    params: ["amount", "decline_code"],
    simulate: async (params) => {
      const amount = parseInt(params.amount || "1000", 10);
      const declineCode = params.decline_code || "card_declined";

      const paymentIntent = {
        id: sandboxStorage["generateId"]("pi"),
        amount,
        currency: "usd",
        status: "requires_payment_method",
        created: Date.now(),
        last_payment_error: {
          decline_code: declineCode,
          message: "Your card was declined.",
        },
      };

      sandboxStorage.createEvent("payment_intent.payment_failed", paymentIntent);

      return {
        paymentIntent,
        message: `Payment of $${amount / 100} failed: ${declineCode}`,
      };
    },
  },
};

// Helper to simulate an event
export async function simulateEvent(
  eventType: SandboxEventType,
  params: Record<string, string> = {}
): Promise<unknown> {
  const simulator = eventSimulators[eventType];
  if (!simulator) {
    throw new Error(`Unknown event type: ${eventType}`);
  }

  return simulator.simulate(params);
}

// List available events
export function listAvailableEvents(): Array<{
  type: SandboxEventType;
  name: string;
  description: string;
  params: string[];
}> {
  return Object.entries(eventSimulators).map(([type, simulator]) => ({
    type: type as SandboxEventType,
    name: simulator.name,
    description: simulator.description,
    params: simulator.params,
  }));
}
