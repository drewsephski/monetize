import Stripe from "stripe";

// Helper to find or create a product with a lookup key
async function findOrCreatePrice(
  stripe: Stripe,
  productData: {
    name: string;
    description: string;
    metadata: Record<string, string>;
  },
  priceData: {
    unit_amount: number;
    currency: string;
    recurring?: { interval: "month"; usage_type?: "metered" };
    lookup_key: string;
  }
): Promise<{ productId: string; priceId: string; name: string }> {
  // First, try to find an existing price with this lookup key
  try {
    const existingPrices = await stripe.prices.search({
      query: `lookup_key:"${priceData.lookup_key}"`,
    });

    if (existingPrices.data.length > 0) {
      const existingPrice = existingPrices.data[0];
      const product = await stripe.products.retrieve(
        typeof existingPrice.product === "string"
          ? existingPrice.product
          : existingPrice.product.id
      );
      return {
        productId: product.id,
        priceId: existingPrice.id,
        name: product.name,
      };
    }
  } catch {
    // Search failed, continue to create new
  }

  // Create new product and price
  const product = await stripe.products.create(productData);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: priceData.unit_amount,
    currency: priceData.currency,
    recurring: priceData.recurring,
    lookup_key: priceData.lookup_key,
  });

  return { productId: product.id, priceId: price.id, name: product.name };
}

export async function createStripeProducts(
  apiKey: string
): Promise<Array<{ id: string; name: string; priceId: string }>> {
  const stripe = new Stripe(apiKey, {
    apiVersion: "2023-10-16",
  });

  const products: Array<{ id: string; name: string; priceId: string }> = [];

  // Pro Plan
  try {
    const pro = await findOrCreatePrice(
      stripe,
      {
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
      },
      {
        unit_amount: 2900,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: `pro_monthly_${Date.now()}`, // Unique lookup key
      }
    );
    products.push({ id: pro.productId, name: pro.name, priceId: pro.priceId });
  } catch (error) {
    console.warn("Failed to create Pro plan:", error instanceof Error ? error.message : String(error));
  }

  // Enterprise Plan
  try {
    const enterprise = await findOrCreatePrice(
      stripe,
      {
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
      },
      {
        unit_amount: 9900,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: `enterprise_monthly_${Date.now()}`, // Unique lookup key
      }
    );
    products.push({
      id: enterprise.productId,
      name: enterprise.name,
      priceId: enterprise.priceId,
    });
  } catch (error) {
    console.warn("Failed to create Enterprise plan:", error instanceof Error ? error.message : String(error));
  }

  // Usage-based plan (for metered billing)
  try {
    const usage = await findOrCreatePrice(
      stripe,
      {
        name: "API Calls",
        description: "Per-call pricing for API usage",
        metadata: {
          type: "usage",
          unit: "api_call",
        },
      },
      {
        unit_amount: 1, // $0.01 per call
        currency: "usd",
        recurring: {
          interval: "month",
          usage_type: "metered",
        },
        lookup_key: `api_calls_${Date.now()}`, // Unique lookup key
      }
    );
    products.push({
      id: usage.productId,
      name: "API Calls (Usage)",
      priceId: usage.priceId,
    });
  } catch (error) {
    console.warn("Failed to create Usage plan:", error instanceof Error ? error.message : String(error));
  }

  if (products.length === 0) {
    throw new Error("Failed to create any Stripe products. Check your API key and try again.");
  }

  return products;
}
