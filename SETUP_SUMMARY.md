# Billing Integration - Implementation Summary

## What Was Fixed

### 1. Pricing Consistency

**Problem:** Template pricing cards showed different prices than what Stripe products were created with.

**Solution:** Updated all templates and examples to match Stripe product prices:

| Template | Before | After |
|----------|--------|-------|
| SaaS | Growth $24, Scale $79 | **Pro $29, Enterprise $99** |
| API | Pro $29, Enterprise $99 | **Pro $29, Enterprise $99** ✓ |
| Usage/AI | Studio $24, Scale $79 | **Pro $29, Enterprise $99** |

**Files Modified:**

- `packages/cli/templates/saas/lib/site.ts`
- `packages/cli/templates/api/lib/site.ts`
- `packages/cli/templates/usage/lib/site.ts`
- `examples/saas-starter/lib/site.ts`
- `examples/ai-credits/lib/site.ts`

Added `priceIdMap` exports to all templates for consistent plan-to-price mapping.

---

## New CLI Command: `setup-webhook`

Created an interactive wizard that guides users through proper webhook setup:

```bash
npx drew-billing-cli setup-webhook
```

### Features

- **Local Development Mode:** Checks for Stripe CLI, guides through `stripe listen`
- **Production Mode:** Deploy-first workflow with Vercel URL capture
- **Complete Checklist:** Step-by-step deployment checklist

### Why This Approach?

**Yes, webhooks are mandatory for production.** They are the only reliable way to:

1. Sync subscription state to your database
2. Handle renewals, cancellations, payment failures
3. Keep user entitlements accurate

The wizard follows Stripe/Vercel best practices:

1. **Deploy first** → Get production URL
2. **Create webhook endpoint** with that URL
3. **Configure secrets** in Vercel environment

---

## Architecture: Stripe ↔ Neon Postgres Sync

### Database Tables (from `drizzle/schema.ts`)

```
customers           → Links app users to Stripe customers
subscriptions       → Mirrors Stripe subscription state  
invoices            → Payment history
stripeEvents        → Idempotency + audit log
plans               → Local plan definitions with stripePriceId
```

### Webhook Event Flow

```
Stripe Event → Webhook Handler → Database Transaction → Acknowledge
                    ↓
            Idempotency Check (skip if evt_ seen)
                    ↓
            Update customers/subscriptions/invoices
```

### Critical Events Handled

| Event | Database Action |
|-------|-----------------|
| `checkout.session.completed` | Create customer record |
| `customer.subscription.created` | Insert subscription |
| `customer.subscription.updated` | Update status/period |
| `customer.subscription.deleted` | Mark canceled |
| `invoice.paid` | Record payment |
| `invoice.payment_failed` | Set past_due status |

---

## Recommended Setup Flow for Users

### Phase 1: Initialize (5 min)

```bash
npx drew-billing-cli init --template saas
npm run dev
```

App runs in sandbox mode - checkout redirects immediately.

### Phase 2: Local Webhook Testing (10 min)

```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/billing/webhook

# Add webhook secret to .env.local
# Test checkout at http://localhost:3000/pricing
```

Or use the wizard:

```bash
npx drew-billing-cli setup-webhook
```

### Phase 3: Deploy to Vercel (10 min)

```bash
git push origin main
# Connect GitHub repo to Vercel
# Add environment variables in Vercel Dashboard
```

### Phase 4: Production Webhook (10 min)

```bash
npx drew-billing-cli setup-webhook --production
```

Wizard guides:

1. Enter production URL
2. Creates webhook endpoint in Stripe Dashboard
3. Subscribes to required events
4. Prompts for webhook secret
5. Reminds to add to Vercel env vars

---

## Key Implementation Details

### 1. Idempotency

Every Stripe event has unique `evt_` ID. Store in `stripeEvents` table and skip if already processed:

```typescript
const existing = await db.query.stripeEvents.findFirst({
  where: eq(stripeEvents.id, event.id),
});

if (existing?.processed) {
  return NextResponse.json({ received: true, idempotent: true });
}
```

### 2. Error Handling

- Return 500 for processing failures → Stripe retries
- Store error in `stripeEvents.lastError`
- Log to console for debugging

### 3. Database Transactions

All webhook processing wrapped in transactions:

```typescript
await db.transaction(async (tx) => {
  // Record event
  // Process business logic
  // Mark as processed
});
```

### 4. Status Normalization

Stripe has many statuses (`active`, `trialing`, `past_due`, etc.).
Normalize to a simpler enum for your app logic.

---

## Production Checklist

Before going live:

- [ ] Stripe account activated (not test mode)
- [ ] Products created in live mode with correct prices
- [ ] Database migrated (`drizzle-kit push`)
- [ ] Deployed to Vercel with all env vars
- [ ] Webhook endpoint created with production URL
- [ ] All 6 required events subscribed
- [ ] Webhook secret added to Vercel
- [ ] Test checkout with real card + refund
- [ ] Verify subscription appears in database
- [ ] Test cancellation flow
- [ ] Monitor webhook delivery logs

---

## Files Added/Modified

### New Files

- `packages/cli/src/commands/setup-webhook.ts` - Interactive webhook wizard
- `INTEGRATION.md` - Complete technical guide
- `SETUP_SUMMARY.md` - This file

### Modified Files

- `packages/cli/src/index.ts` - Added setup-webhook command
- `packages/cli/src/commands/init.ts` - Added webhook guidance in output
- All template `lib/site.ts` files - Fixed pricing consistency

---

## FAQ

**Q: Are webhooks really mandatory?**
A: Yes for production. Without them, your database won't know when subscriptions renew, payments fail, or users cancel. The dashboard would show stale data.

**Q: Why deploy first, then create webhook?**
A: Stripe webhooks require a public URL. You can't create the endpoint until you have the deployed URL. This is standard practice.

**Q: What if my webhook handler is down?**
A: Stripe retries for 72 hours with exponential backoff. Events are not lost.

**Q: Can I test webhooks locally?**
A: Yes, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`

**Q: Do I need separate webhooks for staging/production?**
A: Yes. Each environment should have its own webhook endpoint with its own secret.

---

## Next Steps

1. Review `INTEGRATION.md` for complete webhook handler code
2. Test the `setup-webhook` wizard locally
3. Deploy an example app and run through the full flow
4. Monitor webhook delivery in Stripe Dashboard
