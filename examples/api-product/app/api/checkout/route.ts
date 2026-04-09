import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId." }, { status: 400 });
    }

    return NextResponse.json({
      sandbox: true,
      url: `${origin}/dashboard?plan=${encodeURIComponent(planId)}&sandbox=1`,
    });
  } catch (error) {
    console.error("API checkout error", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
