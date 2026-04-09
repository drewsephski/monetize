import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { stripeEvents } from "@/drizzle/schema";
import { env } from "@/lib/env";
import { logger, createWebhookLogger } from "@/lib/logger";
import { dispatchStripeEvent, isSupportedEventType } from "@/lib/billing/events";
import { enqueueStripeEvent } from "@/lib/billing/webhook-queue";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = env.stripeWebhookSecret;

// Calculate exponential backoff delay
function calculateNextAttempt(attempts: number): Date {
  // Exponential backoff: 2^attempts minutes (max 24 hours)
  const delayMinutes = Math.min(Math.pow(2, attempts), 24 * 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const payload = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    logger.warn({ requestId }, "Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error({ requestId, error: errorMessage }, "Webhook signature verification failed");
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  const eventLogger = createWebhookLogger(event.id, event.type);
  eventLogger.info({ requestId, eventType: event.type }, "Received webhook");

  // Skip unsupported events but acknowledge receipt
  if (!isSupportedEventType(event.type)) {
    eventLogger.debug("Event type not supported, acknowledging");
    return NextResponse.json({ received: true, supported: false });
  }

  try {
    // Process within a transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Lock the event row to prevent concurrent processing
      const existingEvent = await tx.query.stripeEvents.findFirst({
        where: eq(stripeEvents.id, event.id),
      });

      if (existingEvent?.processed) {
        eventLogger.info("Event already processed, skipping");
        return { processed: false, idempotent: true, reason: "already_processed" };
      }

      if (!existingEvent) {
        // Insert event record with initial attempt count
        await tx.insert(stripeEvents).values({
          id: event.id,
          type: event.type,
          payload: event,
          processed: false,
          attempts: 1,
          nextAttemptAt: calculateNextAttempt(1),
          updatedAt: new Date(),
        });
        eventLogger.debug("Created event record");
      } else {
        // Update attempt count
        await tx
          .update(stripeEvents)
          .set({
            attempts: existingEvent.attempts + 1,
            nextAttemptAt: calculateNextAttempt(existingEvent.attempts + 1),
            updatedAt: new Date(),
          })
          .where(eq(stripeEvents.id, event.id));
        eventLogger.debug({ attempt: existingEvent.attempts + 1 }, "Updated attempt count");
      }

      await dispatchStripeEvent({
        event,
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

      eventLogger.info("Event processed successfully");
      return { processed: true, idempotent: false };
    });

    return NextResponse.json({
      received: true,
      processed: result.processed,
      idempotent: result.idempotent,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    eventLogger.error({ error: errorMessage, stack: err instanceof Error ? err.stack : undefined }, "Error processing webhook");

    // Update the event record with the error (outside transaction since it failed)
    try {
      await db
        .update(stripeEvents)
        .set({
          lastError: errorMessage,
          nextAttemptAt: sql`NOW() + INTERVAL '5 minutes'`,
          updatedAt: new Date(),
        })
        .where(eq(stripeEvents.id, event.id));
    } catch (updateErr) {
      logger.error({ eventId: event.id, error: updateErr }, "Failed to update event error status");
    }

    try {
      await enqueueStripeEvent(event.id, event.type, event);
      eventLogger.warn("Enqueued webhook for retry processing");
    } catch (queueErr) {
      logger.error({ eventId: event.id, error: queueErr }, "Failed to enqueue webhook for retry");
    }

    return NextResponse.json(
      { error: errorMessage, requestId },
      { status: 500 }
    );
  }
}
