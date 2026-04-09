import { BillingClient } from "./client";
import { CheckoutOptions, CheckoutResult } from "./types";

export function createCheckout(client: BillingClient) {
  return async (options: CheckoutOptions): Promise<string> => {
    const result = await client.request<CheckoutResult>("POST", "/api/checkout", {
      priceId: options.priceId,
      userId: options.userId,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl,
    });

    return result.url;
  };
}
