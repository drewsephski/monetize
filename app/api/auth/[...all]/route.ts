import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Wrap handlers with error handling to prevent 500 errors on Vercel
export async function GET(req: NextRequest) {
  try {
    return await handler.GET(req);
  } catch (error) {
    console.error("[Auth API] GET error:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handler.POST(req);
  } catch (error) {
    console.error("[Auth API] POST error:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}
