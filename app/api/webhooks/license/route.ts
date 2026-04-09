import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sdkLicenses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendLicenseEmail } from "@/lib/email";
import { 
  isStripeWebhookIP, 
  checkRateLimit, 
  logWebhookRequest, 
  updateWebhookStatus 
} from "@/lib/webhook-security";
import { captureException } from "@/lib/sentry";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Generate a secure license key
function generateLicenseKey(): string {
  const bytes = crypto.randomBytes(16);
  return `DREW-${bytes.toString("hex").toUpperCase().slice(0, 16).match(/.{4}/g)?.join("-")}`;
}

// Map Stripe product/price to SDK tier
function getTierFromProduct(productName: string): "free" | "pro" | "team" | "enterprise" {
  const name = productName.toLowerCase();
  if (name.includes("enterprise") || name.includes("scale")) return "enterprise";
  if (name.includes("team") || name.includes("growth")) return "team";
  if (name.includes("pro") || name.includes("paid")) return "pro";
  return "free";
}

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const endpoint = '/api/webhooks/license';

  // 1. IP Allowlist Check (Stripe webhook IPs only)
  if (!isStripeWebhookIP(clientIp)) {
    captureException(new Error('Webhook from unauthorized IP'), {
      context: 'webhook_security',
      endpoint,
      clientIp,
    });
    return NextResponse.json(
      { error: 'Unauthorized', code: 'IP_NOT_ALLOWED' },
      { status: 403 }
    );
  }

  // 2. Rate Limiting
  const rateLimitKey = `${clientIp}:${endpoint}`;
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // 3. Read and parse payload
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  let parsedPayload: Record<string, unknown>;
  
  try {
    parsedPayload = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stripeEventId = parsedPayload.id as string;
  const eventType = parsedPayload.type as string;

  // 4. Log request to database (async)
  logWebhookRequest(
    stripeEventId,
    eventType,
    parsedPayload,
    clientIp,
    req.headers.get('user-agent'),
    'processing'
  ).catch(() => {
    // Logging failure shouldn't block webhook
  });

  // 5. Verify Stripe signature
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    
    // Update log with failure
    updateWebhookStatus(stripeEventId, 'failed', errorMessage).catch(() => {});
    
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process if this is an SDK license purchase
        const isLicensePurchase = session.metadata?.type === "sdk_license" ||
          session.client_reference_id?.startsWith("sdk_");
        
        if (!isLicensePurchase) {
          console.log("Not an SDK license purchase, skipping...");
          return NextResponse.json({ received: true, type: "ignored" });
        }

        const customerEmail = session.customer_details?.email ||
          session.customer_email ||
          "unknown@example.com";
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        // Get the line items to determine tier
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const productName = lineItems.data[0]?.description || "Pro";
        const tier = getTierFromProduct(productName);

        // Check if license already exists for this subscription
        const existingLicense = await db.query.sdkLicenses.findFirst({
          where: eq(sdkLicenses.stripeSubscriptionId, stripeSubscriptionId),
        });

        if (existingLicense) {
          console.log("License already exists for subscription:", stripeSubscriptionId);
          return NextResponse.json({ 
            received: true, 
            licenseKey: existingLicense.licenseKey,
            status: "existing" 
          });
        }

        // Create new license
        const licenseKey = generateLicenseKey();
        const license = await db.insert(sdkLicenses).values({
          licenseKey,
          customerEmail,
          stripeCustomerId,
          stripeSubscriptionId,
          tier,
          status: "active",
          features: getDefaultFeatures(tier),
          usageLimits: getDefaultLimits(tier),
          currentUsage: {},
          metadata: {
            stripeSessionId: session.id,
            productName,
            createdByWebhook: true,
          },
        }).returning();

        console.log("Created SDK license:", license[0].id, "for customer:", customerEmail);

        // Send email with license key to customer
        const emailResult = await sendLicenseEmail({
          to: customerEmail,
          licenseKey,
          tier,
          customerName: session.customer_details?.name || undefined,
        });

        if (!emailResult.success) {
          console.warn("Failed to send license email:", emailResult.error);
          // Don't fail the webhook if email fails - license is still created
        }

        return NextResponse.json({
          received: true,
          licenseId: license[0].id,
          licenseKey: license[0].licenseKey,
          tier,
          status: "created",
        });
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        const status = subscription.status;

        // Find license by subscription ID
        const license = await db.query.sdkLicenses.findFirst({
          where: eq(sdkLicenses.stripeSubscriptionId, stripeSubscriptionId),
        });

        if (!license) {
          console.log("No license found for subscription:", stripeSubscriptionId);
          return NextResponse.json({ received: true, type: "ignored" });
        }

        // Map Stripe subscription status to license status
        let licenseStatus: "active" | "expired" | "revoked" = "active";
        if (status === "canceled" || status === "unpaid" || status === "past_due") {
          licenseStatus = "expired";
        } else if (status === "active" || status === "trialing") {
          licenseStatus = "active";
        }

        await db.update(sdkLicenses)
          .set({
            status: licenseStatus,
            expiresAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            updatedAt: new Date(),
          })
          .where(eq(sdkLicenses.id, license.id));

        console.log("Updated license status:", license.id, "to", licenseStatus);

        return NextResponse.json({
          received: true,
          licenseId: license.id,
          status: licenseStatus,
          type: "updated",
        });
      }

      default:
        console.log("Unhandled event type:", event.type);
        return NextResponse.json({ received: true, type: "ignored" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Report to Sentry
    captureException(error as Error, {
      context: 'webhook_processing',
      eventType: event?.type,
      stripeEventId: event?.id,
    });
    
    // Update log with failure
    if (stripeEventId) {
      updateWebhookStatus(stripeEventId, 'failed', String(error)).catch(() => {});
    }
    
    return NextResponse.json(
      { error: "Webhook processing failed", details: String(error) },
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
