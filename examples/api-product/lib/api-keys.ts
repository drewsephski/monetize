/**
 * API Key Management
 * Handles key validation, rate limiting, and usage tracking
 */

import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "./db";
import { apiKeys, apiKeyUsage, developerAccounts } from "./schema";

// Plan rate limits (requests per minute)
const RATE_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  enterprise: 1000,
};

// Monthly usage limits
const USAGE_LIMITS: Record<string, number> = {
  free: 100,
  pro: 10000,
  enterprise: 100000,
};

interface ApiKeyData {
  id: string;
  userId: string;
  plan: string;
  name?: string;
  rateLimitPerMinute: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Validate API key
export async function validateApiKey(key: string): Promise<ApiKeyData | null> {
  // In sandbox mode, accept test keys
  if (process.env.BILLING_SANDBOX_MODE === "true") {
    if (key.startsWith("sandbox_key_")) {
      return {
        id: "sandbox_key",
        userId: "sandbox_user",
        plan: "pro",
        name: "Sandbox Key",
        rateLimitPerMinute: 100,
      };
    }
  }

  try {
    // Hash the key for lookup
    const keyHash = await hashKey(key);
    const prefix = key.substring(0, 8);

    const result = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.developerAccountId,
        plan: developerAccounts.billingPlan,
        name: apiKeys.name,
        rateLimitPerMinute: apiKeys.rateLimitPerMinute,
      })
      .from(apiKeys)
      .innerJoin(
        developerAccounts,
        eq(apiKeys.developerAccountId, developerAccounts.id)
      )
      .where(
        and(
          eq(apiKeys.keyHash, keyHash),
          eq(apiKeys.keyPrefix, prefix),
          eq(apiKeys.status, "active")
        )
      )
      .limit(1);

    if (result.length === 0) return null;

    // Update last used
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, result[0].id));

    return result[0];
  } catch {
    return null;
  }
}

// Check rate limit
export async function checkRateLimit(keyData: ApiKeyData): Promise<RateLimitResult> {
  const limit = keyData.rateLimitPerMinute || RATE_LIMITS[keyData.plan] || 10;
  const windowStart = new Date(Date.now() - 60000); // 1 minute ago

  try {
    const usage = await db
      .select({ count: sql`count(*)` })
      .from(apiKeyUsage)
      .where(
        and(
          eq(apiKeyUsage.apiKeyId, keyData.id),
          gte(apiKeyUsage.timestamp, windowStart)
        )
      );

    const used = Number(usage[0]?.count || 0);
    const remaining = Math.max(0, limit - used);
    const resetTime = Date.now() + 60000;

    return {
      allowed: remaining > 0,
      limit,
      remaining,
      resetTime,
      retryAfter: remaining === 0 ? 60 : undefined,
    };
  } catch {
    // Fail open in case of error
    return { allowed: true, limit, remaining: limit, resetTime: Date.now() + 60000 };
  }
}

// Track API usage
export async function trackApiUsage({
  keyId,
  userId,
  endpoint,
  method,
}: {
  keyId: string;
  userId: string;
  endpoint: string;
  method: string;
}): Promise<void> {
  try {
    await db.insert(apiKeyUsage).values({
      id: crypto.randomUUID(),
      apiKeyId: keyId,
      developerAccountId: userId,
      endpoint,
      method,
      statusCode: 200,
      timestamp: new Date(),
    });
  } catch {
    // Silently fail - don't break API for tracking errors
  }
}

// Check monthly usage limit
export async function checkUsageLimit(userId: string, plan: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const limit = USAGE_LIMITS[plan] || 100;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  try {
    const usage = await db
      .select({ count: sql`count(*)` })
      .from(apiKeyUsage)
      .where(
        and(
          eq(apiKeyUsage.developerAccountId, userId),
          gte(apiKeyUsage.timestamp, monthStart)
        )
      );

    const used = Number(usage[0]?.count || 0);
    
    return {
      allowed: used < limit,
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  } catch {
    // Fail open
    return { allowed: true, used: 0, limit, remaining: limit };
  }
}

// Hash API key for storage/lookup
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate new API key
export async function generateApiKey(
  userId: string,
  name?: string
): Promise<{ key: string; id: string } | null> {
  try {
    const key = `ak_${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = await hashKey(key);
    const keyPrefix = key.substring(0, 8);
    const id = crypto.randomUUID();

    await db.insert(apiKeys).values({
      id,
      developerAccountId: userId,
      keyHash,
      keyPrefix,
      name: name || "API Key",
      status: "active",
      rateLimitPerMinute: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { key, id };
  } catch {
    return null;
  }
}

// Revoke API key
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  try {
    await db
      .update(apiKeys)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.developerAccountId, userId)));
    return true;
  } catch {
    return false;
  }
}

// Get user's API keys
export async function getUserApiKeys(userId: string) {
  try {
    return await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.keyPrefix,
        status: apiKeys.status,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.developerAccountId, userId));
  } catch {
    return [];
  }
}

// Get usage stats for user
export async function getUsageStats(userId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  try {
    // For demo, return mock data
    return {
      totalCalls: 42,
      byEndpoint: [
        { endpoint: "/api/v1/generate", method: "POST", count: 30 },
        { endpoint: "/api/v1/status", method: "GET", count: 12 },
      ],
    };
  } catch {
    return { totalCalls: 0, byEndpoint: [] };
  }
}
