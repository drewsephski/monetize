import Stripe from "stripe";

export async function createStripeProducts(
  apiKey: string
): Promise<Array<{ id: string; name: string; priceId: string }>> {
  const stripe = new Stripe(apiKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  const products: Array<{ id: string; name: string; priceId: string }> = [];

  // Pro Plan
  const proProduct = await stripe.products.create({
    name: "Pro",
    description: "For growing businesses",
    metadata: {
      tier: "pro",
      features: JSON.stringify([
        "10,000 API calls/mo",
        "Unlimited projects",
        "Priority support",
        "Advanced analytics",
      ]),
    },
  });

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2900,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: "pro_monthly",
  });

  products.push({ id: proProduct.id, name: "Pro", priceId: proPrice.id });

  // Enterprise Plan
  const enterpriseProduct = await stripe.products.create({
    name: "Enterprise",
    description: "For large organizations",
    metadata: {
      tier: "enterprise",
      features: JSON.stringify([
        "Unlimited API calls",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated support",
      ]),
    },
  });

  const enterprisePrice = await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 9900,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: "enterprise_monthly",
  });

  products.push({
    id: enterpriseProduct.id,
    name: "Enterprise",
    priceId: enterprisePrice.id,
  });

  // Usage-based plan (for metered billing)
  const usageProduct = await stripe.products.create({
    name: "API Calls",
    description: "Per-call pricing for API usage",
    metadata: {
      type: "usage",
      unit: "api_call",
    },
  });

  const usagePrice = await stripe.prices.create({
    product: usageProduct.id,
    unit_amount: 1, // $0.01 per call
    currency: "usd",
    recurring: {
      interval: "month",
      usage_type: "metered",
    },
    lookup_key: "api_calls",
  });

  products.push({
    id: usageProduct.id,
    name: "API Calls (Usage)",
    priceId: usagePrice.id,
  });

  return products;
}
