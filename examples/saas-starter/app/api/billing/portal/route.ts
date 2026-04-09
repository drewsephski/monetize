import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { userId, returnUrl } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // In production: Look up the customer's Stripe customer ID from your database
    // const customer = await db.query.customers.findFirst({
    //   where: eq(customers.userId, userId),
    // });
    // const stripeCustomerId = customer?.stripeCustomerId;

    // For the starter, we'll create a configuration that allows account creation
    // In production, you should have already created the customer during checkout
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price", "promotion_code"],
          proration_behavior: "create_prorations",
        },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
      },
    });

    // Create a portal session
    // Note: In production, you need a real stripeCustomerId
    // This will fail in the starter without a real customer
    // For demo purposes, we return a mock URL or error
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("test")) {
      // Return a mock response for testing
      return NextResponse.json({
        url: returnUrl || `${req.headers.get("origin")}/dashboard`,
        message: "Mock portal session - configure with real Stripe customer ID in production",
      });
    }

    // Create the portal session with the configuration
    const session = await stripe.billingPortal.sessions.create({
      configuration: configuration.id,
      // customer: stripeCustomerId, // Uncomment when you have real customer IDs
      return_url: returnUrl || `${req.headers.get("origin")}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
