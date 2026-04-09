import { NextResponse } from "next/server";

// This route creates a Stripe Checkout session
// In production, you'd integrate with @drew/billing-sdk

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();

    // In sandbox mode, return a fake checkout URL
    if (process.env.BILLING_SANDBOX_MODE === "true") {
      return NextResponse.json({
        url: `/sandbox/checkout?plan=${planId}&session_id=cs_sandbox_${Date.now()}`,
        sandbox: true,
      });
    }

    // In production, create a real Stripe Checkout session
    // const session = await billing.createCheckout({
    //   planId,
    //   successUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    //   cancelUrl: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    // });

    // return NextResponse.json({ url: session.url });

    return NextResponse.json(
      { error: "Stripe not configured. Set up your Stripe keys or enable sandbox mode." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
