import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "operational",
    version: "1.0.0",
    plan: request.headers.get("x-plan") || "free",
    timestamp: new Date().toISOString(),
  });
}
