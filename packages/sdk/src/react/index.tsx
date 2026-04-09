"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { BillingSDK } from "../index";
import type { BillingClientOptions, Entitlements } from "../types";

// Context for billing SDK
interface BillingContextValue {
  sdk: BillingSDK;
  userId: string;
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

interface BillingProviderProps {
  children: React.ReactNode;
  config: BillingClientOptions;
  userId: string;
}

export function BillingProvider({ children, config, userId }: BillingProviderProps) {
  const [sdk] = useState(() => new BillingSDK(config));
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await sdk.getEntitlements(userId);
      setEntitlements(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [sdk, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <BillingContext.Provider
      value={{ sdk, userId, entitlements, isLoading, error, refresh }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within BillingProvider");
  }
  return context;
}

export function useEntitlements() {
  const { entitlements, isLoading, error, refresh } = useBilling();
  return { entitlements, isLoading, error, refresh };
}

export function useHasFeature(feature: string) {
  const { entitlements, isLoading } = useBilling();
  return {
    hasFeature: entitlements?.features.includes(feature) ?? false,
    isLoading,
  };
}

export function useSubscription() {
  const { entitlements, isLoading } = useBilling();
  return {
    hasSubscription: entitlements?.hasActiveSubscription ?? false,
    plan: entitlements?.plan ?? "free",
    isTrial: entitlements?.trialActive ?? false,
    trialEndsAt: entitlements?.trialEndsAt,
    isLoading,
  };
}

export function useFeatureLimit(feature: string) {
  const { entitlements, isLoading } = useBilling();
  return {
    limit: entitlements?.limits[feature] ?? 0,
    current: entitlements?.usage?.[feature] ?? 0,
    remaining: Math.max(
      0,
      (entitlements?.limits[feature] ?? 0) -
        (entitlements?.usage?.[feature] ?? 0)
    ),
    isLoading,
  };
}

// Hook for checkout
export function useCheckout() {
  const { sdk, userId } = useBilling();
  const [isLoading, setIsLoading] = useState(false);

  const checkout = useCallback(
    async (priceId: string) => {
      setIsLoading(true);
      try {
        const result = await sdk.createCheckout({
          priceId,
          userId,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        });
        window.location.href = result.url;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, userId]
  );

  return { checkout, isLoading };
}

// Hook for billing portal
export function useBillingPortal() {
  const { sdk, userId } = useBilling();
  const [isLoading, setIsLoading] = useState(false);

  const openPortal = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sdk.getPortalUrl({
        userId,
        returnUrl: window.location.href,
      });
      window.location.href = result.url;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, userId]);

  return { openPortal, isLoading };
}

// Hook for usage tracking
export function useTrackUsage() {
  const { sdk, userId } = useBilling();

  const track = useCallback(
    async (feature: string, quantity: number = 1) => {
      return sdk.trackUsage({
        userId,
        feature,
        quantity,
      });
    },
    [sdk, userId]
  );

  return { track };
}
