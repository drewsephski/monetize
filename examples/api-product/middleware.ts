import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, checkRateLimit, trackApiUsage } from "./lib/api-keys";

// Public routes that don't need API key
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/signin",
  "/signup",
  "/dashboard",
  "/api/auth",
  "/api/checkout",
  "/api/billing",
  "/api/sandbox",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip API key validation for non-API routes
  if (!path.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  // Get API key from header
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing API key",
        message: "Include X-API-Key header with your API key",
        docs: "https://billing.drew.dev/docs/api-keys",
      },
      { status: 401 }
    );
  }

  // Validate API key
  const keyData = await validateApiKey(apiKey);
  if (!keyData) {
    return NextResponse.json(
      {
        error: "Invalid API key",
        message: "The provided API key is invalid or revoked",
      },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(keyData);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: `Limit: ${rateLimit.limit} requests per minute. Upgrade your plan for higher limits.`,
        retryAfter: rateLimit.retryAfter,
        upgradeUrl: "/pricing",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      }
    );
  }

  // Track usage
  await trackApiUsage({
    keyId: keyData.id,
    userId: keyData.userId,
    endpoint: path,
    method: request.method,
  });

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", keyData.userId);
  requestHeaders.set("x-plan", keyData.plan);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/api/v1/:path*",
};
