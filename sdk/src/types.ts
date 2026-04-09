export interface CheckoutOptions {
  priceId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export interface Subscription {
  id: string;
  status: "active" | "trialing" | "canceled" | "past_due" | "unpaid" | "incomplete";
  planId: string | null;
  currentPeriodEnd: string | null;
  trialActive?: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionResult {
  hasSubscription: boolean;
  subscription: Subscription | null;
}

export interface SubscriptionUpdateOptions {
  userId: string;
  newPriceId: string;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
  billingCycleAnchor?: "now" | "period_end";
  preview?: boolean;
}

export interface SubscriptionUpdateResult {
  success: boolean;
  subscription: {
    id: string;
    stripeSubscriptionId: string;
    status: string;
    planId: string;
    planName: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    prorationBehavior: string;
    billingCycleAnchor: string;
  };
  upcomingInvoice?: {
    amountDue: number;
    currency: string;
    subtotal: number;
    total: number;
    prorationDate: number | null;
    lines: Array<{
      description: string | null;
      amount: number;
      period: { start: number; end: number } | null;
    }>;
  };
  newPlan?: {
    id: string;
    name: string;
    priceId: string;
  };
}

export interface PortalOptions {
  userId: string;
  returnUrl?: string;
  flow?: "payment_method_update" | "subscription_cancel" | "subscription_update";
  subscriptionId?: string;
}

export interface PortalResult {
  url: string;
  sessionId: string;
  flow?: string;
}

export interface Entitlements {
  userId: string;
  plan: string | null;
  hasActiveSubscription: boolean;
  trialActive: boolean;
  trialEndsAt: string | null;
  features: string[];
  limits: Record<string, number>;
  usage?: Record<string, number>;
  subscription: {
    id: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface UsageTrackOptions {
  userId: string;
  metric: string;
  amount: number;
  timestamp?: string;
}

export interface UsageResult {
  success: boolean;
  metric: string;
  total: number;
  period: {
    start: string;
    end: string;
  };
}

export interface FeatureCheckOptions {
  userId: string;
  feature: string;
}

export interface PlanRequirementOptions {
  userId: string;
  requiredPlan: string | string[];
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface BillingClientOptions {
  baseUrl: string;
  timeout?: number;
  retryConfig?: RetryConfig;
}

export enum BillingErrorCode {
  UNKNOWN = "UNKNOWN",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  MAX_RETRIES_EXCEEDED = "MAX_RETRIES_EXCEEDED",
}

export class BillingError extends Error {
  code: BillingErrorCode;
  statusCode: number;
  requestId?: string;

  constructor(
    message: string,
    code: BillingErrorCode,
    statusCode: number,
    requestId?: string
  ) {
    super(message);
    this.name = "BillingError";
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      requestId: this.requestId,
    };
  }
}
