import { BillingClient } from "./client";
import {
  SubscriptionResult,
  PortalOptions,
  PortalResult,
  SubscriptionUpdateOptions,
  SubscriptionUpdateResult,
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
  return async (options: SubscriptionUpdateOptions): Promise<SubscriptionUpdateResult> => {
    return client.request<SubscriptionUpdateResult>("POST", "/api/subscription/update", {
      userId: options.userId,
      newPriceId: options.newPriceId,
      prorationBehavior: options.prorationBehavior,
      billingCycleAnchor: options.billingCycleAnchor,
      preview: options.preview,
    });
  };
}

export function getPortalUrl(client: BillingClient) {
  return async (options: PortalOptions): Promise<string> => {
    const result = await client.request<PortalResult>("POST", "/api/customer-portal", {
      userId: options.userId,
      returnUrl: options.returnUrl,
      flow: options.flow,
      subscriptionId: options.subscriptionId,
    });

    return result.url;
  };
}
