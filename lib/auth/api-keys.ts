import { db } from "@/lib/db";
import { apiKeys, apiKeyUsage, developerAccounts } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import crypto from "crypto";

// API Key format: bill_live_{32 random hex chars}
const KEY_PREFIX = "bill_live_";
const KEY_LENGTH = 32;

export interface CreateApiKeyOptions {
  developerAccountId: string;
  name?: string;
  expiresInDays?: number;
  rateLimitPerMinute?: number;
}

export interface ApiKeyResult {
  id: string;
  key: string; // Full key - only shown once
  name: string | null;
  prefix: string;
  expiresAt: Date | null;
  rateLimitPerMinute: number;
}

export interface ValidateResult {
  valid: boolean;
  keyId?: string;
  developerAccountId?: string;
  rateLimitPerMinute?: number;
  error?: string;
}

/**
 * Generate a cryptographically secure API key.
 */
function generateApiKey(): { fullKey: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(KEY_LENGTH / 2);
  const keyPart = randomBytes.toString("hex");
  const fullKey = `${KEY_PREFIX}${keyPart}`;
  
  // Hash for storage (use first 8 chars as prefix for identification)
  const prefix = keyPart.slice(0, 8);
  const hash = crypto
    .createHash("sha256")
    .update(fullKey)
    .digest("hex");

  return { fullKey, hash, prefix };
}

/**
 * Create a new API key for a developer account.
 */
export async function createApiKey(
  options: CreateApiKeyOptions
): Promise<ApiKeyResult> {
  const { fullKey, hash, prefix } = generateApiKey();

  // Check account is active
  const [account] = await db
    .select({ status: developerAccounts.status, monthlyQuota: developerAccounts.monthlyQuota })
    .from(developerAccounts)
    .where(eq(developerAccounts.id, options.developerAccountId))
    .limit(1);

  if (!account) {
    throw new Error("Developer account not found");
  }

  if (account.status !== "active") {
    throw new Error(`Account status is ${account.status}, cannot create API key`);
  }

  // Check existing key count
  const existingKeys = await db
    .select({ count: sql<number>`count(*)` })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.developerAccountId, options.developerAccountId),
        eq(apiKeys.status, "active")
      )
    );

  const maxKeys = (account.monthlyQuota ?? 0) > 10000 ? 10 : 3; // Pro accounts get more keys
  if (existingKeys[0]?.count >= maxKeys) {
    throw new Error(`Maximum ${maxKeys} API keys allowed for this account`);
  }

  // Calculate expiration
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  // Insert the key
  const [keyRecord] = await db
    .insert(apiKeys)
    .values({
      developerAccountId: options.developerAccountId,
      keyHash: hash,
      keyPrefix: prefix,
      name: options.name || null,
      expiresAt,
      rateLimitPerMinute: options.rateLimitPerMinute || 60,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.keyPrefix,
      expiresAt: apiKeys.expiresAt,
      rateLimitPerMinute: apiKeys.rateLimitPerMinute,
    });

  logger.info({
    msg: "API key created",
    keyId: keyRecord.id,
    developerAccountId: options.developerAccountId,
    prefix,
  });

  return {
    id: keyRecord.id,
    key: fullKey, // Only returned once!
    name: keyRecord.name,
    prefix: keyRecord.prefix,
    expiresAt: keyRecord.expiresAt,
    rateLimitPerMinute: keyRecord.rateLimitPerMinute ?? 60,
  };
}

/**
 * Validate an API key from a request.
 */
export async function validateApiKey(apiKey: string): Promise<ValidateResult> {
  // Check format
  if (!apiKey.startsWith(KEY_PREFIX)) {
    return { valid: false, error: "Invalid API key format" };
  }

  // Hash the provided key
  const hash = crypto.createHash("sha256").update(apiKey).digest("hex");

  // Look up the key
  const [keyRecord] = await db
    .select({
      id: apiKeys.id,
      developerAccountId: apiKeys.developerAccountId,
      status: apiKeys.status,
      expiresAt: apiKeys.expiresAt,
      rateLimitPerMinute: apiKeys.rateLimitPerMinute,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hash))
    .limit(1);

  if (!keyRecord) {
    return { valid: false, error: "API key not found" };
  }

  if (keyRecord.status !== "active") {
    return { valid: false, error: `API key is ${keyRecord.status}` };
  }

  if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
    return { valid: false, error: "API key has expired" };
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id));

  return {
    valid: true,
    keyId: keyRecord.id,
    developerAccountId: keyRecord.developerAccountId,
    rateLimitPerMinute: keyRecord.rateLimitPerMinute ?? 60,
  };
}

/**
 * Revoke an API key.
 */
export async function revokeApiKey(
  keyId: string,
  developerAccountId: string
): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ status: "revoked" })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.developerAccountId, developerAccountId)
      )
    );

  const success = result.rowCount !== null && result.rowCount > 0;

  if (success) {
    logger.info({
      msg: "API key revoked",
      keyId,
      developerAccountId,
    });
  }

  return success;
}

/**
 * Record API key usage for analytics and rate limiting.
 */
export async function recordApiUsage(
  keyId: string,
  developerAccountId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number
): Promise<void> {
  try {
    await db.insert(apiKeyUsage).values({
      apiKeyId: keyId,
      developerAccountId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't fail the request if usage tracking fails
    logger.warn({
      msg: "Failed to record API usage",
      keyId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get API key usage stats for a developer account.
 */
export async function getApiUsageStats(
  developerAccountId: string,
  days: number = 30
): Promise<{
  totalRequests: number;
  avgResponseTime: number;
  byEndpoint: Record<string, number>;
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_requests,
      AVG(response_time_ms)::float as avg_response_time,
      endpoint,
      COUNT(*) as endpoint_count
    FROM api_key_usage
    WHERE developer_account_id = ${developerAccountId}
      AND timestamp > ${since}
    GROUP BY endpoint
  `);

  let totalRequests = 0;
  let totalResponseTime = 0;
  const byEndpoint: Record<string, number> = {};

  for (const row of stats.rows) {
    const count = Number(row.endpoint_count);
    totalRequests += count;
    totalResponseTime += Number(row.avg_response_time) * count;
    byEndpoint[row.endpoint as string] = count;
  }

  const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

  return {
    totalRequests,
    avgResponseTime: Math.round(avgResponseTime || 0),
    byEndpoint,
  };
}

/**
 * List API keys for a developer account (without full keys).
 */
export async function listApiKeys(developerAccountId: string): Promise<
  Array<{
    id: string;
    name: string | null;
    prefix: string;
    status: string;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }>
> {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.keyPrefix,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.developerAccountId, developerAccountId))
    .orderBy(sql`${apiKeys.createdAt} DESC`);
}
