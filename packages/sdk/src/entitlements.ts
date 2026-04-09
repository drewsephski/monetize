import { BillingClient } from "./client";
import { Entitlements, FeatureCheckOptions, PlanRequirementOptions } from "./types";

export function hasActiveSubscription(client: BillingClient) {
  return async (userId: string): Promise<boolean> => {
    const result = await client.request<Entitlements>(
      "GET",
      `/api/entitlements/${userId}`
    );

    return result.hasActiveSubscription;
  };
}

export function getEntitlements(client: BillingClient) {
  return async (userId: string): Promise<Entitlements> => {
    return client.request<Entitlements>("GET", `/api/entitlements/${userId}`);
  };
}

export function hasFeature(client: BillingClient) {
  return async (options: FeatureCheckOptions): Promise<boolean> => {
    const result = await client.request<Entitlements>(
      "GET",
      `/api/entitlements/${options.userId}`
    );

    return result.features.includes(options.feature);
  };
}

export function hasPlan(client: BillingClient) {
  return async (options: PlanRequirementOptions): Promise<boolean> => {
    const result = await client.request<Entitlements>(
      "GET",
      `/api/entitlements/${options.userId}`
    );

    const requiredPlans = Array.isArray(options.requiredPlan)
      ? options.requiredPlan
      : [options.requiredPlan];

    return requiredPlans.includes(result.plan || "free");
  };
}

export function getFeatureLimits(client: BillingClient) {
  return async (userId: string, metric: string): Promise<number> => {
    const result = await client.request<Entitlements>(
      "GET",
      `/api/entitlements/${userId}`
    );

    return result.limits[metric] || 0;
  };
}

export function isTrialActive(client: BillingClient) {
  return async (userId: string): Promise<boolean> => {
    const result = await client.request<Entitlements>(
      "GET",
      `/api/entitlements/${userId}`
    );

    return result.trialActive;
  };
}
