import { NextRequest, NextResponse } from "next/server";
import { parseSandboxKey } from "@/lib/api-keys";

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get("x-api-key");
  const parsed = parseSandboxKey(apiKey);

  if (!parsed) {
    return NextResponse.json(
      {
        error: "Missing or invalid API key.",
        message: "Use a `sandbox_key_*` credential while testing locally.",
        docs: "https://billing.drew.dev/docs",
        upgradeUrl: "/pricing",
      },
      { status: 401 }
    );
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-id", parsed.userId);
  headers.set("x-plan", parsed.plan);

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: "/api/v1/:path*",
};
