import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Map plan IDs to Stripe price IDs from environment variables
const PRICE_MAP: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  scale: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { planId, priceId: directPriceId, userId, successUrl, cancelUrl, trialDays } = await request.json();

    // Support both planId (mapped to env var) or direct priceId
    const priceId = directPriceId || PRICE_MAP[planId] || "";

    if (!priceId) {
      return NextResponse.json({ 
        error: `Missing priceId for plan: ${planId}. Ensure NEXT_PUBLIC_STRIPE_PRICE_${planId?.toUpperCase()} is set in .env.local` 
      }, { status: 400 });
    }

    const sandboxEnabled =
      process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true" ||
      process.env.BILLING_SANDBOX_MODE === "true" ||
      !process.env.STRIPE_SECRET_KEY;

    if (sandboxEnabled) {
      return NextResponse.json({
        sandbox: true,
        url: `${origin}/dashboard?plan=${encodeURIComponent(planId || "starter")}&sandbox=1`,
      });
    }

    // Get user email from session/auth (simplified - implement your auth check)
    const userEmail = request.headers.get("x-user-email") || undefined;

    // Create or retrieve Stripe customer
    let customerId: string | undefined;
    
    // Check if user already has a Stripe customer ID (from your database)
    // This is simplified - in production, query your DB for existing customer
    // For now, we store/retrieve customer ID from metadata during creation
    if (userId) {
      // In production, replace this with a database query:
      // const dbCustomer = await db.customers.findFirst({ where: { userId } });
      // customerId = dbCustomer?.stripeCustomerId;
      
      // For now, we'll create a new customer each time or use email lookup
      if (userEmail) {
        const existingCustomers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });
        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        }
      }
    }

    // Create new customer if none exists
    if (!customerId && userEmail) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: userId || "anonymous" },
      });
      customerId = customer.id;
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${origin}/dashboard?success=true`,
      cancel_url: cancelUrl || `${origin}/pricing`,
      client_reference_id: userId,
      ...(customerId && { customer: customerId }),
      subscription_data: trialDays && trialDays > 0
        ? { trial_period_days: trialDays }
        : undefined,
      allow_promotion_codes: true,
      billing_address_collection: "required",
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
