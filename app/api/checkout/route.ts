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
  const requestLogger = createRequestLogger(requestId, "/api/checkout");

  try {
    const body = await req.json();
    const { priceId, userId, successUrl, cancelUrl, trialDays, metadata } = body;

    requestLogger.info({ userId, priceId }, "Creating checkout session");

    if (!priceId || !userId) {
      requestLogger.warn("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: priceId, userId" },
        { status: 400 }
      );
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    let stripeCustomerId = customer?.stripeCustomerId;

    if (!stripeCustomerId) {
      requestLogger.info("Creating new Stripe customer");
      
      const stripeCustomer = await stripe.customers.create(
        {
          metadata: { userId },
        },
        {
          idempotencyKey: `customer-create-checkout-${userId}`,
        }
      );
      stripeCustomerId = stripeCustomer.id;

      if (!customer) {
        await db.insert(customers)
          .values({
            userId,
            stripeCustomerId,
          })
          .onConflictDoNothing({ target: customers.stripeCustomerId });
        requestLogger.info({ stripeCustomerId }, "Created customer record");
      }
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/dashboard`,
      client_reference_id: userId,
      metadata: {
        userId,
        ...metadata,
      },
      subscription_data: trialDays && trialDays > 0
        ? { trial_period_days: trialDays }
        : undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    requestLogger.info({ sessionId: session.id }, "Checkout session created");
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    requestLogger.error({ error: errorMessage }, "Checkout error");
    return NextResponse.json(
      { error: errorMessage, requestId },
      { status: 500 }
    );
  }
}
