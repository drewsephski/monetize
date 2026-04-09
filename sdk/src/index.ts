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
import { createLicenseManager } from "./license";
import type { TrackUsageOptions, TrackUsageResult, GetUsageOptions, GetUsageResult } from "./usage";
import type { LicenseOptions, LicenseManager, LicenseValidationResult } from "./license";
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
  private licenseManager: LicenseManager | null = null;
  private licenseValidated: boolean = false;

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

    // Initialize license manager if license key provided
    if (options.license) {
      this.initializeLicense(options.license);
    }

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

  private async initializeLicense(options: LicenseOptions): Promise<void> {
    try {
      this.licenseManager = await createLicenseManager(this.client, options);
      this.licenseValidated = true;
    } catch {
      // License validation will fail lazily when features are accessed
      this.licenseValidated = false;
    }
  }

  /**
   * Validate the SDK license
   * Returns license details if valid, throws error if invalid
   */
  async validateLicense(): Promise<LicenseValidationResult> {
    if (!this.licenseManager) {
      throw new BillingError(
        "No license key configured. Set license.licenseKey in BillingSDK options.",
        BillingErrorCode.UNAUTHORIZED,
        401
      );
    }

    const result = await this.licenseManager.validate();
    this.licenseValidated = result.valid;
    return result;
  }

  /**
   * Check if the SDK license has a specific feature
   */
  async licenseHasFeature(feature: string): Promise<boolean> {
    if (!this.licenseManager) {
      return false; // No license = no premium features
    }

    return this.licenseManager.hasFeature(feature);
  }

  /**
   * Check license usage limits
   */
  async checkLicenseUsage(metric: string, increment: number = 0): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.licenseManager) {
      return { allowed: false, remaining: 0 };
    }

    return this.licenseManager.checkUsage(metric, increment);
  }

  /**
   * Get the license manager instance
   */
  getLicenseManager(): LicenseManager | null {
    return this.licenseManager;
  }

  /**
   * Check if license has been validated
   */
  isLicenseValid(): boolean {
    return this.licenseValidated;
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
  createLicenseManager,
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
  LicenseOptions,
  LicenseManager,
  LicenseValidationResult,
};
