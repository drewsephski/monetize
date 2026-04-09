import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sdkLicenses, sdkLicenseUsage } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const verifySchema = z.object({
  licenseKey: z.string().min(1),
  machineId: z.string().optional(), // Optional: for tracking unique installations
  eventType: z.string().default("verify"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { valid: false, error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const { licenseKey, machineId, eventType, metadata } = result.data;

    // Look up license
    const license = await db.query.sdkLicenses.findFirst({
      where: eq(sdkLicenses.licenseKey, licenseKey),
    });

    if (!license) {
      return NextResponse.json(
        { valid: false, error: "License not found" },
        { status: 404 }
      );
    }

    // Check if license is active
    if (license.status !== "active") {
      return NextResponse.json(
        { 
          valid: false, 
          error: `License is ${license.status}`,
          tier: license.tier,
          status: license.status,
        },
        { status: 403 }
      );
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      // Auto-update status to expired
      await db.update(sdkLicenses)
        .set({ status: "expired" })
        .where(eq(sdkLicenses.id, license.id));

      return NextResponse.json(
        { 
          valid: false, 
          error: "License has expired",
          tier: license.tier,
          status: "expired",
          expiredAt: license.expiresAt,
        },
        { status: 403 }
      );
    }

    // Update last verified timestamp
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await db.update(sdkLicenses)
      .set({ 
        lastVerifiedAt: new Date(),
        lastVerifiedIp: clientIp,
      })
      .where(eq(sdkLicenses.id, license.id));

    // Log usage event
    if (machineId) {
      await db.insert(sdkLicenseUsage).values({
        licenseId: license.id,
        machineId,
        eventType,
        metadata: metadata || {},
        timestamp: new Date(),
      });
    }

    // Return successful verification
    return NextResponse.json({
      valid: true,
      license: {
        id: license.id,
        tier: license.tier,
        status: license.status,
        features: license.features || [],
        usageLimits: license.usageLimits || {},
        currentUsage: license.currentUsage || {},
        expiresAt: license.expiresAt,
      },
    });

  } catch (error) {
    console.error("License verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
