import { BillingClient } from "./client";
import { createCheckout } from "./checkout";
import { getSubscription, updateSubscription, getPortalUrl } from "./subscriptions";
import {
  hasActiveSubscription,
  getEntitlements,
  hasFeature,
  hasPlan,
  getFeatureLimits,
  isTrialActive,
} from "./entitlements";
import { trackUsage, getUsage } from "./usage";
import { telemetry, enableTelemetry, isTelemetryEnabled } from "./telemetry";
import type { TrackUsageOptions, TrackUsageResult, GetUsageOptions, GetUsageResult } from "./usage";
import {
  CheckoutOptions,
  CheckoutResult,
  Subscription,
  SubscriptionResult,
  SubscriptionUpdateOptions,
  SubscriptionUpdateResult,
  PortalOptions,
  PortalResult,
  Entitlements,
  UsageTrackOptions,
  UsageResult,
  FeatureCheckOptions,
  PlanRequirementOptions,
  BillingClientOptions,
  BillingError,
  BillingErrorCode,
  RetryConfig,
} from "./types";

export class BillingSDK {
  private client: BillingClient;

  // Checkout
  createCheckout: ReturnType<typeof createCheckout>;

  // Subscriptions
  getSubscription: ReturnType<typeof getSubscription>;
  updateSubscription: ReturnType<typeof updateSubscription>;
  getPortalUrl: ReturnType<typeof getPortalUrl>;

  // Entitlements
  hasActiveSubscription: ReturnType<typeof hasActiveSubscription>;
  getEntitlements: ReturnType<typeof getEntitlements>;
  hasFeature: ReturnType<typeof hasFeature>;
  hasPlan: ReturnType<typeof hasPlan>;
  getFeatureLimits: ReturnType<typeof getFeatureLimits>;
  isTrialActive: ReturnType<typeof isTrialActive>;

  // Usage
  trackUsage: ReturnType<typeof trackUsage>;
  getUsage: ReturnType<typeof getUsage>;

  constructor(options: BillingClientOptions) {
    this.client = new BillingClient(options);

    // Checkout
    this.createCheckout = createCheckout(this.client);

    // Subscriptions
    this.getSubscription = getSubscription(this.client);
    this.updateSubscription = updateSubscription(this.client);
    this.getPortalUrl = getPortalUrl(this.client);

    // Entitlements
    this.hasActiveSubscription = hasActiveSubscription(this.client);
    this.getEntitlements = getEntitlements(this.client);
    this.hasFeature = hasFeature(this.client);
    this.hasPlan = hasPlan(this.client);
    this.getFeatureLimits = getFeatureLimits(this.client);
    this.isTrialActive = isTrialActive(this.client);

    // Usage
    this.trackUsage = trackUsage(this.client);
    this.getUsage = getUsage(this.client);
  }
}

export {
  BillingClient,
  createCheckout,
  getSubscription,
  updateSubscription,
  getPortalUrl,
  hasActiveSubscription,
  getEntitlements,
  hasFeature,
  hasPlan,
  getFeatureLimits,
  isTrialActive,
  trackUsage,
  getUsage,
};

export {
  BillingError,
  BillingErrorCode,
};

export type {
  CheckoutOptions,
  CheckoutResult,
  Subscription,
  SubscriptionResult,
  SubscriptionUpdateOptions,
  SubscriptionUpdateResult,
  PortalOptions,
  PortalResult,
  Entitlements,
  UsageTrackOptions,
  UsageResult,
  FeatureCheckOptions,
  PlanRequirementOptions,
  BillingClientOptions,
  RetryConfig,
  TrackUsageOptions,
  TrackUsageResult,
  GetUsageOptions,
  GetUsageResult,
};
