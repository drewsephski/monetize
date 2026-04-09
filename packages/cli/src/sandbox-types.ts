// Sandbox types for CLI - copied from SDK to avoid monorepo import issues
// This keeps the CLI self-contained

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

// Simple in-memory storage for CLI sandbox mode
class SimpleSandboxStorage {
  private events: Array<{
    id: string;
    type: string;
    created: number;
    data: unknown;
  }> = [];

  generateId(prefix: string): string {
    return `${prefix}_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  createEvent(type: string, data: unknown) {
    const event = {
      id: this.generateId("evt"),
      type,
      created: Date.now(),
      data,
    };
    this.events.push(event);
    return event;
  }

  getEvents() {
    return [...this.events];
  }
}

const storage = new SimpleSandboxStorage();

export const eventSimulators: Record<SandboxEventType, EventSimulator> = {
  "checkout.session.completed": {
    name: "Checkout Session Completed",
    description: "Simulates a successful checkout completion",
    params: ["session_id"],
    simulate: async (params) => {
      const sessionId = params.session_id || params["session-id"] || storage.generateId("cs");

      const session = {
        id: sessionId,
        status: "complete",
        customer: storage.generateId("cus"),
        subscription: storage.generateId("sub"),
      };

      const event = storage.createEvent("checkout.session.completed", session);

      return {
        session,
        event,
        message: "Checkout completed successfully",
      };
    },
  },

  "customer.subscription.created": {
    name: "Subscription Created",
    description: "Creates a new subscription for a customer",
    params: ["customer_id", "price_id"],
    simulate: async (params) => {
      const customerId = params.customer_id || params["customer-id"] || storage.generateId("cus");
      const priceId = params.price_id || params["price-id"] || "price_free";

      const subscription = {
        id: storage.generateId("sub"),
        customer: customerId,
        status: "active",
        items: [{ price: priceId, quantity: 1 }],
        current_period_start: Date.now(),
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      const event = storage.createEvent("customer.subscription.created", subscription);

      return {
        subscription,
        event,
        message: `Subscription created for ${customerId}`,
      };
    },
  },

  "customer.subscription.updated": {
    name: "Subscription Updated",
    description: "Updates an existing subscription (upgrade/downgrade)",
    params: ["subscription_id", "new_price_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"] || storage.generateId("sub");
      const newPriceId = params.new_price_id || params["new-price-id"] || "price_pro";

      const subscription = {
        id: subscriptionId,
        status: "active",
        items: [{ price: newPriceId, quantity: 1 }],
        previous_attributes: { items: [{ price: "price_old" }] },
      };

      const event = storage.createEvent("customer.subscription.updated", subscription);

      return {
        subscription,
        event,
        message: "Subscription updated successfully",
      };
    },
  },

  "customer.subscription.deleted": {
    name: "Subscription Canceled",
    description: "Cancels a subscription immediately",
    params: ["subscription_id"],
    simulate: async (params) => {
      const subscriptionId = params.subscription_id || params["subscription-id"] || storage.generateId("sub");

      const subscription = {
        id: subscriptionId,
        status: "canceled",
        canceled_at: Date.now(),
      };

      const event = storage.createEvent("customer.subscription.deleted", subscription);

      return {
        subscription,
        event,
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
        id: storage.generateId("in"),
        subscription: subscriptionId,
        status: "paid",
        amount_due: 1900,
        currency: "usd",
        created: Date.now(),
      };

      const event = storage.createEvent("invoice.payment_succeeded", invoice);

      return {
        invoice,
        event,
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
        id: storage.generateId("in"),
        subscription: subscriptionId,
        status: "open",
        amount_due: 1900,
        currency: "usd",
        created: Date.now(),
        attempt_count: 1,
        next_payment_attempt: Date.now() + 24 * 60 * 60 * 1000,
      };

      const event = storage.createEvent("invoice.payment_failed", invoice);

      return {
        invoice,
        event,
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

      const customer = {
        id: storage.generateId("cus"),
        email,
        name,
        created: Date.now(),
      };

      const event = storage.createEvent("customer.created", customer);

      return {
        customer,
        event,
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
        id: storage.generateId("pi"),
        amount,
        currency: "usd",
        status: "succeeded",
        created: Date.now(),
      };

      const event = storage.createEvent("payment_intent.succeeded", paymentIntent);

      return {
        paymentIntent,
        event,
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
        id: storage.generateId("pi"),
        amount,
        currency: "usd",
        status: "requires_payment_method",
        created: Date.now(),
        last_payment_error: {
          decline_code: declineCode,
          message: "Your card was declined.",
        },
      };

      const event = storage.createEvent("payment_intent.payment_failed", paymentIntent);

      return {
        paymentIntent,
        event,
        message: `Payment of $${amount / 100} failed: ${declineCode}`,
      };
    },
  },
};

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
