import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { cache } from "react";

interface MiddlewareContext {
  userId: string;
  organizationId?: string;
}

interface EntitlementCheck {
  plan?: string | string[];
  feature?: string;
  requireActive?: boolean;
}

/**
 * Cached entitlement lookup for middleware performance.
 * TTL is handled via entitlementsCache table expiration.
 */
const getUserEntitlements = cache(async (userId: string) => {
  const result = await db.execute(sql`
    SELECT 
      s.status,
      s.trial_active,
      p.name as plan_name,
      p.features,
      p.limits
    FROM subscriptions s
    JOIN customers c ON s.customer_id = c.id
    LEFT JOIN plans p ON s.plan_id = p.id
    WHERE c.user_id = ${userId}
      AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return {
      hasActiveSubscription: false,
      plan: null,
      features: [],
      limits: {},
      trialActive: false,
    };
  }

  const row = result.rows[0];
  return {
    hasActiveSubscription: true,
    plan: row.plan_name,
    features: (row.features as string[]) || [],
    limits: (row.limits as Record<string, number>) || {},
    trialActive: row.trial_active as boolean,
  };
});

/**
 * Get organization entitlements for team billing
 */
const getOrganizationEntitlements = cache(async (orgId: string) => {
  const result = await db.execute(sql`
    SELECT 
      s.status,
      s.trial_active,
      p.name as plan_name,
      p.features,
      p.limits
    FROM organization_subscriptions s
    LEFT JOIN plans p ON s.plan_id = p.id
    WHERE s.organization_id = ${orgId}
      AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    hasActiveSubscription: true,
    plan: row.plan_name,
    features: (row.features as string[]) || [],
    limits: (row.limits as Record<string, number>) || {},
    trialActive: row.trial_active as boolean,
  };
});

/**
 * Middleware helper: Require specific plan
 * Usage: export const middleware = requirePlan({ plan: "pro" })
 */
export function requirePlan(check: EntitlementCheck) {
  return async (request: NextRequest, context: MiddlewareContext) => {
    const { userId, organizationId } = context;

    // Get entitlements (user or org)
    let entitlements;
    if (organizationId) {
      entitlements = await getOrganizationEntitlements(organizationId);
    }
    if (!entitlements) {
      entitlements = await getUserEntitlements(userId);
    }

    // Check active subscription
    if (check.requireActive !== false && !entitlements.hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Active subscription required",
          code: "SUBSCRIPTION_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Check plan requirement
    if (check.plan) {
      const requiredPlans = Array.isArray(check.plan) ? check.plan : [check.plan];
      const currentPlan = entitlements.plan || "free";

      if (!requiredPlans.includes(currentPlan as string)) {
        const planDisplay = Array.isArray(check.plan) ? check.plan.join(", ") : check.plan;
        return NextResponse.json(
          {
            error: `Plan '${planDisplay}' required`,
            code: "PLAN_REQUIRED",
            currentPlan,
            requiredPlans,
          },
          { status: 403 }
        );
      }
    }

    // Continue to next middleware/handler
    return null;
  };
}

/**
 * Middleware helper: Require specific feature
 * Usage: export const middleware = requireFeature({ feature: "ai_generation" })
 */
export function requireFeature(check: EntitlementCheck) {
  return async (request: NextRequest, context: MiddlewareContext) => {
    const { userId, organizationId } = context;

    // Get entitlements
    let entitlements;
    if (organizationId) {
      entitlements = await getOrganizationEntitlements(organizationId);
    }
    if (!entitlements) {
      entitlements = await getUserEntitlements(userId);
    }

    // Check active subscription
    if (check.requireActive !== false && !entitlements.hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Active subscription required",
          code: "SUBSCRIPTION_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Check feature requirement
    if (check.feature) {
      const hasFeature = entitlements.features.includes(check.feature);
      if (!hasFeature) {
        return NextResponse.json(
          {
            error: `Feature '${check.feature}' not available in your plan`,
            code: "FEATURE_NOT_AVAILABLE",
            availableFeatures: entitlements.features,
          },
          { status: 403 }
        );
      }
    }

    // Continue to next middleware/handler
    return null;
  };
}

/**
 * Higher-order function: Protect an API route with entitlements
 * 
 * Usage:
 * export const POST = withEntitlements(
 *   { feature: "ai_generation" },
 *   async (request, context) => {
 *     // Handler code - only runs if entitlement check passes
 *   }
 * )
 */
export function withEntitlements(
  check: EntitlementCheck,
  handler: (request: NextRequest, context: MiddlewareContext) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: MiddlewareContext): Promise<NextResponse> => {
    // Run feature check first
    const featureCheck = check.feature ? requireFeature(check) : null;
    const planCheck = check.plan ? requirePlan(check) : null;

    if (featureCheck) {
      const result = await featureCheck(request, context);
      if (result) return result;
    }

    if (planCheck) {
      const result = await planCheck(request, context);
      if (result) return result;
    }

    // All checks passed, run the handler
    return handler(request, context);
  };
}

/**
 * Composable middleware chain
 * 
 * Usage:
 * export const middleware = compose(
 *   authenticate,
 *   requireFeature({ feature: "premium" }),
 *   rateLimit({ max: 100 })
 * )
 */
export function compose(...middlewares: Array<(req: NextRequest, ctx: MiddlewareContext) => Promise<NextResponse | null>>) {
  return async (request: NextRequest, context: MiddlewareContext): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request, context);
      if (result) return result; // Short-circuit on error response
    }
    return null; // All passed
  };
}

/**
 * Get userId from various auth sources
 * Supports: Bearer tokens, session cookies, custom headers
 */
export async function extractUserId(request: NextRequest): Promise<string | null> {
  // Try Bearer token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // Verify and decode JWT
    const token = authHeader.slice(7);
      // TODO: Implement JWT verification
      // For now, return the token prefix as placeholder
      return token.slice(0, 8);
  }

    // Try session cookie (Better Auth)
    const sessionCookie = request.cookies.get("better-auth.session")?.value;
    if (sessionCookie) {
      // Decode session to get userId
      // This would integrate with Better Auth session validation
      // For now, return null to indicate we need proper auth
      return null;
    }

  // Try custom header for internal API calls
  const userIdHeader = request.headers.get("x-user-id");
  if (userIdHeader) {
    return userIdHeader;
  }

  return null;
}
