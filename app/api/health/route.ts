import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

interface HealthCheck {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  checks: {
    database: { status: "ok" | "error"; message?: string };
    stripe: { status: "ok" | "error"; message?: string };
    environment: { status: "ok" | "error"; missing?: string[] };
  };
}

export async function GET() {
  const requestId = crypto.randomUUID();
  const checks: HealthCheck["checks"] = {
    database: { status: "ok" },
    stripe: { status: "ok" },
    environment: { status: "ok" },
  };

  let overallStatus: HealthCheck["status"] = "healthy";

  // Check database connection
  try {
    await db.execute("SELECT 1");
    logger.debug({ requestId }, "Database health check passed");
  } catch (error) {
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
    overallStatus = "unhealthy";
    logger.error({ requestId, error }, "Database health check failed");
  }

  // Check Stripe connectivity
  try {
    await stripe.balance.retrieve();
    logger.debug({ requestId }, "Stripe health check passed");
  } catch (error) {
    checks.stripe = {
      status: "error",
      message: error instanceof Error ? error.message : "Stripe API connection failed",
    };
    overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
    logger.error({ requestId, error }, "Stripe health check failed");
  }

  // Verify required environment variables
  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
  ] as const;

  const missingVars: string[] = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    checks.environment = {
      status: "error",
      missing: missingVars,
    };
    overallStatus = "unhealthy";
    logger.error({ requestId, missingVars }, "Environment variables missing");
  }

  const response: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.1",
    checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
