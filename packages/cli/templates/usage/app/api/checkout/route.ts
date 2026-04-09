import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const planCredits: Record<string, number> = {
  starter: 25,
  studio: 500,
  scale: 2000,
};

// Map plan IDs to Stripe price IDs from environment variables
const PRICE_MAP: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
  studio: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  scale: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE || process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { planId, priceId: directPriceId, credits, userId, successUrl, cancelUrl } = await request.json();
    const totalCredits = Number(credits) || planCredits[planId] || 25;

    // Support both planId (mapped to env var) or direct priceId
    const priceId = directPriceId || PRICE_MAP[planId] || "";

    // Check sandbox mode
    const sandboxEnabled =
      process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true" ||
      process.env.BILLING_SANDBOX_MODE === "true" ||
      !process.env.STRIPE_SECRET_KEY;

    if (sandboxEnabled) {
      return NextResponse.json({
        sandbox: true,
        url: `${origin}/dashboard?plan=${encodeURIComponent(planId || "starter")}&credits=${totalCredits}`,
      });
    }

    if (!priceId) {
      return NextResponse.json({ 
        error: `Missing priceId for plan: ${planId}. Ensure NEXT_PUBLIC_STRIPE_PRICE_${planId?.toUpperCase()} is set in .env.local` 
      }, { status: 400 });
    }

    // Get user email from auth
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
        metadata: { userId: userId || "anonymous", credits: String(totalCredits) },
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
      mode: "payment", // Usage-based billing typically uses payment mode for credits
      success_url: successUrl || `${origin}/dashboard?success=true&credits=${totalCredits}`,
      cancel_url: cancelUrl || `${origin}/pricing`,
      client_reference_id: userId,
      ...(customerId && { customer: customerId }),
      metadata: { credits: String(totalCredits), planId: planId || "starter" },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout." },
      { status: 500 }
    );
  }
}
