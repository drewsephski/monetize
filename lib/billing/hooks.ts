// Billing Hooks System
// Allows developers to register callbacks for billing events

export interface PaymentFailedContext {
  userId: string;
  customerId: string;
  subscriptionId: string | null;
  invoiceId: string;
  amount: number;
  currency: string;
  attemptCount: number;
  nextPaymentAttempt: Date | null;
}

export interface SubscriptionStatusChangeContext {
  userId: string;
  customerId: string;
  subscriptionId: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
}

export interface TrialEndingContext {
  userId: string;
  customerId: string;
  subscriptionId: string;
  trialEndsAt: Date;
  daysRemaining: number;
}

// Hook registry
const hooks = {
  onPaymentFailed: [] as Array<(context: PaymentFailedContext) => Promise<void> | void>,
  onSubscriptionStatusChange: [] as Array<(context: SubscriptionStatusChangeContext) => Promise<void> | void>,
  onTrialEnding: [] as Array<(context: TrialEndingContext) => Promise<void> | void>,
  onSubscriptionCreated: [] as Array<(context: { userId: string; customerId: string; subscriptionId: string; planId: string | null }) => Promise<void> | void>,
};

export const billingHooks = {
  // Register a payment failure handler
  onPaymentFailed(callback: (context: PaymentFailedContext) => Promise<void> | void) {
    hooks.onPaymentFailed.push(callback);
    return () => {
      const index = hooks.onPaymentFailed.indexOf(callback);
      if (index > -1) hooks.onPaymentFailed.splice(index, 1);
    };
  },

  // Register a subscription status change handler
  onSubscriptionStatusChange(callback: (context: SubscriptionStatusChangeContext) => Promise<void> | void) {
    hooks.onSubscriptionStatusChange.push(callback);
    return () => {
      const index = hooks.onSubscriptionStatusChange.indexOf(callback);
      if (index > -1) hooks.onSubscriptionStatusChange.splice(index, 1);
    };
  },

  // Register a trial ending handler
  onTrialEnding(callback: (context: TrialEndingContext) => Promise<void> | void) {
    hooks.onTrialEnding.push(callback);
    return () => {
      const index = hooks.onTrialEnding.indexOf(callback);
      if (index > -1) hooks.onTrialEnding.splice(index, 1);
    };
  },

  // Register a subscription created handler
  onSubscriptionCreated(callback: (context: { userId: string; customerId: string; subscriptionId: string; planId: string | null }) => Promise<void> | void) {
    hooks.onSubscriptionCreated.push(callback);
    return () => {
      const index = hooks.onSubscriptionCreated.indexOf(callback);
      if (index > -1) hooks.onSubscriptionCreated.splice(index, 1);
    };
  },

  // Execute hooks (internal use)
  async executePaymentFailed(context: PaymentFailedContext) {
    for (const callback of hooks.onPaymentFailed) {
      try {
        await callback(context);
      } catch (err) {
        console.error("Payment failed hook error:", err);
      }
    }
  },

  async executeSubscriptionStatusChange(context: SubscriptionStatusChangeContext) {
    for (const callback of hooks.onSubscriptionStatusChange) {
      try {
        await callback(context);
      } catch (err) {
        console.error("Subscription status change hook error:", err);
      }
    }
  },

  async executeTrialEnding(context: TrialEndingContext) {
    for (const callback of hooks.onTrialEnding) {
      try {
        await callback(context);
      } catch (err) {
        console.error("Trial ending hook error:", err);
      }
    }
  },

  async executeSubscriptionCreated(context: { userId: string; customerId: string; subscriptionId: string; planId: string | null }) {
    for (const callback of hooks.onSubscriptionCreated) {
      try {
        await callback(context);
      } catch (err) {
        console.error("Subscription created hook error:", err);
      }
    }
  },
};
