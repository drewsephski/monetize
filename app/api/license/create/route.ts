import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sdkLicenses } from "@/drizzle/schema";
import { z } from "zod";
import crypto from "crypto";

const createSchema = z.object({
  customerEmail: z.string().email(),
  tier: z.enum(["free", "pro", "team", "enterprise"]).default("free"),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  expiresAt: z.string().datetime().optional(), // ISO date string
  features: z.array(z.string()).optional(),
  usageLimits: z.record(z.string(), z.number()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Generate a secure license key
function generateLicenseKey(): string {
  const bytes = crypto.randomBytes(16);
  return `DREW-${bytes.toString("hex").toUpperCase().slice(0, 16).match(/.{4}/g)?.join("-")}`;
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin/API key authentication here
    // For now, this is a simple implementation - add proper auth middleware
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const {
      customerEmail,
      tier,
      stripeCustomerId,
      stripeSubscriptionId,
      expiresAt,
      features,
      usageLimits,
      metadata,
    } = result.data;

    const licenseKey = generateLicenseKey();

    const license = await db.insert(sdkLicenses).values({
      licenseKey,
      customerEmail,
      stripeCustomerId,
      stripeSubscriptionId,
      tier,
      status: "active",
      features: features || getDefaultFeatures(tier),
      usageLimits: usageLimits || getDefaultLimits(tier),
      currentUsage: {},
      expiresAt: expiresAt ? new Date(expiresAt) : getDefaultExpiration(tier),
      metadata: metadata || {},
    }).returning();

    return NextResponse.json({
      success: true,
      license: {
        id: license[0].id,
        licenseKey: license[0].licenseKey,
        tier: license[0].tier,
        status: license[0].status,
        expiresAt: license[0].expiresAt,
      },
    });

  } catch (error) {
    console.error("License creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getDefaultFeatures(tier: string): string[] {
  const features: Record<string, string[]> = {
    free: ["basic_checkout", "standard_webhooks"],
    pro: [
      "basic_checkout",
      "standard_webhooks",
      "usage_based_billing",
      "advanced_analytics",
      "priority_support",
      "team_collaboration",
    ],
    team: [
      "basic_checkout",
      "standard_webhooks",
      "usage_based_billing",
      "advanced_analytics",
      "priority_support",
      "team_collaboration",
      "custom_integrations",
      "multiple_projects",
    ],
    enterprise: [
      "basic_checkout",
      "standard_webhooks",
      "usage_based_billing",
      "advanced_analytics",
      "priority_support",
      "team_collaboration",
      "custom_integrations",
      "multiple_projects",
      "sso",
      "sla",
      "dedicated_support",
    ],
  };
  return features[tier] || features.free;
}

function getDefaultLimits(tier: string): Record<string, number> {
  const limits: Record<string, Record<string, number>> = {
    free: { apiCalls: 1000, projects: 1, teamMembers: 1 },
    pro: { apiCalls: 10000, projects: 5, teamMembers: 3 },
    team: { apiCalls: 100000, projects: 20, teamMembers: 10 },
    enterprise: { apiCalls: -1, projects: -1, teamMembers: -1 }, // -1 = unlimited
  };
  return limits[tier] || limits.free;
}

function getDefaultExpiration(tier: string): Date | undefined {
  if (tier === "free") {
    // Free licenses expire after 30 days, can be renewed
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  // Paid licenses don't auto-expire (managed by Stripe subscription status)
  return undefined;
}
