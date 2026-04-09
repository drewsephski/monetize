import { BillingClient } from "./client";
import { CheckoutOptions, CheckoutResult } from "./types";

export function createCheckout(client: BillingClient) {
  return async (options: CheckoutOptions): Promise<CheckoutResult> => {
    return client.request<CheckoutResult>("POST", "/api/checkout", {
      priceId: options.priceId,
      userId: options.userId,
      successUrl: options.successUrl || `${window.location.origin}/checkout/success`,
      cancelUrl: options.cancelUrl || `${window.location.origin}/checkout/cancel`,
      metadata: options.metadata,
    });
  };
}
