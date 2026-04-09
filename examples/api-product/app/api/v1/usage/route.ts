import { NextRequest, NextResponse } from "next/server";

/**
 * Usage endpoint - returns current API usage stats
 * Protected by API key middleware
 */

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const plan = request.headers.get("x-plan");

  // Mock usage data
  const limits: Record<string, number> = {
    free: 100,
    pro: 10000,
    enterprise: 100000,
  };

  const usage = {
    totalCalls: 42,
    limit: limits[plan || "free"] || 100,
    period: "monthly",
    periodStart: new Date().toISOString(),
    byEndpoint: [
      { endpoint: "/api/v1/generate", method: "POST", count: 30 },
      { endpoint: "/api/v1/status", method: "GET", count: 12 },
    ],
  };

  return NextResponse.json({
    success: true,
    data: {
      userId,
      plan,
      ...usage,
      remaining: Math.max(0, usage.limit - usage.totalCalls),
    },
  });
}
