import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { customerId, returnUrl } = await request.json();

    // Check if sandbox mode
    const sandboxEnabled =
      process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true" ||
      process.env.BILLING_SANDBOX_MODE === "true" ||
      !process.env.STRIPE_SECRET_KEY;

    if (sandboxEnabled) {
      return NextResponse.json({
        url: `${origin}/dashboard?portal=1`,
        sandbox: true,
      });
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customerId" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Unable to create portal session" },
      { status: 500 }
    );
  }
}
