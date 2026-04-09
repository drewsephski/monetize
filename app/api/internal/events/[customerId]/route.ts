import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventTimeline, requestTraces } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * GET /api/internal/events/:customerId
 *
 * Returns the complete event timeline for a customer.
 * This is the debugging backbone for understanding billing state.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
): Promise<NextResponse> {
  const startTime = Date.now();
  const { customerId } = await params;

  try {
    // Fetch event timeline for this customer
    const events = await db
      .select({
        id: eventTimeline.id,
        eventType: eventTimeline.eventType,
        source: eventTimeline.source,
        status: eventTimeline.status,
        stripeEventId: eventTimeline.stripeEventId,
        processingAttempts: eventTimeline.processingAttempts,
        lastError: eventTimeline.lastError,
        processedAt: eventTimeline.processedAt,
        payload: eventTimeline.payload,
        metadata: eventTimeline.metadata,
        createdAt: eventTimeline.createdAt,
      })
      .from(eventTimeline)
      .where(eq(eventTimeline.customerId, customerId))
      .orderBy(desc(eventTimeline.createdAt))
      .limit(100);

    // Fetch related request traces
    const traces = await db
      .select({
        id: requestTraces.id,
        requestId: requestTraces.requestId,
        eventId: requestTraces.eventId,
        type: requestTraces.type,
        status: requestTraces.status,
        durationMs: requestTraces.durationMs,
        errorMessage: requestTraces.errorMessage,
        metadata: requestTraces.metadata,
        createdAt: requestTraces.createdAt,
        completedAt: requestTraces.completedAt,
      })
      .from(requestTraces)
      .where(eq(requestTraces.customerId, customerId))
      .orderBy(desc(requestTraces.createdAt))
      .limit(50);

    // Build correlation map: event → requests
    const eventRequestMap = new Map<string, typeof traces>();
    for (const trace of traces) {
      if (trace.eventId) {
        if (!eventRequestMap.has(trace.eventId)) {
          eventRequestMap.set(trace.eventId, []);
        }
        eventRequestMap.get(trace.eventId)!.push(trace);
      }
    }

    // Enrich events with related requests
    const enrichedEvents = events.map((event) => ({
      ...event,
      relatedRequests: eventRequestMap.get(event.stripeEventId || "") || [],
    }));

    logger.info({
      msg: "Fetched customer event timeline",
      customerId,
      eventCount: events.length,
      traceCount: traces.length,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      customerId,
      events: enrichedEvents,
      summary: {
        totalEvents: events.length,
        pendingEvents: events.filter((e) => e.status === "pending").length,
        errorEvents: events.filter((e) => e.status === "error").length,
        recentRequests: traces.length,
      },
      meta: {
        requestId: crypto.randomUUID(),
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error({
      msg: "Failed to fetch customer events",
      customerId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch events",
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
