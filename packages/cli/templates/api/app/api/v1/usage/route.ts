import { NextRequest, NextResponse } from "next/server";
import { getPlanLimits } from "@/lib/api-keys";

export async function GET(request: NextRequest) {
  const plan = request.headers.get("x-plan") || "free";
  const limits = getPlanLimits(plan);
  const totalCalls = plan === "enterprise" ? 1820 : plan === "pro" ? 420 : 32;

  return NextResponse.json({
    success: true,
    data: {
      totalCalls,
      limit: limits.monthly,
      remaining: Math.max(0, limits.monthly - totalCalls),
      byEndpoint: [
        { endpoint: "/api/v1/generate", method: "POST", count: Math.round(totalCalls * 0.71) },
        { endpoint: "/api/v1/status", method: "GET", count: Math.round(totalCalls * 0.29) },
      ],
    },
  });
}
