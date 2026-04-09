// Sandbox Stripe Client - Drop-in replacement for Stripe SDK in dev mode
// Simulates Stripe API without making real API calls

import { sandboxStorage } from "./storage.js";
import type { SandboxCheckoutSession, SandboxSubscription, SandboxEvent } from "./storage.js";

export interface SandboxCheckoutParams {
  line_items: Array<{
    price: string;
    quantity: number;
  }>;
  mode?: "subscription" | "payment";
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  subscription_data?: {
    trial_period_days?: number;
    metadata?: Record<string, string>;
  };
}

export interface SandboxCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export class SandboxStripeClient {
  private apiKey: string;
  private isTestMode: boolean;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.isTestMode = apiKey.startsWith("pk_test_") || apiKey.startsWith("sk_test_");
  }

  // Checkout Sessions
  checkout = {
    sessions: {
      create: async (params: SandboxCheckoutParams): Promise<SandboxCheckoutSession> => {
        const session = sandboxStorage.createCheckoutSession({
          url: `/sandbox/checkout?session_id={id}`,
          status: "open",
          customerEmail: params.customer_email,
          lineItems: params.line_items.map((item) => ({
            priceId: item.price,
            quantity: item.quantity,
          })),
          mode: params.mode || "subscription",
          successUrl: params.success_url,
          cancelUrl: params.cancel_url,
        });

        // Update URL with actual ID
        session.url = `/sandbox/checkout?session_id=${session.id}`;

        // Emit event
        sandboxStorage.createEvent("checkout.session.created", session);

        return session;
      },

      retrieve: async (id: string): Promise<SandboxCheckoutSession | null> => {
        return sandboxStorage.getCheckoutSession(id) || null;
      },

      list: async (params?: { customer?: string }): Promise<{ data: SandboxCheckoutSession[] }> => {
        const allSessions = Array.from(
          sandboxStorage.getState().sessions
        );
        const filtered = params?.customer
          ? allSessions.filter((s) => s.customerEmail === params.customer)
          : allSessions;
        return { data: filtered };
      },
    },
  };

  // Customers
  customers = {
    create: async (params: SandboxCustomerParams): Promise<{ id: string; email: string }> => {
      const customer = sandboxStorage.createCustomer({
        email: params.email,
        name: params.name,
        subscriptions: [],
      });

      sandboxStorage.createEvent("customer.created", customer);

      return { id: customer.id, email: customer.email };
    },

    retrieve: async (id: string): Promise<{ id: string; email: string } | null> => {
      const customer = sandboxStorage.getCustomer(id);
      if (!customer) return null;
      return { id: customer.id, email: customer.email };
    },

    list: async (): Promise<{ data: Array<{ id: string; email: string }> }> => {
      const customers = Array.from(sandboxStorage.getState().customers);
      return {
        data: customers.map((c) => ({ id: c.id, email: c.email })),
      };
    },
  };

  // Subscriptions
  subscriptions = {
    create: async (params: {
      customer: string;
      items: Array<{ price: string; quantity?: number }>;
      trial_period_days?: number;
    }): Promise<SandboxSubscription> => {
      const subscription = sandboxStorage.createSubscription({
        customerId: params.customer,
        priceId: params.items[0]?.price || "",
        status: params.trial_period_days ? "trialing" : "active",
        cancelAtPeriodEnd: false,
        items: params.items.map((item, index) => ({
          id: sandboxStorage["generateId"]("si"),
          priceId: item.price,
          quantity: item.quantity || 1,
        })),
        ...(params.trial_period_days && {
          trialStart: Date.now(),
          trialEnd: Date.now() + params.trial_period_days * 24 * 60 * 60 * 1000,
        }),
      });

      sandboxStorage.createEvent("customer.subscription.created", subscription);

      return subscription;
    },

    retrieve: async (id: string): Promise<SandboxSubscription | null> => {
      return sandboxStorage.getSubscription(id) || null;
    },

    update: async (
      id: string,
      params: Partial<SandboxSubscription>
    ): Promise<SandboxSubscription | null> => {
      return sandboxStorage.updateSubscription(id, params);
    },

    cancel: async (
      id: string,
      params?: { at_period_end?: boolean }
    ): Promise<SandboxSubscription | null> => {
      const subscription = sandboxStorage.cancelSubscription(id, params?.at_period_end);
      if (subscription) {
        sandboxStorage.createEvent(
          params?.at_period_end
            ? "customer.subscription.updated"
            : "customer.subscription.deleted",
          subscription
        );
      }
      return subscription;
    },

    list: async (params?: {
      customer?: string;
      status?: string;
    }): Promise<{ data: SandboxSubscription[] }> => {
      let subscriptions = Array.from(sandboxStorage.getState().subscriptions);

      if (params?.customer) {
        subscriptions = subscriptions.filter((s) => s.customerId === params.customer);
      }

      if (params?.status) {
        subscriptions = subscriptions.filter((s) => s.status === params.status);
      }

      return { data: subscriptions };
    },
  };

  // Billing Portal
  billingPortal = {
    sessions: {
      create: async (params: { customer: string; return_url: string }) => {
        return {
          id: sandboxStorage["generateId"]("bps"),
          url: `/sandbox/portal?customer=${params.customer}`,
        };
      },
    },
  };

  // Webhook Events (simulated)
  events = {
    list: async (params?: { type?: string }): Promise<{ data: SandboxEvent[] }> => {
      let events = sandboxStorage.getEvents();
      if (params?.type) {
        events = events.filter((e) => e.type === params.type);
      }
      return { data: events };
    },
  };

  // Test helpers
  _test = {
    completeCheckout: (sessionId: string) => {
      return sandboxStorage.completeCheckoutSession(sessionId);
    },
    simulateEvent: (eventType: string, data: unknown) => {
      return sandboxStorage.createEvent(eventType, data);
    },
    clear: () => {
      sandboxStorage.clear();
    },
    getState: () => {
      return sandboxStorage.getState();
    },
  };
}

// Factory function to create client
export function createSandboxStripeClient(apiKey: string): SandboxStripeClient {
  return new SandboxStripeClient(apiKey);
}

// Helper to check if should use sandbox mode
export function shouldUseSandbox(): boolean {
  if (typeof process !== "undefined" && process.env) {
    return process.env.BILLING_SANDBOX_MODE === "true";
  }
  return false;
}
