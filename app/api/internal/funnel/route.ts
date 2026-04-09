/**
 * Funnel Analytics API
 * Returns activation funnel metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { funnelMetrics } from "@/drizzle/schema";
import { sql } from "drizzle-orm";

// Simple auth check (replace with proper auth in production)
function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("authorization");
  // For MVP, allow local development
  const isLocal = req.headers.get("host")?.includes("localhost");
  return isLocal || token === `Bearer ${process.env.INTERNAL_API_TOKEN}`;
}

// GET /api/internal/funnel - Get funnel metrics
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Aggregate funnel data
    const funnelData = await db.execute(sql`
      SELECT 
        stage,
        COUNT(DISTINCT machine_id) as unique_machines,
        COUNT(*) as total_events,
        DATE(date) as event_date
      FROM funnel_metrics
      WHERE date >= ${since}
      GROUP BY stage, DATE(date)
      ORDER BY event_date DESC, stage ASC
    `);

    // Calculate conversion rates
    const stages = [
      "cli_install",
      "init_started",
      "init_completed",
      "sandbox_started",
      "first_checkout",
      "first_subscription",
    ];

    const totals: Record<string, number> = {};
    for (const row of funnelData.rows) {
      const stage = String(row.stage);
      const count = parseInt(String(row.unique_machines), 10) || 0;
      totals[stage] = (totals[stage] || 0) + count;
    }

    const conversionRates = stages.map((stage, index) => {
      const current = totals[stage] || 0;
      const previous = index > 0 ? (totals[stages[index - 1]] || 1) : current;
      const rate = index > 0 ? (current / previous) * 100 : 100;
      
      return {
        stage,
        count: current,
        conversionRate: index > 0 ? `${rate.toFixed(1)}%` : "100%",
        dropOff: index > 0 ? `${(100 - rate).toFixed(1)}%` : "0%",
      };
    });

    return NextResponse.json({
      summary: {
        timeRange: `${days} days`,
        uniqueMachines: totals["cli_install"] || 0,
        totalCompletions: totals["first_subscription"] || 0,
        overallConversion: totals["cli_install"] 
          ? ((totals["first_subscription"] || 0) / totals["cli_install"] * 100).toFixed(1) + "%"
          : "N/A",
      },
      funnel: conversionRates,
      raw: funnelData.rows,
    });
  } catch (error) {
    console.error("Funnel metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

// POST /api/internal/funnel/track - Track funnel stage
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stage, machineId, metadata } = body;

    if (!stage || !machineId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.insert(funnelMetrics).values({
      id: crypto.randomUUID(),
      stage,
      machineId: machineId.substring(0, 32),
      converted: true,
      metadata: metadata || {},
      date: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Funnel track error:", error);
    return NextResponse.json({ success: true }); // Fail silently
  }
}
