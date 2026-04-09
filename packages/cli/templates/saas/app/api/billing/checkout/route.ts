import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId." }, { status: 400 });
    }

    const sandboxEnabled =
      process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true" ||
      process.env.BILLING_SANDBOX_MODE === "true" ||
      !process.env.STRIPE_SECRET_KEY;

    if (sandboxEnabled) {
      return NextResponse.json({
        sandbox: true,
        url: `${origin}/dashboard?plan=${encodeURIComponent(planId)}&sandbox=1`,
      });
    }

    // Replace this with a real Stripe Checkout session when wiring production billing.
    return NextResponse.json(
      {
        error: "Stripe Checkout is not configured yet. Enable sandbox mode or plug in your live Checkout session creation here.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
