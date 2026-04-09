"use client";

import { useState, useEffect, useCallback } from "react";
import { BillingSDK } from "../index";
import type {
  Entitlements,
  Subscription,
  SubscriptionUpdateOptions,
  SubscriptionUpdateResult,
  PortalOptions,
} from "../types";

// Initialize SDK instance (should be done once)
let sdkInstance: BillingSDK | null = null;

function getSDK(): BillingSDK {
  if (!sdkInstance) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    sdkInstance = new BillingSDK({
      baseUrl,
      timeout: 30000,
    });
  }
  return sdkInstance;
}

// ============================================================================
// useSubscription Hook
// ============================================================================

export interface UseSubscriptionResult {
  subscription: Subscription | null;
  hasSubscription: boolean;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateSubscription: (
    options: Omit<SubscriptionUpdateOptions, "userId">
  ) => Promise<SubscriptionUpdateResult>;
}

export function useSubscription(userId: string): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getSDK().getSubscription(userId);
      setSubscription(result.subscription);
      setHasSubscription(result.hasSubscription);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSubscription = useCallback(
    async (
      options: Omit<SubscriptionUpdateOptions, "userId">
    ): Promise<SubscriptionUpdateResult> => {
      const result = await getSDK().updateSubscription({
        userId,
        ...options,
      });
      // Refetch after update
      await fetchSubscription();
      return result;
    },
    [userId, fetchSubscription]
  );

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    hasSubscription,
    loading,
    error,
    refetch: fetchSubscription,
    updateSubscription,
  };
}

// ============================================================================
// useEntitlements Hook
// ============================================================================

export interface UseEntitlementsResult {
  entitlements: Entitlements | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEntitlements(userId: string): UseEntitlementsResult {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntitlements = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getSDK().getEntitlements(userId);
      setEntitlements(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  return {
    entitlements,
    loading,
    error,
    refetch: fetchEntitlements,
  };
}

// ============================================================================
// useFeature Hook
// ============================================================================

export interface UseFeatureResult {
  hasFeature: boolean;
  limit: number | null;
  currentUsage: number;
  loading: boolean;
  error: Error | null;
  check: () => Promise<boolean>;
}

export function useFeature(
  userId: string,
  featureName: string
): UseFeatureResult {
  const [hasFeature, setHasFeature] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkFeature = useCallback(async (): Promise<boolean> => {
    if (!userId || !featureName) {
      setHasFeature(false);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const featureCheck = await getSDK().hasFeature({
        userId,
        feature: featureName,
      });

      // Get full entitlements to extract limit and usage
      const entitlements = await getSDK().getEntitlements(userId);

      setHasFeature(featureCheck);
      setLimit(entitlements.limits[featureName] ?? null);
      setCurrentUsage(entitlements.usage?.[featureName] ?? 0);

      return featureCheck;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setHasFeature(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, featureName]);

  useEffect(() => {
    checkFeature();
  }, [checkFeature]);

  return {
    hasFeature,
    limit,
    currentUsage,
    loading,
    error,
    check: checkFeature,
  };
}

// ============================================================================
// useBilling Hook (Combined)
// ============================================================================

export interface UseBillingResult {
  // Subscription
  subscription: Subscription | null;
  hasSubscription: boolean;
  subscriptionLoading: boolean;
  subscriptionError: Error | null;

  // Entitlements
  entitlements: Entitlements | null;
  entitlementsLoading: boolean;
  entitlementsError: Error | null;

  // Actions
  refetch: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<{ url: string }>;
  openCustomerPortal: (returnUrl?: string) => Promise<{ url: string }>;
}

export function useBilling(userId: string): UseBillingResult {
  const subscription = useSubscription(userId);
  const entitlements = useEntitlements(userId);

  const refetch = useCallback(async () => {
    await Promise.all([subscription.refetch(), entitlements.refetch()]);
  }, [subscription, entitlements]);

  const createCheckout = useCallback(
    async (priceId: string): Promise<{ url: string }> => {
      const result = await getSDK().createCheckout({
        priceId,
        userId,
      });
      return { url: result };
    },
    [userId]
  );

  const openCustomerPortal = useCallback(
    async (returnUrl?: string): Promise<{ url: string }> => {
      const options: PortalOptions = { userId };
      if (returnUrl) options.returnUrl = returnUrl;
      const url = await getSDK().getPortalUrl(options);
      return { url };
    },
    [userId]
  );

  return {
    subscription: subscription.subscription,
    hasSubscription: subscription.hasSubscription,
    subscriptionLoading: subscription.loading,
    subscriptionError: subscription.error,

    entitlements: entitlements.entitlements,
    entitlementsLoading: entitlements.loading,
    entitlementsError: entitlements.error,

    refetch,
    createCheckout,
    openCustomerPortal,
  };
}
