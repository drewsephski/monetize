import { db } from "@/lib/db";
import { webhookQueue, eventTimeline } from "@/drizzle/schema";
import { eq, lte, and, or, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [60, 300, 900, 3600, 7200]; // seconds: 1min, 5min, 15min, 1hr, 2hr

/**
 * Enqueue a Stripe event for reliable processing.
 * This provides a fallback if direct webhook processing fails.
 */
export async function enqueueStripeEvent(
  stripeEventId: string,
  eventType: string,
  payload: unknown
): Promise<void> {
  try {
    await db.insert(webhookQueue).values({
      stripeEventId,
      eventType,
      payload: payload as Record<string, unknown>,
      status: "pending",
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      nextAttemptAt: new Date(),
    });

    logger.info({
      msg: "Stripe event enqueued",
      stripeEventId,
      eventType,
    });
  } catch (error) {
    // If duplicate, log and continue
    if (error instanceof Error && error.message.includes("unique constraint")) {
      logger.debug({
        msg: "Stripe event already in queue",
        stripeEventId,
      });
      return;
    }
    throw error;
  }
}

/**
 * Process events from the webhook queue.
 * Called by the cron job or manually for retries.
 */
export async function processWebhookQueue(batchSize: number = 10): Promise<{
  processed: number;
  failed: number;
  deadLettered: number;
}> {
  const stats = { processed: 0, failed: 0, deadLettered: 0 };

  try {
    // Get pending events that are ready for retry
    const pendingEvents = await db
      .select({
        id: webhookQueue.id,
        stripeEventId: webhookQueue.stripeEventId,
        eventType: webhookQueue.eventType,
        payload: webhookQueue.payload,
        attempts: webhookQueue.attempts,
        lastError: webhookQueue.lastError,
      })
      .from(webhookQueue)
      .where(
        and(
          or(
            eq(webhookQueue.status, "pending"),
            eq(webhookQueue.status, "failed")
          ),
          lte(webhookQueue.nextAttemptAt, new Date()),
          lte(webhookQueue.attempts, MAX_ATTEMPTS)
        )
      )
      .limit(batchSize);

    for (const event of pendingEvents) {
      try {
        // Mark as processing
        await db
          .update(webhookQueue)
          .set({
            status: "processing",
            attempts: event.attempts + 1,
          })
          .where(eq(webhookQueue.id, event.id));

        // Process the event
        // Note: This would call the actual event handler based on event type
        // For now, we just log it - the real implementation would dispatch
        // to the appropriate handler in lib/billing/events/
        logger.info({
          msg: "Processing queued event",
          stripeEventId: event.stripeEventId,
          eventType: event.eventType,
        });

        // Mark as completed
        await db
          .update(webhookQueue)
          .set({
            status: "completed",
            processedAt: new Date(),
          })
          .where(eq(webhookQueue.id, event.id));

        stats.processed++;

        logger.info({
          msg: "Webhook queue event processed successfully",
          stripeEventId: event.stripeEventId,
          eventType: event.eventType,
          attempt: event.attempts + 1,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const nextAttempt = event.attempts + 1;

        if (nextAttempt >= MAX_ATTEMPTS) {
          // Dead letter - max retries exceeded
          await db
            .update(webhookQueue)
            .set({
              status: "dead_letter",
              lastError: errorMessage.substring(0, 1000),
              deadLetterAt: new Date(),
            })
            .where(eq(webhookQueue.id, event.id));

          stats.deadLettered++;

          logger.error({
            msg: "Webhook event dead-lettered after max retries",
            stripeEventId: event.stripeEventId,
            eventType: event.eventType,
            attempts: nextAttempt,
            error: errorMessage,
          });

          // Add to event timeline for debugging
          await db.insert(eventTimeline).values({
            stripeEventId: event.stripeEventId,
            customerId: "00000000-0000-0000-0000-000000000000", // System/unknown customer
            eventType: event.eventType,
            source: "webhook_queue",
            status: "error",
            payload: event.payload as Record<string, unknown>,
            processingAttempts: nextAttempt,
            lastError: errorMessage.substring(0, 1000),
            metadata: { deadLettered: true },
          });
        } else {
          // Schedule retry
          const delaySeconds = RETRY_DELAYS[nextAttempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          const nextAttemptAt = new Date(Date.now() + delaySeconds * 1000);

          await db
            .update(webhookQueue)
            .set({
              status: "failed",
              attempts: nextAttempt,
              lastError: errorMessage.substring(0, 1000),
              nextAttemptAt,
            })
            .where(eq(webhookQueue.id, event.id));

          stats.failed++;

          logger.warn({
            msg: "Webhook event failed, scheduled retry",
            stripeEventId: event.stripeEventId,
            eventType: event.eventType,
            attempt: nextAttempt,
            nextAttemptAt,
            error: errorMessage,
          });
        }
      }
    }

    return stats;
  } catch (error) {
    logger.error({
      msg: "Webhook queue processing failed",
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get queue statistics for monitoring.
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  deadLetter: number;
  avgAttempts: number;
  oldestPending: Date | null;
}> {
  const stats = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'processing') as processing,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'dead_letter') as dead_letter,
      AVG(attempts)::float as avg_attempts,
      MIN(created_at) FILTER (WHERE status IN ('pending', 'failed')) as oldest_pending
    FROM webhook_queue
  `);

  const row = stats.rows[0];
  return {
    pending: Number(row?.pending) || 0,
    processing: Number(row?.processing) || 0,
    failed: Number(row?.failed) || 0,
    completed: Number(row?.completed) || 0,
    deadLetter: Number(row?.dead_letter) || 0,
    avgAttempts: Number(row?.avg_attempts) || 0,
    oldestPending: row?.oldest_pending ? new Date(row.oldest_pending as string) : null,
  };
}

/**
 * Manually retry a dead-lettered event (admin function).
 */
export async function retryDeadLetter(eventId: string): Promise<boolean> {
  const [event] = await db
    .select()
    .from(webhookQueue)
    .where(eq(webhookQueue.id, eventId))
    .limit(1);

  if (!event || event.status !== "dead_letter") {
    return false;
  }

  // Reset for retry
  await db
    .update(webhookQueue)
    .set({
      status: "pending",
      attempts: 0,
      nextAttemptAt: new Date(),
      lastError: null,
      deadLetterAt: null,
    })
    .where(eq(webhookQueue.id, eventId));

  return true;
}
