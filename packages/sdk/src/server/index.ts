// Server-side utilities for @drew/billing-sdk
// These should only be used in server contexts (API routes, Server Components, etc.)

import { BillingSDK } from "../index";

export interface ServerConfig {
  baseUrl: string;
  apiKey?: string;
}

export function createServerBilling(config: ServerConfig) {
  return new BillingSDK({
    baseUrl: config.baseUrl,
    timeout: 60000, // Longer timeout for server operations
  });
}

// Helper to check entitlements in middleware/API routes
export async function checkEntitlements(
  config: ServerConfig,
  userId: string
) {
  const billing = createServerBilling(config);
  return billing.getEntitlements(userId);
}

// Helper for feature gating in API routes
export async function requireFeature(
  config: ServerConfig,
  userId: string,
  feature: string
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const billing = createServerBilling(config);
  const hasFeature = await billing.hasFeature({ userId, feature });

  if (!hasFeature) {
    return {
      allowed: false,
      reason: `Feature "${feature}" not available on current plan`,
    };
  }

  return { allowed: true };
}

// Helper for subscription requirement
export async function requireSubscription(
  config: ServerConfig,
  userId: string
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const billing = createServerBilling(config);
  const hasSub = await billing.hasActiveSubscription(userId);

  if (!hasSub) {
    return {
      allowed: false,
      reason: "Active subscription required",
    };
  }

  return { allowed: true };
}
