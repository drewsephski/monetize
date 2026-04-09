import { NextRequest, NextResponse } from "next/server";

const planCredits: Record<string, number> = {
  starter: 25,
  studio: 500,
  scale: 2000,
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const { planId, credits } = await request.json();
    const totalCredits = Number(credits) || planCredits[planId] || 25;

    return NextResponse.json({
      sandbox: true,
      url: `${origin}/dashboard?plan=${encodeURIComponent(planId || "starter")}&credits=${totalCredits}`,
    });
  } catch (error) {
    console.error("AI credits checkout error", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
