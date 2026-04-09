import { BillingClient } from "./client";
import {
  SubscriptionResult,
  SubscriptionUpdateOptions,
  SubscriptionUpdateResult,
  PortalOptions,
  PortalResult,
} from "./types";

export function getSubscription(client: BillingClient) {
  return async (userId: string): Promise<SubscriptionResult> => {
    return client.request<SubscriptionResult>(
      "GET",
      `/api/subscription/${userId}`
    );
  };
}

export function updateSubscription(client: BillingClient) {
  return async (
    options: SubscriptionUpdateOptions
  ): Promise<SubscriptionUpdateResult> => {
    return client.request<SubscriptionUpdateResult>(
      "POST",
      "/api/subscription/update",
      {
        userId: options.userId,
        newPriceId: options.newPriceId,
        prorationBehavior: options.prorationBehavior || "create_prorations",
      }
    );
  };
}

export function getPortalUrl(client: BillingClient) {
  return async (options: PortalOptions): Promise<PortalResult> => {
    return client.request<PortalResult>("POST", "/api/customer-portal", {
      userId: options.userId,
      returnUrl:
        options.returnUrl ||
        (typeof window !== "undefined" ? window.location.href : "/"),
    });
  };
}
