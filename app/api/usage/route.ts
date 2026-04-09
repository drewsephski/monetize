import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usageEvents, usageAggregates } from "@/drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * GET /api/usage
 *
 * Get usage data for a user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const feature = searchParams.get("feature");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no period specified
    const start = periodStart
      ? new Date(periodStart)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = periodEnd ? new Date(periodEnd) : new Date();

    // Get aggregate data
    const aggregateQuery = db
      .select({
        feature: usageAggregates.feature,
        totalUsage: usageAggregates.totalUsage,
        periodStart: usageAggregates.periodStart,
        periodEnd: usageAggregates.periodEnd,
      })
      .from(usageAggregates)
      .where(
        and(
          eq(usageAggregates.userId, userId),
          gte(usageAggregates.periodStart, start),
          lte(usageAggregates.periodEnd, end),
          feature ? eq(usageAggregates.feature, feature) : undefined
        )
      );

    // Get detailed events
    const eventsQuery = db
      .select({
        timestamp: usageEvents.timestamp,
        feature: usageEvents.feature,
        quantity: usageEvents.quantity,
        syncedToStripe: usageEvents.syncedToStripe,
      })
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.userId, userId),
          gte(usageEvents.timestamp, start),
          lte(usageEvents.timestamp, end),
          feature ? eq(usageEvents.feature, feature) : undefined
        )
      )
      .orderBy(sql`${usageEvents.timestamp} DESC`)
      .limit(100);

    const [aggregates, events] = await Promise.all([aggregateQuery, eventsQuery]);

    // Calculate totals by feature
    const byFeature: Record<string, number> = {};
    for (const agg of aggregates) {
      byFeature[agg.feature] = (byFeature[agg.feature] || 0) + agg.totalUsage;
    }

    const totalUsage = Object.values(byFeature).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      userId,
      totalUsage,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      byFeature,
      aggregates: aggregates.slice(0, 50),
      events: events.slice(0, 100),
      meta: {
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error({
      msg: "Failed to get usage data",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to get usage data" },
      { status: 500 }
    );
  }
}
