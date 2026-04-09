import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  stripeEvents,
  subscriptions,
  invoices,
  eventTimeline,
  webhookQueue,
} from "@/drizzle/schema";
import { eq, gte, sql, count, avg, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * GET /api/internal/metrics
 *
 * Returns comprehensive billing system metrics.
 * Used for monitoring, alerting, and capacity planning.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Time ranges
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Parallel metric queries for performance
    const [
      // Webhook processing metrics
      webhookMetrics,

      // Event processing metrics
      eventMetrics,

      // Subscription state counts
      subscriptionCounts,

      // Invoice metrics
      invoiceMetrics,

      // Webhook queue state
      queueMetrics,

      // Recent error count
      recentErrors,
    ] = await Promise.all([
      // Webhook processing stats
      db
        .select({
          total: count(),
          processed: count(sql`CASE WHEN ${stripeEvents.processed} = true THEN 1 END`),
          failed: count(
            sql`CASE WHEN ${stripeEvents.processed} = false AND ${stripeEvents.attempts} > 0 THEN 1 END`
          ),
          avgAttempts: avg(stripeEvents.attempts),
        })
        .from(stripeEvents)
        .where(gte(stripeEvents.createdAt, oneHourAgo)),

      // Event timeline stats
      db
        .select({
          total: count(),
          pending: count(sql`CASE WHEN ${eventTimeline.status} = 'pending' THEN 1 END`),
          completed: count(sql`CASE WHEN ${eventTimeline.status} = 'completed' THEN 1 END`),
          error: count(sql`CASE WHEN ${eventTimeline.status} = 'error' THEN 1 END`),
        })
        .from(eventTimeline)
        .where(gte(eventTimeline.createdAt, oneHourAgo)),

      // Subscription counts by status
      db
        .select({
          status: subscriptions.status,
          count: count(),
        })
        .from(subscriptions)
        .groupBy(subscriptions.status),

      // Invoice metrics
      db
        .select({
          total: count(),
          paid: count(sql`CASE WHEN ${invoices.status} = 'paid' THEN 1 END`),
          unpaid: count(sql`CASE WHEN ${invoices.status} = 'open' THEN 1 END`),
          totalAmount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END)`,
        })
        .from(invoices)
        .where(gte(invoices.createdAt, oneDayAgo)),

      // Webhook queue state
      db
        .select({
          status: webhookQueue.status,
          count: count(),
          avgAttempts: avg(webhookQueue.attempts),
        })
        .from(webhookQueue)
        .where(gte(webhookQueue.createdAt, oneDayAgo))
        .groupBy(webhookQueue.status),

      // Recent errors from webhook queue
      db
        .select({
          total: count(),
        })
        .from(webhookQueue)
        .where(
          and(
            eq(webhookQueue.status, "failed"),
            gte(webhookQueue.updatedAt, fiveMinutesAgo)
          )
        ),
    ]);

    // Calculate MRR (simplified - based on active subscriptions with plans)
    const mrrResult = await db.execute(sql`
      SELECT 
        COUNT(*) as active_subscriptions,
        COALESCE(SUM(
          CASE 
            WHEN p.metadata->>'price' IS NOT NULL 
            THEN (p.metadata->>'price')::int 
            ELSE 0 
          END
        ), 0) as estimated_mrr_cents
      FROM ${subscriptions} s
      LEFT JOIN ${sql.raw("plans")} p ON s.plan_id = p.id
      WHERE s.status = 'active'
        AND s.created_at >= ${oneDayAgo}
    `);

    const metrics = {
      // System health
      health: {
        status: recentErrors[0]?.total > 10 ? "degraded" : "healthy",
        lastChecked: now.toISOString(),
      },

      // Webhook processing
      webhooks: {
        totalLastHour: webhookMetrics[0]?.total || 0,
        processedLastHour: webhookMetrics[0]?.processed || 0,
        failedLastHour: webhookMetrics[0]?.failed || 0,
        avgAttempts: Math.round(Number(webhookMetrics[0]?.avgAttempts || 0) * 100) / 100,
        successRate: webhookMetrics[0]?.total
          ? Math.round(
              ((webhookMetrics[0]?.processed || 0) / webhookMetrics[0]?.total) * 100
            )
          : 0,
      },

      // Event timeline
      events: {
        totalLastHour: eventMetrics[0]?.total || 0,
        pending: eventMetrics[0]?.pending || 0,
        completed: eventMetrics[0]?.completed || 0,
        errors: eventMetrics[0]?.error || 0,
      },

      // Subscription state
      subscriptions: subscriptionCounts.reduce(
        (acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        },
        {} as Record<string, number>
      ),

      // Financial metrics
      revenue: {
        invoicesLastDay: invoiceMetrics[0]?.total || 0,
        paidInvoices: invoiceMetrics[0]?.paid || 0,
        unpaidInvoices: invoiceMetrics[0]?.unpaid || 0,
        collectedAmountCents: invoiceMetrics[0]?.totalAmount || 0,
        estimatedMrrCents: Number(mrrResult.rows[0]?.estimated_mrr_cents) || 0,
      },

      // Queue state
      queue: queueMetrics.reduce(
        (acc, curr) => {
          acc[curr.status] = {
            count: curr.count,
            avgAttempts: Math.round(Number(curr.avgAttempts || 0) * 100) / 100,
          };
          return acc;
        },
        {} as Record<string, { count: number; avgAttempts: number }>
      ),

      // Recent alerts
      alerts: {
        recentFailures: recentErrors[0]?.total || 0,
        threshold: 10,
        triggered: (recentErrors[0]?.total || 0) > 10,
      },

      // Meta
      meta: {
        requestId,
        durationMs: Date.now() - startTime,
        generatedAt: now.toISOString(),
      },
    };

    logger.info({
      msg: "Metrics collected",
      requestId,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error({
      msg: "Failed to collect metrics",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: "Failed to collect metrics",
        requestId,
        meta: {
          durationMs: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
