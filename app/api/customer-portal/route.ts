import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { customers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import { createRequestLogger } from "@/lib/logger";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId, "/api/customer-portal");

  try {
    const body = await req.json();
    const {
      userId,
      returnUrl,
      flow,
      subscriptionId,
    }: {
      userId: string;
      returnUrl?: string;
      flow?: "payment_method_update" | "subscription_cancel" | "subscription_update";
      subscriptionId?: string;
    } = body;

    requestLogger.info({ userId, flow }, "Creating customer portal session");

    if (!userId) {
      requestLogger.warn("Missing required field: userId");
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    if (!customer?.stripeCustomerId) {
      requestLogger.warn({ userId }, "Customer not found");
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Build portal session configuration
    const sessionConfig: Stripe.BillingPortal.SessionCreateParams = {
      customer: customer.stripeCustomerId,
      return_url: returnUrl || `${req.headers.get("origin")}/dashboard`,
    };

    // Add flow data for deep linking
    if (flow) {
      switch (flow) {
        case "payment_method_update":
          sessionConfig.flow_data = {
            type: "payment_method_update",
          };
          break;
        case "subscription_cancel":
          if (subscriptionId) {
            sessionConfig.flow_data = {
              type: "subscription_cancel",
              subscription_cancel: {
                subscription: subscriptionId,
              },
            };
          }
          break;
        case "subscription_update":
          if (subscriptionId) {
            sessionConfig.flow_data = {
              type: "subscription_update",
              subscription_update: {
                subscription: subscriptionId,
              },
            };
          }
          break;
      }
    }

    const session = await stripe.billingPortal.sessions.create(sessionConfig);

    requestLogger.info(
      { sessionId: session.id, flow },
      "Customer portal session created"
    );

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      flow,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    requestLogger.error({ error: errorMessage }, "Portal error");

    // Handle Stripe-specific errors
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message, code: err.code, requestId },
        { status: err.statusCode || 400 }
      );
    }

    return NextResponse.json({ error: errorMessage, requestId }, { status: 500 });
  }
}
