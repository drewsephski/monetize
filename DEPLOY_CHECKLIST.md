# Production Deployment Checklist

Complete this checklist before launching Drew Billing to production.

## Pre-Deploy: Environment Variables

Create a `.env.production` file or configure in your hosting platform:

### Required Variables

```bash
# Database (Neon, Supabase, or self-hosted)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Stripe (Production keys!)
STRIPE_SECRET_KEY=sk_live_<your_production_key>
STRIPE_WEBHOOK_SECRET=whsec_<your_webhook_secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your_publishable_key>

# Drew Billing SaaS Price IDs (create these in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_live_xxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_GROWTH=price_live_xxxxxxxx

# Drew Billing SDK License Price IDs
NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO=price_live_xxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM=price_live_xxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE=price_live_xxxxxxxx

# Email (Resend)
RESEND_API_KEY=re_<your_resend_api_key>
RESEND_FROM_EMAIL=billing@monetize-two.vercel.app

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-32-char-min-secret-key-here
NEXT_PUBLIC_APP_URL=https://monetize-two.vercel.app
```

### Optional Variables

```bash
# Error Tracking (Sentry)
SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxx

# Analytics (PostHog - P3)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Pre-Deploy: Database

### 1. Create Production Database

**Using Neon (Recommended):**

```bash
# Neon provides serverless Postgres with branching
# Sign up at neon.tech, create a project, copy connection string
```

**Using Vercel Postgres:**

```bash
# Already included if deploying to Vercel
# Automatic in Vercel Dashboard → Storage → Create Database
```

### 2. Run Database Migrations

```bash
# Set production database URL temporarily
export DATABASE_URL="your-production-db-url"

# Run migrations
bun run db:migrate

# Or push schema directly (use with caution)
bun run db:push
```

### 3. Seed Initial Data

```bash
# Seed subscription plans
bun run seed:plans

# Or run directly
npx tsx scripts/seed-plans.ts
```

## Pre-Deploy: Stripe Setup

### 1. Create Production Products & Prices

Run the setup script:

```bash
# Set production Stripe key
export STRIPE_SECRET_KEY=sk_live_<your_key>

# Create products
npx tsx scripts/create-stripe-sdk-products.ts

# Copy the returned price IDs to your environment variables
```

### 2. Configure Webhooks

See [SETUP_STRIPE.md](./SETUP_STRIPE.md) for detailed instructions.

Quick summary:

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://monetize-two.vercel.app/api/webhooks/license`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode vs Live Mode

- Ensure you're using `sk_live_` keys (not `sk_test_`)
- Webhooks must be configured in Live mode
- Test purchases will use real money - use small amounts for testing

## Deploy Steps

### Option 1: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy production
vercel --prod

# Or deploy via git push (if connected)
git push origin main
```

### Option 2: Deploy to Other Platforms

**General steps:**

1. Build the application: `bun run build`
2. Set all environment variables
3. Start the server: `bun run start`
4. Configure domain and SSL

## Post-Deploy Verification

### 1. Health Check

```bash
# Test main endpoints
curl https://monetize-two.vercel.app/api/health
curl https://monetize-two.vercel.app/api/license/validate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"test"}'
```

### 2. Database Connectivity

```bash
# Verify migrations ran
# Check Drizzle Studio (if configured)
bun run db:studio
```

### 3. Stripe Webhook Verification

In Stripe Dashboard:

- Go to Developers → Webhooks
- Check that recent deliveries show green checkmarks
- No red X's or "Failed" statuses

### 4. Email Test

```bash
# Send test email
curl -X POST https://monetize-two.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### 5. End-to-End Purchase Test

1. Visit `https://monetize-two.vercel.app/pricing`
2. Select a plan
3. Complete checkout with real card (small amount)
4. Verify:
   - [ ] Checkout successful
   - [ ] License created in database
   - [ ] Email received with license key
   - [ ] License validation API works

## Rollback Plan

If issues are detected:

### Immediate Rollback (Vercel)

```bash
# Redeploy previous version
vercel rollback [deployment-url]

# Or in Vercel Dashboard:
# Deployments → [Previous Working Version] → Promote to Production
```

### Database Rollback

```bash
# If using Neon, restore from backup or branch
# Neon Dashboard → Branches → Create from main (point-in-time restore)
```

### Stripe Mode Switch

If critical issues occur:

1. Disable production webhook endpoint
2. Switch checkout to test mode temporarily
3. Fix issues, redeploy, re-enable webhooks

## Monitoring Setup

### 1. Sentry Error Tracking (Optional but Recommended)

Already configured if `SENTRY_DSN` is set. Verify in Sentry dashboard after deploy.

### 2. Uptime Monitoring (Recommended)

Use UptimeRobot, Pingdom, or Vercel Analytics:

- Monitor `https://monetize-two.vercel.app/api/health`
- Alert on 5xx errors or downtime

### 3. Stripe Dashboard Monitoring

- Enable email alerts for failed webhooks
- Monitor dispute rates and chargebacks

## Final Launch Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied
- [ ] Stripe products/prices created with live keys
- [ ] Stripe webhooks configured with production endpoint
- [ ] Resend domain verified (or sending from default domain)
- [ ] Deployed successfully with no build errors
- [ ] Health check endpoints responding 200
- [ ] Test purchase completed end-to-end
- [ ] Email received with license key
- [ ] License validation API working
- [ ] Rollback plan documented
- [ ] Monitoring enabled

## Post-Launch Actions

1. **Announce the launch** - Post on Twitter, LinkedIn, Hacker News, etc.
2. **Monitor closely** - Watch error logs, support requests for 24-48 hours
3. **Gather feedback** - Early users often find edge cases
4. **Iterate** - Prioritize P3 features based on user feedback

## Troubleshooting Production Issues

### Database connection errors

- Check `DATABASE_URL` includes `?sslmode=require`
- Verify IP allowlist includes hosting platform
- Check connection pool limits

### Stripe webhook failures

- Verify webhook URL is publicly accessible
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Look at Stripe webhook logs for specific errors

### Email not sending

- Verify `RESEND_API_KEY` is production key
- Check domain verification status
- Review Resend dashboard for delivery logs

### Build failures

- Ensure all dependencies installed: `bun install`
- Check for environment variables used at build time
- Verify Node.js version compatibility (>=18)

## Support

If issues persist:

- Check [GitHub Issues](https://github.com/drewsephski/monetize/issues)
- Review server logs in hosting platform
- Contact Stripe support for payment issues
- Contact Resend support for email delivery issues

**You're ready to ship! 🚀**
