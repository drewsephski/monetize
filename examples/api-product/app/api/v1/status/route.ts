import { NextRequest, NextResponse } from "next/server";

/**
 * Status endpoint - returns API status
 * Protected by API key middleware
 */

export async function GET(request: NextRequest) {
  const plan = request.headers.get("x-plan");

  return NextResponse.json({
    status: "operational",
    version: "1.0.0",
    plan,
    timestamp: new Date().toISOString(),
  });
}
