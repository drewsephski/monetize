import { NextRequest, NextResponse } from "next/server";
import { processWebhookQueue, getQueueStats } from "@/lib/billing/webhook-queue";
import { logger } from "@/lib/logger";

/**
 * POST /api/cron/process-webhooks
 *
 * Cron job endpoint for processing the webhook queue.
 * Should be called every 1-5 minutes.
 * 
 * Security: Requires CRON_SECRET header
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stats before processing
    const beforeStats = await getQueueStats();

    // Process queue
    const result = await processWebhookQueue(50);

    // Get stats after processing
    const afterStats = await getQueueStats();

    const durationMs = Date.now() - startTime;

    logger.info({
      msg: "Webhook queue processed",
      processed: result.processed,
      failed: result.failed,
      deadLettered: result.deadLettered,
      queueRemaining: afterStats.pending + afterStats.failed,
      deadLetterCount: afterStats.deadLetter,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      result,
      queueStats: {
        before: beforeStats,
        after: afterStats,
      },
      meta: {
        durationMs,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      msg: "Webhook queue cron job failed",
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    return NextResponse.json(
      {
        error: "Failed to process webhook queue",
        meta: {
          durationMs,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/process-webhooks
 *
 * Health check endpoint for the webhook queue.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret (optional for GET)
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getQueueStats();

    // Determine health status
    const isHealthy = stats.deadLetter < 100 && stats.pending < 1000;

    return NextResponse.json({
      status: isHealthy ? "healthy" : "degraded",
      queue: stats,
      meta: {
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
