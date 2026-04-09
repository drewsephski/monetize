# Stripe Webhook Configuration Guide

Drew Billing requires Stripe webhooks for real-time event handling (checkout completion, subscription updates, etc.).

## Production Webhook Setup

### 1. Access Stripe Dashboard

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Switch to **Production** mode (top left toggle)
3. Navigate to **Developers → Webhooks**

### 2. Add Production Endpoint

Click **+ Add endpoint** and configure:

| Setting | Value |
|---------|-------|
| **Endpoint URL** | `https://monetize-two.vercel.app/api/webhooks/license` |
| **Description** | Drew Billing License Webhook |
| **API version** | Latest (or match your SDK version) |

### 3. Select Events to Listen For

Check these event types:

- [x] `checkout.session.completed` - License creation
- [x] `customer.subscription.updated` - Subscription changes
- [x] `customer.subscription.deleted` - Cancellation handling

### 4. Get Webhook Secret

After creating the endpoint:

1. Click on your new endpoint
2. Click **Reveal** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)

### 5. Add to Environment Variables

```bash
# Production environment (Vercel, etc.)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Local Development with Stripe CLI

For local testing, use Stripe CLI to forward webhooks:

### 1. Install Stripe CLI

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:** See [Stripe CLI docs](https://docs.stripe.com/stripe-cli)

### 2. Login to Stripe

```bash
stripe login
# This opens a browser to authenticate
```

### 3. Start Webhook Forwarding

```bash
# Use the built-in script
bun run stripe:webhook

# Or manually
stripe listen --forward-to http://localhost:3000/api/webhooks/license \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted
```

### 4. Test the Webhook

The CLI will give you a webhook signing secret for local use. Add it to your `.env`:

```bash
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx  # From `stripe listen` output
```

## Testing Webhooks

### Test a Complete Purchase Flow

```bash
# 1. Start your dev server
bun run dev

# 2. In another terminal, start webhook forwarding
bun run stripe:webhook

# 3. Visit http://localhost:3000/pricing

# 4. Click a plan and complete checkout with test card:
#    Card: 4242 4242 4242 4242
#    Expiry: Any future date
#    CVC: Any 3 digits

# 5. Check your terminal for webhook logs
```

### Trigger Test Events Manually

```bash
# Trigger a test checkout.session.completed
stripe trigger checkout.session.completed

# Trigger subscription update
stripe trigger customer.subscription.updated
```

## Webhook Security

Drew Billing implements multiple security layers:

1. **Stripe Signature Verification** - Validates webhook authenticity
2. **IP Allowlist** - Only accepts requests from Stripe webhook IPs
3. **Rate Limiting** - Prevents webhook abuse
4. **Idempotency** - Prevents duplicate processing

## Troubleshooting

### Webhooks not received

- Check endpoint URL is correct and publicly accessible
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Stripe Dashboard webhook logs for failed deliveries
- Ensure your server responds with 2xx status

### Signature verification failed

- Ensure you're using the correct webhook secret
- Don't modify the raw payload before verification
- Check that payload is read as raw text, not parsed JSON

### License not created after checkout

- Check webhook is configured for `checkout.session.completed`
- Verify customer email is collected in checkout
- Check server logs for webhook processing errors
- Look for idempotency conflicts (license already exists)

## Webhook Endpoint Details

| Endpoint | Purpose | Events |
|----------|---------|--------|
| `/api/webhooks/license` | SDK license management | checkout.session.completed, customer.subscription.updated, customer.subscription.deleted |
| `/api/stripe/webhook` | SaaS subscription handling | (if using Drew Billing Cloud) |

## Production Checklist

- [ ] Production webhook endpoint created in Stripe
- [ ] Correct events selected (checkout.session.completed, subscription events)
- [ ] Webhook secret copied and added to production env
- [ ] Endpoint tested with real purchase
- [ ] License created successfully in database
- [ ] Email sent to customer
- [ ] Stripe dashboard shows successful deliveries (green checkmarks)

## Next Steps

After Stripe webhooks are configured:

1. [Deploy to production](./DEPLOY_CHECKLIST.md)
2. Run end-to-end test
3. Go live!

## Useful Stripe CLI Commands

```bash
# List all triggers
stripe trigger --list

# Forward to multiple endpoints
stripe listen --forward-to http://localhost:3000/api/webhooks/license \
              --forward-to http://localhost:3000/api/stripe/webhook

# View recent events
stripe logs tail

# Test specific event with custom data
stripe trigger checkout.session.completed \
  --add "checkout_session:client_reference_id=sdk_test_123"
```
