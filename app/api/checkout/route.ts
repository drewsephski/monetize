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

// Check if sandbox mode is enabled for better error messages
const isSandboxMode = env.billingSandboxMode;

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

    let customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    let stripeCustomerId = customer?.stripeCustomerId;

    if (!stripeCustomerId) {
      requestLogger.info("Creating new Stripe customer");
      
      try {
        const stripeCustomer = await stripe.customers.create(
          {
            metadata: { userId },
          },
          {
            idempotencyKey: `customer-create-checkout-${userId}-${Date.now()}`,
          }
        );
        stripeCustomerId = stripeCustomer.id;
      } catch (stripeError) {
        requestLogger.error({ error: stripeError }, "Failed to create Stripe customer");
        return NextResponse.json(
          { 
            error: "Failed to create Stripe customer. Please check your Stripe configuration.",
            details: stripeError instanceof Error ? stripeError.message : "Unknown Stripe error",
            sandboxTip: isSandboxMode ? undefined : "Try: BILLING_SANDBOX_MODE=true npm run dev"
          },
          { status: 500 }
        );
      }

      if (!customer) {
        try {
          // Use returning() to get the inserted row, or null if conflict occurred
          const [insertedCustomer] = await db.insert(customers)
            .values({
              userId,
              stripeCustomerId,
            })
            .onConflictDoNothing({ target: customers.stripeCustomerId })
            .returning();
          
          if (insertedCustomer) {
            customer = insertedCustomer;
            requestLogger.info({ stripeCustomerId, customerId: insertedCustomer.id }, "Created customer record");
          } else {
            // Conflict occurred - fetch the existing customer
            const existingCustomer = await db.query.customers.findFirst({
              where: eq(customers.stripeCustomerId, stripeCustomerId),
            });
            
            if (existingCustomer) {
              customer = existingCustomer;
              requestLogger.info({ stripeCustomerId, customerId: existingCustomer.id }, "Using existing customer record");
            } else {
              throw new Error("Customer insert conflict but could not fetch existing record");
            }
          }
        } catch (dbError) {
          requestLogger.error({ error: dbError, userId, stripeCustomerId }, "Database error creating customer record");
          return NextResponse.json(
            { 
              error: "Database error while creating customer record",
              details: dbError instanceof Error ? dbError.message : "Unknown database error",
              requestId 
            },
            { status: 500 }
          );
        }
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
    requestLogger.error({ error: errorMessage, stack: err instanceof Error ? err.stack : undefined }, "Checkout error");
    
    // Provide actionable error messages based on error patterns
    let userMessage = errorMessage;
    let sandboxTip: string | undefined;
    
    if (errorMessage.includes("STRIPE_SECRET_KEY") || errorMessage.includes("apiKey")) {
      userMessage = "Stripe API key is invalid or missing";
      sandboxTip = "Check STRIPE_SECRET_KEY in .env.local or use: BILLING_SANDBOX_MODE=true npm run dev";
    } else if (errorMessage.includes("network") || errorMessage.includes("ENOTFOUND") || errorMessage.includes("ECONNREFUSED")) {
      userMessage = "Network error connecting to Stripe";
      sandboxTip = "Check your internet connection or use: BILLING_SANDBOX_MODE=true npm run dev";
    } else if (errorMessage.includes("priceId") || errorMessage.includes("price")) {
      userMessage = "Invalid price ID";
      sandboxTip = "Check that your Stripe price ID is correct in the dashboard";
    }
    
    return NextResponse.json(
      { 
        error: userMessage, 
        requestId,
        ...(sandboxTip && { sandboxTip }),
        ...(isSandboxMode && { sandboxMode: true })
      },
      { status: 500 }
    );
  }
}
