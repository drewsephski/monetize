# End-to-End Integration Guide

This guide explains how to set up a complete billing system with Stripe and Neon Postgres that persists user subscription data across both services.

## Overview

The billing system consists of:

- **Stripe** - Payment processing, subscriptions, invoices
- **Neon Postgres** - User data, subscription state, entitlements cache
- **Webhooks** - Real-time sync from Stripe to your database
- **CLI** - Setup wizard and management tools

## Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Pricing   │────▶│   Stripe     │────▶│   Webhook   │
│    Page     │     │   Checkout   │     │   Handler   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                  │
                         ┌────────────────────────┘
                         ▼
                  ┌──────────────┐
                  │ Neon Postgres │
                  │ - customers   │
                  │ - subscriptions│
                  │ - invoices    │
                  └──────────────┘
```

## Database Schema

The following tables sync with Stripe:

### `customers`

Links app users to Stripe customers.

```sql
- id (uuid, PK)
- userId (uuid, FK to users)
- stripeCustomerId (varchar, unique)
- createdAt (timestamp)
```

### `subscriptions`

Stores subscription state from Stripe.

```sql
- id (uuid, PK)
- customerId (uuid, FK)
- stripeSubscriptionId (varchar, unique)
- stripeStatus (varchar)
- status (varchar) -- normalized: active, canceled, past_due, etc.
- planId (uuid, FK to plans)
- currentPeriodStart/End (timestamp)
- trialStart/End (timestamp)
- canceledAt (timestamp)
- cancelAtPeriodEnd (boolean)
```

### `invoices`

Records payment history.

```sql
- id (uuid, PK)
- stripeInvoiceId (varchar, unique)
- customerId (uuid, FK)
- subscriptionId (uuid, FK)
- status (varchar)
- amount (integer) -- in cents
- currency (varchar)
- paidAt (timestamp)
```

### `stripeEvents`

Idempotency + audit log for webhook events.

```sql
- id (varchar, PK) -- Stripe event ID (evt_...)
- type (varchar)
- payload (jsonb)
- processed (boolean)
- attempts (integer)
- lastError (varchar)
- createdAt (timestamp)
```

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create customer + subscription records |
| `customer.subscription.created` | Insert new subscription |
| `customer.subscription.updated` | Update subscription status/period |
| `customer.subscription.deleted` | Mark as canceled |
| `invoice.paid` | Record successful payment |
| `invoice.payment_failed` | Update subscription to past_due |

## Setup Steps

### Phase 1: Initialize (Local Development)

```bash
# Create new project
npx drew-billing-cli init --template saas

# Or in existing project
npx drew-billing-cli init
```

This creates:

- Stripe products (Pro $29/mo, Enterprise $99/mo)
- Pricing page with actual Stripe prices
- Checkout route
- Webhook endpoint stub
- Database schema

### Phase 2: Local Webhook Testing

**Webhooks are mandatory for production** - they keep your database in sync with Stripe.

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login to Stripe
stripe login

# 3. Start your app
npm run dev

# 4. Forward webhooks (in new terminal)
stripe listen --forward-to localhost:3000/api/billing/webhook

# 5. Copy the webhook secret (whsec_...) to .env.local
```

Or use the wizard:

```bash
npx drew-billing-cli setup-webhook
```

### Phase 3: Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Add billing"
git push origin main

# 2. Deploy on Vercel
# Go to https://vercel.com/new
# Import your GitHub repo
```

**Required Environment Variables in Vercel:**

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_...
DATABASE_URL=postgresql://...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Phase 4: Production Webhook Setup

**⚠️ Critical: Deploy first, then configure webhooks**

You need the production URL to create the Stripe webhook endpoint.

1. **Get your production URL**
   - After Vercel deploy: `https://your-app.vercel.app`

2. **Create webhook endpoint in Stripe**
   - Go to: <https://dashboard.stripe.com/webhooks>
   - Click "Add endpoint"
   - URL: `https://your-app.vercel.app/api/billing/webhook`
   - Events to subscribe:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

3. **Add webhook secret to Vercel**
   - Copy the signing secret (whsec_...) from Stripe Dashboard
   - Add as `STRIPE_WEBHOOK_SECRET` environment variable
   - Redeploy to apply changes

Or use the wizard:

```bash
npx drew-billing-cli setup-webhook --production
```

## Implementation: Webhook Handler with Database Persistence

Replace the stub webhook handler with this production-ready version:

