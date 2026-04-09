import { NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import Stripe from "stripe";
import { eq, and, lt, isNull, or, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { stripeEvents } from "@/drizzle/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { eventHandlers, isSupportedEventType } from "@/lib/billing/events";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

const MAX_ATTEMPTS = 5;

// Calculate exponential backoff delay
function calculateNextAttempt(attempts: number): Date {
  // Exponential backoff: 2^attempts minutes (max 24 hours)
  const delayMinutes = Math.min(Math.pow(2, attempts), 24 * 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

export async function POST() {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId, source: "cron-retry" });

  // Verify cron secret
  const cronSecret = env.cronSecret;
  if (cronSecret) {
    const headersList = await getHeaders();
    const authHeader = headersList.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      requestLogger.warn("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Find events ready for retry (nextAttemptAt is null or in the past)
  const now = new Date();
  const failedEvents = await db.query.stripeEvents.findMany({
    where: and(
      eq(stripeEvents.processed, false),
      lt(stripeEvents.attempts, MAX_ATTEMPTS),
      or(
        isNull(stripeEvents.nextAttemptAt),
        lte(stripeEvents.nextAttemptAt, now)
      )
    ),
    orderBy: stripeEvents.createdAt,
    limit: 100,
  });

  requestLogger.info({ count: failedEvents.length }, "Starting retry of failed events");

  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const event of failedEvents) {
    const eventLogger = requestLogger.child({
      eventId: event.id,
      eventType: event.type,
      attempt: event.attempts + 1,
    });

    try {
      // Verify the event is still valid in Stripe
      const stripeEvent = await stripe.events.retrieve(event.id);

      if (!stripeEvent) {
        eventLogger.warn("Event not found in Stripe, marking as skipped");
        results.skipped++;
        continue;
      }

      // Skip unsupported event types
      if (!isSupportedEventType(stripeEvent.type)) {
        eventLogger.debug("Event type not supported, marking as processed");
        await db
          .update(stripeEvents)
          .set({
            processed: true,
            updatedAt: new Date(),
          })
          .where(eq(stripeEvents.id, event.id));
        results.skipped++;
        continue;
      }

      // Get the handler
      const handler = eventHandlers[stripeEvent.type as keyof typeof eventHandlers];
      if (!handler) {
        throw new Error(`No handler found for event type: ${stripeEvent.type}`);
      }

      // Process within transaction
      await db.transaction(async (tx) => {
        // Update attempt count first
        await tx
          .update(stripeEvents)
          .set({
            attempts: event.attempts + 1,
            updatedAt: new Date(),
          })
          .where(eq(stripeEvents.id, event.id));

        // Execute handler
        await handler({
          event: stripeEvent,
          stripe,
          tx,
          logger: eventLogger,
        });

        // Mark as processed
        await tx
          .update(stripeEvents)
          .set({
            processed: true,
            lastError: null,
            nextAttemptAt: null,
            updatedAt: new Date(),
          })
          .where(eq(stripeEvents.id, event.id));
      });

      eventLogger.info("Event processed successfully");
      results.processed++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      eventLogger.error({ error: errorMessage }, "Failed to process event");
      results.errors.push(`${event.id}: ${errorMessage}`);
      results.failed++;

      // Calculate next retry time with exponential backoff
      const nextAttemptAt = calculateNextAttempt(event.attempts + 1);

      try {
        await db
          .update(stripeEvents)
          .set({
            attempts: event.attempts + 1,
            lastError: errorMessage,
            nextAttemptAt,
            updatedAt: new Date(),
          })
          .where(eq(stripeEvents.id, event.id));
      } catch (updateErr) {
        requestLogger.error({ eventId: event.id, error: updateErr }, "Failed to update event error status");
      }
    }
  }

  requestLogger.info({
    processed: results.processed,
    failed: results.failed,
    skipped: results.skipped,
  }, "Retry run completed");

  return NextResponse.json({
    success: true,
    retried: failedEvents.length,
    ...results,
  });
}
