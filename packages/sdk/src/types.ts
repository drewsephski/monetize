export interface CheckoutOptions {
  priceId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialActive?: boolean;
  trialEndsAt?: string;
}

export interface SubscriptionResult {
  hasSubscription: boolean;
  subscription: Subscription | null;
}

export interface SubscriptionUpdateOptions {
  userId: string;
  newPriceId: string;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface SubscriptionUpdateResult {
  url: string;
  subscriptionId: string;
}

export interface PortalOptions {
  userId: string;
  returnUrl?: string;
}

export interface PortalResult {
  url: string;
  sessionId: string;
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

export interface TrackUsageOptions {
  userId: string;
  feature: string;
  quantity: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackUsageResult {
  success: boolean;
  usageEventId: string;
  stripeSynced: boolean;
  stripeRecordId?: string;
}

export interface GetUsageOptions {
  userId: string;
  feature?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface UsageDataPoint {
  timestamp: string;
  quantity: number;
  feature: string;
}

export interface GetUsageResult {
  userId: string;
  totalUsage: number;
  period: {
    start: string;
    end: string;
  };
  byFeature: Record<string, number>;
  dataPoints: UsageDataPoint[];
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
