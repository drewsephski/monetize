/**
 * Internal Telemetry API
 * Receives anonymous CLI and SDK telemetry
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telemetryEvents, funnelMetrics } from "@/drizzle/schema";

// Simple rate limiting (in-memory for MVP)
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Clean old requests
  const valid = requests.filter(r => now - r < RATE_LIMIT_WINDOW);
  
  if (valid.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  valid.push(now);
  rateLimit.set(ip, valid);
  return true;
}

// POST /api/internal/telemetry - CLI telemetry events
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json();
    const { type, machineId, sessionId, metadata, timestamp, cliVersion } = body;

    // Validate required fields
    if (!type || !machineId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store event
    await db.insert(telemetryEvents).values({
      id: crypto.randomUUID(),
      eventType: type,
      machineId: machineId.substring(0, 32), // Ensure no overflow
      sessionId: sessionId?.substring(0, 32),
      metadata: metadata || {},
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      cliVersion: cliVersion?.substring(0, 20),
      source: "cli",
    });

    // Track funnel metrics
    if (type.startsWith("funnel_")) {
      const stage = type.replace("funnel_", "");
      await trackFunnelStage(stage, machineId, metadata);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry error:", error);
    // Silently fail - don't break CLI experience
    return NextResponse.json({ success: true });
  }
}

// POST /api/internal/telemetry/events - Batch SDK events
export async function PUT(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid events format" }, { status: 400 });
    }

    // Batch insert events
    for (const event of events.slice(0, 10)) { // Max 10 per batch
      await db.insert(telemetryEvents).values({
        id: crypto.randomUUID(),
        eventType: event.type,
        machineId: event.projectHash?.substring(0, 32),
        sessionId: event.sessionId?.substring(0, 32),
        metadata: event.metadata || {},
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        cliVersion: event.sdkVersion?.substring(0, 20),
        source: "sdk",
      });
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    console.error("Batch telemetry error:", error);
    return NextResponse.json({ success: true });
  }
}

// POST /api/internal/telemetry/error - SDK error reports
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    
    await db.insert(telemetryEvents).values({
      id: crypto.randomUUID(),
      eventType: "sdk_error",
      machineId: body.projectHash?.substring(0, 32),
      sessionId: body.sessionId?.substring(0, 32),
      metadata: {
        errorType: body.errorType,
        endpoint: body.endpoint,
        message: body.message,
      },
      timestamp: new Date(),
      cliVersion: body.sdkVersion?.substring(0, 20),
      source: "sdk",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error report failed:", error);
    return NextResponse.json({ success: true });
  }
}

// Helper to track funnel stage
async function trackFunnelStage(
  stage: string, 
  machineId: string, 
  metadata?: Record<string, unknown>
) {
  try {
    // Upsert funnel metric
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.insert(funnelMetrics).values({
      id: crypto.randomUUID(),
      stage,
      machineId: machineId.substring(0, 32),
      converted: true,
      metadata: metadata || {},
      date: today,
    });
  } catch {
    // Ignore funnel tracking errors
  }
}
