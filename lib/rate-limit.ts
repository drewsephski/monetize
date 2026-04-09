import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  // Maximum requests allowed in the window
  max: number;
  // Time window in seconds
  windowSeconds: number;
  // Optional: Unique identifier for this rate limit (for different endpoints)
  key?: string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Simple in-memory rate limiter for high-performance paths.
 * Uses sliding window algorithm.
 * 
 * For production at scale, replace with Redis (e.g., Upstash Redis).
 */
class MemoryRateLimiter {
  private windows = new Map<string, Array<number>>();

  check(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = `${identifier}:${config.key || "default"}`;

    // Get or create window
    let timestamps = this.windows.get(key) || [];

    // Remove old entries outside the window
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    // Check limit
    if (timestamps.length >= config.max) {
      const oldestTimestamp = timestamps[0];
      const resetAt = new Date(oldestTimestamp + windowMs);
      const retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);

      return {
        success: false,
        limit: config.max,
        remaining: 0,
        resetAt,
        retryAfter,
      };
    }

    // Add current request
    timestamps.push(now);
    this.windows.set(key, timestamps);

    return {
      success: true,
      limit: config.max,
      remaining: config.max - timestamps.length,
      resetAt: new Date(now + windowMs),
    };
  }
}

// Singleton instance
const memoryLimiter = new MemoryRateLimiter();

/**
 * Get rate limit identifier from request.
 * Priority: API key > User ID > IP address
 */
async function getIdentifier(request: NextRequest): Promise<string> {
  // Try API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    return `api:${apiKey.slice(0, 8)}`; // Use prefix only for privacy
  }

  // Try user ID from auth
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware for Next.js API routes.
 * 
 * Usage:
 * export async function POST(request: NextRequest) {
 *   const rateLimit = await checkRateLimit(request, { max: 100, windowSeconds: 60 });
 *   if (!rateLimit.success) {
 *     return NextResponse.json(
 *       { error: "Rate limit exceeded" },
 *       { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
 *     );
 *   }
 *   // ... handle request
 * }
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = await getIdentifier(request);
  return memoryLimiter.check(identifier, config);
}

/**
 * Higher-order function to wrap API routes with rate limiting.
 * 
 * Usage:
 * export const POST = withRateLimit(
 *   { max: 100, windowSeconds: 60 },
 *   async (request) => {
 *     // Handler
 *   }
 * );
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimit = await checkRateLimit(request, config);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(request);
    response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", rateLimit.resetAt.toISOString());

    return response;
  };
}

/**
 * Preset rate limit configurations for common use cases.
 */
export const RateLimitPresets = {
  // Checkout: strict limit to prevent abuse
  checkout: { max: 10, windowSeconds: 60, key: "checkout" },

  // Usage tracking: higher limit but still protected
  usage: { max: 1000, windowSeconds: 60, key: "usage" },

  // General API: moderate limit
  api: { max: 100, windowSeconds: 60, key: "api" },

  // Webhook: very high limit, mostly for safety
  webhook: { max: 10000, windowSeconds: 60, key: "webhook" },

  // Read operations: generous limit
  read: { max: 300, windowSeconds: 60, key: "read" },
} as const;