```typescript
// app/api/billing/webhook/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, subscriptions, invoices, stripeEvents, plans } from "@/drizzle/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Idempotency: Skip if already processed
  const existingEvent = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.id, event.id),
  });

  if (existingEvent?.processed) {
    console.log(`Event ${event.id} already processed`);
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    await db.transaction(async (tx) => {
      // Record event attempt
      if (!existingEvent) {
        await tx.insert(stripeEvents).values({
          id: event.id,
          type: event.type,
          payload: event,
          processed: false,
          attempts: 1,
        });
      } else {
        await tx
          .update(stripeEvents)
          .set({ attempts: existingEvent.attempts + 1 })
          .where(eq(stripeEvents.id, event.id));
      }

      // Process event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(tx, session);
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(tx, subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(tx, subscription);
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(tx, invoice);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentFailed(tx, invoice);
          break;
        }
      }

      // Mark as processed
      await tx
        .update(stripeEvents)
        .set({ processed: true, lastError: null })
        .where(eq(stripeEvents.id, event.id));
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Record error
    await db
      .update(stripeEvents)
      .set({
        lastError: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(stripeEvents.id, event.id));

    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleCheckoutCompleted(tx: any, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId) {
    throw new Error("No userId in session client_reference_id");
  }

  // Create/update customer
  const existingCustomer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, stripeCustomerId),
  });

  if (!existingCustomer) {
    await tx.insert(customers).values({
      userId,
      stripeCustomerId,
    });
  }

  // Subscription will be created/updated by customer.subscription.created event
  console.log("Checkout completed:", { userId, stripeCustomerId, stripeSubscriptionId });
}

async function handleSubscriptionUpdated(tx: any, subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;
  const stripePriceId = subscription.items.data[0]?.price.id;

  // Find local customer
  const customer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, stripeCustomerId),
  });

  if (!customer) {
    console.warn("Customer not found for subscription:", stripeCustomerId);
    return;
  }

  // Find plan by Stripe price ID
  const plan = stripePriceId
    ? await tx.query.plans.findFirst({
        where: eq(plans.stripePriceId, stripePriceId),
      })
    : null;

  // Normalize status
  const normalizedStatus = normalizeSubscriptionStatus(subscription.status);

  // Upsert subscription
  const existingSub = await tx.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (existingSub) {
    await tx
      .update(subscriptions)
      .set({
        stripeStatus: subscription.status,
        status: normalizedStatus,
        planId: plan?.id ?? null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialActive: subscription.status === "trialing",
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  } else {
    await tx.insert(subscriptions).values({
      customerId: customer.id,
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
      status: normalizedStatus,
      planId: plan?.id ?? null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialActive: subscription.status === "trialing",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }
}

async function handleSubscriptionDeleted(tx: any, subscription: Stripe.Subscription) {
  await tx
    .update(subscriptions)
    .set({
      status: "canceled",
      stripeStatus: subscription.status,
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleInvoicePaid(tx: any, invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const customer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, invoice.customer as string),
  });

  if (!customer) return;

  const subscription = invoice.subscription
    ? await tx.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, invoice.subscription as string),
      })
    : null;

  await tx.insert(invoices).values({
    stripeInvoiceId: invoice.id,
    customerId: customer.id,
    subscriptionId: subscription?.id ?? null,
    status: invoice.status ?? "paid",
    amount: invoice.amount_paid,
    currency: invoice.currency,
    paidAt: invoice.status === "paid" ? new Date() : null,
  });
}

async function handleInvoicePaymentFailed(tx: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  await tx
    .update(subscriptions)
    .set({
      status: "past_due",
      failedPaymentCount: sql`${subscriptions.failedPaymentCount} + 1`,
      pastDueSince: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
}

function normalizeSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    past_due: "past_due",
    paused: "paused",
    trialing: "trialing",
    unpaid: "unpaid",
  };
  return statusMap[stripeStatus] ?? stripeStatus;
}
```

## Testing the Flow

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Forward webhooks
stripe listen --forward-to localhost:3000/api/billing/webhook

# 3. Test checkout
# - Go to http://localhost:3000/pricing
# - Click "Start Pro checkout"
# - Use test card: 4242 4242 4242 4242

# 4. Verify database
# Check that customer and subscription records were created
```

### Production Testing

```bash
# 1. Deploy
vercel --prod

# 2. Test with real card (small amount, then refund)
# - Go to production pricing page
# - Complete checkout with real card

# 3. Verify webhook delivery
# - Go to Stripe Dashboard → Webhooks
# - Check recent deliveries

# 4. Check database
# - Query subscriptions table for new record
```

## Production Checklist

- [ ] Stripe live mode activated
- [ ] Products created in live mode
- [ ] Vercel project deployed
- [ ] All environment variables set in Vercel
- [ ] Webhook endpoint created with production URL
- [ ] Webhook secret added to Vercel
- [ ] Test checkout completed with real payment
- [ ] Subscription appears in database
- [ ] Webhook delivery logs show 200 OK
- [ ] Cancellation flow tested
- [ ] Invoice/payment records verified

## Troubleshooting

### Webhook signature verification failed

- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret for the endpoint
- Local CLI secret differs from production dashboard secret

### Events not processing

- Check `stripeEvents` table for errors in `lastError` column
- Ensure handler returns 200 OK for successful processing
- Return 500 for failures to trigger Stripe retry

### Database not updating

- Verify `DATABASE_URL` is correct and migrations ran
- Check that `drizzle-kit push` was executed
- Look for errors in Vercel function logs

### Subscription state out of sync

- Check `stripeEvents` table for unprocessed events
- Verify all required event types are subscribed
- Look for idempotency conflicts (duplicate event IDs)

## FAQ

**Q: Are webhooks mandatory?**
A: Yes for production. Without webhooks, your database won't know when payments succeed, subscriptions renew, or customers cancel. The dashboard would show stale data.

**Q: Can I use a single webhook for multiple environments?**
A: No. Stripe webhooks are tied to specific URLs. Create separate endpoints for local (via CLI), staging, and production.

**Q: What happens if my webhook handler fails?**
A: Stripe retries with exponential backoff for 72 hours. After that, the event goes to dead letter. Monitor your `stripeEvents` table for failures.

**Q: How do I handle idempotency?**
A: Store Stripe event IDs (`evt_...`) in your database. Skip processing if already seen. The example handler above does this automatically.
