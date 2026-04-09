import { db } from "@/lib/db";
import {
  webhookQueue,
  eventTimeline,
  stripeEvents,
  customers,
} from "@/drizzle/schema";
import { eq, lt, lte, and, or, sql } from "drizzle-orm";
import { logger, createWebhookLogger } from "@/lib/logger";
import { dispatchStripeEvent, isSupportedEventType } from "@/lib/billing/events";
import { env } from "@/lib/env";
import {
  getRetryDelaySeconds,
  toQueuedStripeEvent,
  getStripeCustomerId,
} from "@/lib/billing/webhook-queue-utils";
import Stripe from "stripe";

const MAX_ATTEMPTS = 5;
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

async function recordDeadLetterTimeline(
  stripeEventId: string,
  eventType: string,
  payload: unknown,
  processingAttempts: number,
  lastError: string
): Promise<void> {
  const stripeCustomerId = getStripeCustomerId(payload);
  if (!stripeCustomerId) {
    return;
  }

  const customer = await db.query.customers.findFirst({
    columns: { id: true },
    where: eq(customers.stripeCustomerId, stripeCustomerId),
  });

  if (!customer) {
    return;
  }

  await db.insert(eventTimeline).values({
    stripeEventId,
    customerId: customer.id,
    eventType,
    source: "webhook_queue",
    status: "error",
    payload: payload as Record<string, unknown>,
    processingAttempts,
    lastError,
    processedAt: new Date(),
    metadata: { deadLettered: true },
  });
}

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
        maxAttempts: webhookQueue.maxAttempts,
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
          lt(webhookQueue.attempts, webhookQueue.maxAttempts)
        )
      )
      .limit(batchSize);

    for (const event of pendingEvents) {
      const claimedRows = await db
        .update(webhookQueue)
        .set({
          status: "processing",
          attempts: event.attempts + 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(webhookQueue.id, event.id),
            or(
              eq(webhookQueue.status, "pending"),
              eq(webhookQueue.status, "failed")
            ),
            eq(webhookQueue.attempts, event.attempts)
          )
        )
        .returning({ id: webhookQueue.id });

      if (claimedRows.length === 0) {
        continue;
      }

      const attemptNumber = event.attempts + 1;
      const eventLogger = createWebhookLogger(event.stripeEventId, event.eventType);

      try {
        if (!isSupportedEventType(event.eventType)) {
          eventLogger.warn({ eventType: event.eventType }, "Skipping unsupported queued event");

          await db
            .update(webhookQueue)
            .set({
              status: "completed",
              processedAt: new Date(),
              lastError: null,
              updatedAt: new Date(),
            })
            .where(eq(webhookQueue.id, event.id));

          stats.processed++;
          continue;
        }

        const existingEvent = await db.query.stripeEvents.findFirst({
          columns: { processed: true },
          where: eq(stripeEvents.id, event.stripeEventId),
        });

        if (existingEvent?.processed) {
          eventLogger.info("Queued event already processed, completing idempotently");

          await db
            .update(webhookQueue)
            .set({
              status: "completed",
              processedAt: new Date(),
              lastError: null,
              updatedAt: new Date(),
            })
            .where(eq(webhookQueue.id, event.id));

          stats.processed++;
          continue;
        }

        const stripeEvent = toQueuedStripeEvent(
          event.stripeEventId,
          event.eventType,
          event.payload
        );

        await db.transaction(async (tx) => {
          await tx
            .insert(stripeEvents)
            .values({
              id: stripeEvent.id,
              type: stripeEvent.type,
              payload: stripeEvent,
              processed: false,
              attempts: attemptNumber,
              lastError: null,
              nextAttemptAt: null,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: stripeEvents.id,
              set: {
                type: stripeEvent.type,
                payload: stripeEvent,
                processed: false,
                attempts: attemptNumber,
                lastError: null,
                nextAttemptAt: null,
                updatedAt: new Date(),
              },
            });

          await dispatchStripeEvent({
            event: stripeEvent,
            stripe,
            tx,
            logger: eventLogger,
          });

          await tx
            .insert(stripeEvents)
            .values({
              id: stripeEvent.id,
              type: stripeEvent.type,
              payload: stripeEvent,
              processed: true,
              attempts: attemptNumber,
              lastError: null,
              nextAttemptAt: null,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: stripeEvents.id,
              set: {
                type: stripeEvent.type,
                payload: stripeEvent,
                processed: true,
                attempts: attemptNumber,
                lastError: null,
                nextAttemptAt: null,
                updatedAt: new Date(),
              },
            });
        });

        await db
          .update(webhookQueue)
          .set({
            status: "completed",
            processedAt: new Date(),
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(webhookQueue.id, event.id));

        stats.processed++;

        eventLogger.info({
          msg: "Webhook queue event processed successfully",
          stripeEventId: event.stripeEventId,
          eventType: event.eventType,
          attempt: attemptNumber,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const nextAttempt = attemptNumber;
        const maxAttempts = event.maxAttempts || MAX_ATTEMPTS;

        if (nextAttempt >= maxAttempts) {
          // Dead letter - max retries exceeded
          await db
            .update(webhookQueue)
            .set({
              status: "dead_letter",
              lastError: errorMessage.substring(0, 1000),
              deadLetterAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(webhookQueue.id, event.id));

          await db
            .insert(stripeEvents)
            .values({
              id: event.stripeEventId,
              type: event.eventType,
              payload: event.payload as Record<string, unknown>,
              processed: false,
              attempts: nextAttempt,
              lastError: errorMessage.substring(0, 1000),
              nextAttemptAt: null,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: stripeEvents.id,
              set: {
                type: event.eventType,
                payload: event.payload as Record<string, unknown>,
                processed: false,
                attempts: nextAttempt,
                lastError: errorMessage.substring(0, 1000),
                nextAttemptAt: null,
                updatedAt: new Date(),
              },
            });

          stats.deadLettered++;

          logger.error({
            msg: "Webhook event dead-lettered after max retries",
            stripeEventId: event.stripeEventId,
            eventType: event.eventType,
            attempts: nextAttempt,
            error: errorMessage,
          });

          await recordDeadLetterTimeline(
            event.stripeEventId,
            event.eventType,
            event.payload,
            nextAttempt,
            errorMessage.substring(0, 1000)
          );
        } else {
          // Schedule retry
          const delaySeconds = getRetryDelaySeconds(nextAttempt);
          const nextAttemptAt = new Date(Date.now() + delaySeconds * 1000);

          await db
            .update(webhookQueue)
            .set({
              status: "failed",
              attempts: nextAttempt,
              lastError: errorMessage.substring(0, 1000),
              nextAttemptAt,
              updatedAt: new Date(),
            })
            .where(eq(webhookQueue.id, event.id));

          await db
            .insert(stripeEvents)
            .values({
              id: event.stripeEventId,
              type: event.eventType,
              payload: event.payload as Record<string, unknown>,
              processed: false,
              attempts: nextAttempt,
              lastError: errorMessage.substring(0, 1000),
              nextAttemptAt,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: stripeEvents.id,
              set: {
                type: event.eventType,
                payload: event.payload as Record<string, unknown>,
                processed: false,
                attempts: nextAttempt,
                lastError: errorMessage.substring(0, 1000),
                nextAttemptAt,
                updatedAt: new Date(),
              },
            });

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
