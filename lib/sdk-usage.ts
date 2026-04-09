/**
 * SDK Usage Tracking and Enforcement
 * 
 * Tracks API calls and enforces usage limits for SDK licenses.
 * Returns 429 errors when limits are exceeded.
 */

import { db } from '@/lib/db';
import { sdkLicenses, sdkLicenseUsage } from '@/drizzle/schema';
import { eq, sql, and, gte, lt } from 'drizzle-orm';

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  current: number;
  limit: number;
  resetAt?: Date;
  error?: string;
}

export interface TrackUsageResult {
  success: boolean;
  allowed: boolean;
  remaining: number;
  error?: string;
}

// Default usage limits by tier
const TIER_LIMITS: Record<string, Record<string, number>> = {
  free: {
    apiCalls: 1000,
    projects: 1,
    teamMembers: 1,
  },
  pro: {
    apiCalls: 10000,
    projects: 5,
    teamMembers: 3,
  },
  team: {
    apiCalls: 100000,
    projects: 20,
    teamMembers: 10,
  },
  enterprise: {
    apiCalls: -1, // unlimited
    projects: -1,
    teamMembers: -1,
  },
};

/**
 * Get the start of the current billing period (month)
 */
function getCurrentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the end of the current billing period (month)
 */
function getCurrentPeriodEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

/**
 * Check if a license has exceeded its usage limit for a specific metric
 */
export async function checkUsageLimit(
  licenseKey: string,
  metric: string = 'apiCalls'
): Promise<UsageCheckResult> {
  try {
    // Look up the license
    const license = await db.query.sdkLicenses.findFirst({
      where: eq(sdkLicenses.licenseKey, licenseKey),
    });

    if (!license) {
      return {
        allowed: false,
        remaining: 0,
        current: 0,
        limit: 0,
        error: 'License not found',
      };
    }

    if (license.status !== 'active') {
      return {
        allowed: false,
        remaining: 0,
        current: 0,
        limit: 0,
        error: `License is ${license.status}`,
      };
    }

    // Get the limit for this tier and metric
    const tierLimits = license.usageLimits as Record<string, number> || TIER_LIMITS[license.tier] || TIER_LIMITS.free;
    const limit = tierLimits[metric] ?? tierLimits.apiCalls ?? 1000;

    // -1 means unlimited
    if (limit === -1) {
      return {
        allowed: true,
        remaining: Infinity,
        current: 0,
        limit: -1,
      };
    }

    // Get current period
    const periodStart = getCurrentPeriodStart();
    const periodEnd = getCurrentPeriodEnd();

    // Count usage in current period
    const usageResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(sdkLicenseUsage)
      .where(
        and(
          eq(sdkLicenseUsage.licenseId, license.id),
          gte(sdkLicenseUsage.timestamp, periodStart),
          lt(sdkLicenseUsage.timestamp, periodEnd)
        )
      );

    const current = usageResult[0]?.count || 0;
    const remaining = Math.max(0, limit - current);

    return {
      allowed: remaining > 0,
      remaining,
      current,
      limit,
      resetAt: periodEnd,
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      remaining: 0,
      current: 0,
      limit: 0,
      error: 'Failed to check usage limit',
    };
  }
}

/**
 * Track an API call and enforce limits
 * Returns 429-style response if limit exceeded
 */
