import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, subscriptions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createRequestLogger } from "@/lib/logger";

// Default features for free tier
const DEFAULT_FREE_FEATURES = ["basic"];

// Default limits for free tier
const DEFAULT_FREE_LIMITS = {
  apiCalls: 100,
  projects: 1,
  teamMembers: 1,
  storage: 100, // MB
};

// Default features for paid tier (fallback if plan.features is null)
const DEFAULT_PAID_FEATURES = ["basic", "premium", "analytics", "priority_support", "webhooks"];

// Default limits for paid tier (fallback if plan.limits is null)
const DEFAULT_PAID_LIMITS = {
  apiCalls: 10000,
  projects: 10,
  teamMembers: 5,
  storage: 10000, // MB
};

export interface EntitlementsResponse {
  userId: string;
  plan: string | null;
  hasActiveSubscription: boolean;
  trialActive: boolean;
  trialEndsAt: string | null;
  features: string[];
  limits: Record<string, number>;
  usage?: Record<string, number>;
  subscription: {
    id: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const requestId = crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId, `/api/entitlements/${(await params).userId}`);

  try {
    const { userId } = await params;

    requestLogger.info({ userId }, "Fetching entitlements");

    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    // Fetch subscriptions separately with plan info
    let customerSubscriptions: Array<{
      id: string;
      status: string;
      trialActive: boolean | null;
      trialEnd: Date | null;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean | null;
      planId: string | null;
      plan?: { name: string; features: unknown; limits: unknown } | null;
    }> = [];

    if (customer) {
      const subs = await db.query.subscriptions.findMany({
        where: eq(subscriptions.customerId, customer.id),
        with: {
          plan: true,
        },
      });
      customerSubscriptions = subs as typeof customerSubscriptions;
    }

    // Default entitlements for users without subscriptions
    if (!customer) {
      requestLogger.info({ userId }, "No customer found, returning free tier");

      const freeEntitlements: EntitlementsResponse = {
        userId,
        plan: "free",
        hasActiveSubscription: false,
        trialActive: false,
        trialEndsAt: null,
        features: DEFAULT_FREE_FEATURES,
        limits: DEFAULT_FREE_LIMITS,
        subscription: null,
      };

      return NextResponse.json(freeEntitlements);
    }

    // Find active subscription
    const activeSubscription = customerSubscriptions.find(
      (sub: typeof customerSubscriptions[0]) => sub.status === "active" || sub.status === "trialing"
    );

    const hasActiveSubscription = !!activeSubscription;
    const trialActive = activeSubscription?.trialActive ?? false;
    const trialEndsAt = activeSubscription?.trialEnd?.toISOString() ?? null;

    // Get plan details
    const plan = activeSubscription?.plan;
    const planName = plan?.name || (hasActiveSubscription ? "paid" : "free");

    // Build features array
    let features: string[];
    if (hasActiveSubscription && plan?.features) {
      // Use plan-defined features
      features = Array.isArray(plan.features) ? plan.features : DEFAULT_PAID_FEATURES;
    } else if (hasActiveSubscription) {
      // Fallback to default paid features
      features = DEFAULT_PAID_FEATURES;
    } else {
      // Free tier
      features = DEFAULT_FREE_FEATURES;
    }

    // Build limits object
    let limits: Record<string, number>;
    if (hasActiveSubscription && plan?.limits) {
      // Use plan-defined limits
      const planLimits = typeof plan.limits === "object" && plan.limits !== null
        ? plan.limits as Record<string, number>
        : {};
      limits = { ...DEFAULT_PAID_LIMITS, ...planLimits };
    } else if (hasActiveSubscription) {
      // Fallback to default paid limits
      limits = DEFAULT_PAID_LIMITS;
    } else {
      // Free tier
      limits = DEFAULT_FREE_LIMITS;
    }

    // Build subscription info
    const subscriptionInfo = activeSubscription
      ? {
          id: activeSubscription.id,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd ?? false,
        }
      : null;

    const entitlements: EntitlementsResponse = {
      userId,
      plan: planName,
      hasActiveSubscription,
      trialActive,
      trialEndsAt,
      features,
      limits,
      subscription: subscriptionInfo,
    };

    requestLogger.info(
      {
        userId,
        plan: planName,
        hasActiveSubscription,
        trialActive,
        featureCount: features.length,
      },
      "Entitlements fetched successfully"
    );

    return NextResponse.json(entitlements);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    requestLogger.error({ error: errorMessage }, "Entitlements fetch error");
    return NextResponse.json({ error: errorMessage, requestId }, { status: 500 });
  }
}
