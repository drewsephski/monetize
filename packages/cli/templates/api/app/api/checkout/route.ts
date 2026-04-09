import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Map tier/plan IDs to Stripe price IDs from environment variables
const PRICE_MAP: Record<string, string> = {
  free: process.env.NEXT_PUBLIC_STRIPE_PRICE_FREE || "",
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
  scale: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { tier, planId, priceId: directPriceId, userId, apiKeyId, successUrl, cancelUrl } = await request.json();

    // Support both tier/planId (mapped to env var) or direct priceId
    const priceId = directPriceId || PRICE_MAP[tier] || PRICE_MAP[planId] || "";

    // Check sandbox mode
    const sandboxEnabled =
      process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true" ||
      process.env.BILLING_SANDBOX_MODE === "true" ||
      !process.env.STRIPE_SECRET_KEY;

    if (sandboxEnabled) {
      return NextResponse.json({
        sandbox: true,
        url: `${origin}/dashboard?plan=${encodeURIComponent(tier || planId || "pro")}&apiKey=${encodeURIComponent(apiKeyId || "")}&sandbox=1`,
      });
    }

    if (!priceId) {
      return NextResponse.json({ 
        error: `Missing priceId for tier: ${tier || planId}. Ensure NEXT_PUBLIC_STRIPE_PRICE_${(tier || planId)?.toUpperCase()} is set in .env.local` 
      }, { status: 400 });
    }

    // Get user email from auth header
    const userEmail = request.headers.get("x-user-email") || undefined;

    // Find or create Stripe customer
    let customerId: string | undefined;
    
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    if (!customerId && userEmail) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: userId || "anonymous", apiKeyId: apiKeyId || "" },
      });
      customerId = customer.id;
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${origin}/api-keys?success=true`,
      cancel_url: cancelUrl || `${origin}/api-keys`,
      client_reference_id: userId,
      ...(customerId && { customer: customerId }),
      metadata: { apiKeyId: apiKeyId || "", tier: tier || "pro" },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("API checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout." },
      { status: 500 }
    );
  }
}
