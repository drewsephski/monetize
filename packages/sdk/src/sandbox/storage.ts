// Sandbox storage - mimics Stripe's state without API calls
// Uses memory for Node.js, localStorage for browser

export interface SandboxCheckoutSession {
  id: string;
  url: string;
  status: "open" | "complete" | "expired";
  customerEmail?: string;
  lineItems: Array<{
    priceId: string;
    quantity: number;
  }>;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
  createdAt: number;
  subscriptionId?: string;
}

export interface SandboxSubscription {
  id: string;
  customerId: string;
  status: "active" | "canceled" | "incomplete" | "past_due" | "trialing";
  priceId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialStart?: number;
  trialEnd?: number;
  items: Array<{
    id: string;
    priceId: string;
    quantity: number;
  }>;
}

export interface SandboxCustomer {
  id: string;
  email: string;
  name?: string;
  subscriptions: string[];
  createdAt: number;
}

export interface SandboxEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: unknown;
  };
}

class SandboxStorage {
  private storage: Map<string, unknown> = new Map();
  private events: SandboxEvent[] = [];
  private customers: Map<string, SandboxCustomer> = new Map();
  private sessions: Map<string, SandboxCheckoutSession> = new Map();
  private subscriptions: Map<string, SandboxSubscription> = new Map();

  // ID generation
  generateId(prefix: string): string {
    return `${prefix}_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  // Customer methods
  createCustomer(data: Omit<SandboxCustomer, "id" | "createdAt">): SandboxCustomer {
    const customer: SandboxCustomer = {
      ...data,
      id: this.generateId("cus"),
      createdAt: Date.now(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  getCustomer(id: string): SandboxCustomer | undefined {
    return this.customers.get(id);
  }

  getCustomerByEmail(email: string): SandboxCustomer | undefined {
    return Array.from(this.customers.values()).find((c) => c.email === email);
  }

  // Checkout session methods
  createCheckoutSession(
    data: Omit<SandboxCheckoutSession, "id" | "createdAt">
  ): SandboxCheckoutSession {
    const session: SandboxCheckoutSession = {
      ...data,
      id: this.generateId("cs"),
      createdAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getCheckoutSession(id: string): SandboxCheckoutSession | undefined {
    return this.sessions.get(id);
  }

  completeCheckoutSession(sessionId: string): SandboxSubscription | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    // Update session status
    session.status = "complete";
    this.sessions.set(sessionId, session);

    // Get or create customer
    let customer = session.customerEmail
      ? this.getCustomerByEmail(session.customerEmail)
      : null;

    if (!customer && session.customerEmail) {
      customer = this.createCustomer({
        email: session.customerEmail,
        subscriptions: [],
      });
    }

    // Create subscription if subscription mode
    if (session.mode === "subscription" && customer) {
      const priceId = session.lineItems[0]?.priceId;
      if (priceId) {
        const subscription = this.createSubscription({
          customerId: customer.id,
          priceId,
          status: "active",
          cancelAtPeriodEnd: false,
          items: session.lineItems.map((item) => ({
            id: this.generateId("si"),
            priceId: item.priceId,
            quantity: item.quantity,
          })),
        });
        session.subscriptionId = subscription.id;
        return subscription;
      }
    }

    return null;
  }

  // Subscription methods
  createSubscription(
    data: Omit<SandboxSubscription, "id" | "currentPeriodStart" | "currentPeriodEnd">
  ): SandboxSubscription {
    const now = Date.now();
    const subscription: SandboxSubscription = {
      ...data,
      id: this.generateId("sub"),
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    this.subscriptions.set(subscription.id, subscription);

    // Update customer's subscriptions
    const customer = this.customers.get(data.customerId);
    if (customer) {
      customer.subscriptions.push(subscription.id);
    }

    return subscription;
  }

  getSubscription(id: string): SandboxSubscription | undefined {
    return this.subscriptions.get(id);
  }

  getSubscriptionsByCustomer(customerId: string): SandboxSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.customerId === customerId
    );
  }

  updateSubscription(
    id: string,
    updates: Partial<SandboxSubscription>
  ): SandboxSubscription | null {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;

    Object.assign(subscription, updates);
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  cancelSubscription(id: string, atPeriodEnd = false): SandboxSubscription | null {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;

    if (atPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = "canceled";
    }

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  // Event methods
  createEvent(type: string, data: unknown): SandboxEvent {
    const event: SandboxEvent = {
      id: this.generateId("evt"),
      type,
      created: Date.now(),
      data: { object: data },
    };
    this.events.push(event);
    return event;
  }

  getEvents(): SandboxEvent[] {
    return [...this.events];
  }

  // Generic storage for other data
  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.storage.get(key) as T | undefined;
  }

  // Clear all data (for testing)
  clear(): void {
    this.storage.clear();
    this.events = [];
    this.customers.clear();
    this.sessions.clear();
    this.subscriptions.clear();
  }

  // Get all state (for debugging)
  getState() {
    return {
      customers: Array.from(this.customers.values()),
      sessions: Array.from(this.sessions.values()),
      subscriptions: Array.from(this.subscriptions.values()),
      events: this.events,
    };
  }
}

// Singleton instance
export const sandboxStorage = new SandboxStorage();

// Browser storage wrapper for isomorphic usage
export function getSandboxStorage(): SandboxStorage {
  return sandboxStorage;
}