export async function trackApiCall(
  licenseKey: string,
  eventType: string = 'api_call',
  machineId?: string,
  metadata?: Record<string, unknown>
): Promise<TrackUsageResult> {
  try {
    // Look up the license
    const license = await db.query.sdkLicenses.findFirst({
      where: eq(sdkLicenses.licenseKey, licenseKey),
    });

    if (!license) {
      return {
        success: false,
        allowed: false,
        remaining: 0,
        error: 'License not found',
      };
    }

    if (license.status !== 'active') {
      return {
        success: false,
        allowed: false,
        remaining: 0,
        error: `License is ${license.status}`,
      };
    }

    // Check usage limit before tracking
    const usageCheck = await checkUsageLimit(licenseKey, 'apiCalls');
    
    if (!usageCheck.allowed) {
      return {
        success: false,
        allowed: false,
        remaining: 0,
        error: usageCheck.error || 'Usage limit exceeded. Upgrade your plan or wait until next billing period.',
      };
    }

    // Log the usage event
    await db.insert(sdkLicenseUsage).values({
      licenseId: license.id,
      machineId: machineId || 'unknown',
      eventType,
      metadata: metadata || {},
      timestamp: new Date(),
    });

    // Update current usage in license record
    const newUsage = (license.currentUsage as Record<string, number> || {});
    newUsage.apiCalls = (newUsage.apiCalls || 0) + 1;
    
    await db
      .update(sdkLicenses)
      .set({
        currentUsage: newUsage,
        updatedAt: new Date(),
      })
      .where(eq(sdkLicenses.id, license.id));

    return {
      success: true,
      allowed: true,
      remaining: usageCheck.remaining - 1,
    };
  } catch (error) {
    console.error('Error tracking API call:', error);
    return {
      success: false,
      allowed: false,
      remaining: 0,
      error: 'Failed to track usage',
    };
  }
}

/**
 * Get usage statistics for a license
 */
export async function getLicenseUsage(licenseKey: string): Promise<{
  success: boolean;
  usage?: {
    current: number;
    limit: number;
    remaining: number;
    periodStart: Date;
    periodEnd: Date;
    percentage: number;
  };
  error?: string;
}> {
  try {
    const license = await db.query.sdkLicenses.findFirst({
      where: eq(sdkLicenses.licenseKey, licenseKey),
    });

    if (!license) {
      return {
        success: false,
        error: 'License not found',
      };
    }

    const check = await checkUsageLimit(licenseKey, 'apiCalls');
    
    if (check.error && !check.limit) {
      return {
        success: false,
        error: check.error,
      };
    }

    const percentage = check.limit === -1 
      ? 0 
      : Math.round((check.current / check.limit) * 100);

    return {
      success: true,
      usage: {
        current: check.current,
        limit: check.limit,
        remaining: check.remaining,
        periodStart: getCurrentPeriodStart(),
        periodEnd: getCurrentPeriodEnd(),
        percentage,
      },
    };
  } catch (error) {
    console.error('Error getting license usage:', error);
    return {
      success: false,
      error: 'Failed to get usage statistics',
    };
  }
}

/**
 * Reset usage counters for a new billing period
 * Should be called by a cron job at the start of each month
 */
export async function resetUsageCounters(): Promise<{
  success: boolean;
  resetCount?: number;
  error?: string;
}> {
  try {
    const result = await db
      .update(sdkLicenses)
      .set({
        currentUsage: {},
        updatedAt: new Date(),
      })
      .where(eq(sdkLicenses.status, 'active'));

    return {
      success: true,
      resetCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Error resetting usage counters:', error);
    return {
      success: false,
      error: 'Failed to reset usage counters',
    };
  }
}

/**
 * Middleware helper for API routes
 * Usage: await enforceUsageLimit(req, res, licenseKey)
 */
export async function enforceUsageLimit(
  licenseKey: string
): Promise<{ 
  allowed: boolean; 
  error?: string; 
  headers?: Record<string, string>;
}> {
  const check = await checkUsageLimit(licenseKey, 'apiCalls');

  if (!check.allowed) {
    return {
      allowed: false,
      error: check.error || 'Rate limit exceeded',
      headers: {
        'X-RateLimit-Limit': String(check.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': check.resetAt?.toISOString() || '',
      },
    };
  }

  // Track this call
  await trackApiCall(licenseKey, 'api_call');

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': String(check.limit),
      'X-RateLimit-Remaining': String(check.remaining - 1),
      'X-RateLimit-Reset': check.resetAt?.toISOString() || '',
    },
  };
}
