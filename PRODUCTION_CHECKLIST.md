# Production Readiness Checklist for Drew Billing

## Current Status: 60% Complete

**Last Updated:** April 9, 2026
**Estimated Time to Launch:** 1 week

---

## CRITICAL BLOCKERS (Must Fix Before Launch)

### 1. Email Delivery System

**Priority:** P0 - CRITICAL
**Why:** Customers who buy SDK licenses won't receive their license keys without this.

**Implementation:**

- [ ] Install Resend: `bun add resend`
- [ ] Create `lib/email.ts` with email sending utilities
- [ ] Create email template for license key delivery
- [ ] Update `app/api/webhooks/license/route.ts` to send email on license creation
- [ ] Add Resend API key to environment variables
- [ ] Test email delivery with sandbox mode

**Files to Create/Modify:**

```
lib/email.ts (NEW)
app/api/webhooks/license/route.ts (MODIFY)
.env.local (ADD: RESEND_API_KEY)
```

---

### 2. NPM Package Publishing

**Priority:** P0 - CRITICAL
**Why:** Customers can't `npm install` the SDK or CLI.

**SDK Package (`packages/sdk/`):**

- [ ] Update `package.json` with correct name: `@drew/billing-sdk`
- [ ] Add `files` array to include `dist/` in publish
- [ ] Add `prepublishOnly` script to build
- [ ] Create `.npmignore` file
- [ ] Run `npm publish --access public`

**CLI Package (`packages/cli/`):**

- [ ] Update `package.json` with correct name: `@drew/billing-cli`
- [ ] Ensure `bin` field points to correct entry
- [ ] Add `files` array
- [ ] Run `npm publish --access public`

---

### 3. Real Stripe Price Configuration

**Priority:** P0 - CRITICAL
**Why:** SDK purchases use placeholder price IDs that don't exist.

**Actions:**

- [ ] Create Stripe products:
  - "Drew Billing SDK - Pro" ($29/mo)
  - "Drew Billing SDK - Team" ($99/mo)
  - "Drew Billing SDK - Enterprise" ($499/mo)
- [ ] Copy price IDs to environment variables:

```bash
NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM=price_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE=price_...
```

- [ ] Update `app/pricing/page.tsx` to use real price IDs

---

## HIGH PRIORITY (Fix Before Public Launch)

### 4. Usage Metering & Enforcement

**Priority:** P1 - HIGH
**Why:** Free tier users could exceed limits without enforcement.

**Implementation:**

- [ ] Create `lib/sdk-usage.ts` for tracking API calls
- [ ] Add middleware to increment usage counters
- [ ] Create usage check helper that enforces limits
- [ ] Add rate limiting with Upstash Redis or similar
- [ ] Return 429 errors when limits exceeded
- [ ] Show usage in dashboard

**Database:**

- Table: `sdk_license_usage` (already exists)
- Track: api_calls, last_reset_at

---

### 5. License Management Dashboard

**Priority:** P1 - HIGH
**Why:** Customers need to see and manage their license keys.

**Implementation:**

- [ ] Create `app/dashboard/licenses/page.tsx`
- [ ] Show all licenses for current user
- [ ] Display license keys (masked with reveal button)
- [ ] Show usage stats per license
- [ ] Add "Regenerate Key" functionality
- [ ] Add "Copy to Clipboard" button

---

### 6. Production Environment Setup

**Priority:** P1 - HIGH

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://...

# Stripe (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# SDK Price IDs
NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO=price_live_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM=price_live_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE=price_live_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=billing@monetize-two.vercel.app

# Auth
BETTER_AUTH_SECRET=...

# Optional: Error Tracking
SENTRY_DSN=...
```

---

## MEDIUM PRIORITY (Nice to Have)

### 7. Error Monitoring

**Priority:** P2 - MEDIUM

- [ ] Add Sentry integration
- [ ] Configure error alerts
- [ ] Add logging for critical paths

### 8. Documentation

**Priority:** P2 - MEDIUM

- [ ] Create `/docs` route with:
  - Getting Started guide
  - SDK integration guide
  - CLI usage guide
  - API reference

### 9. Webhook Security Hardening

**Priority:** P2 - MEDIUM

- [ ] Verify Stripe webhook signatures
- [ ] Add IP allowlisting
- [ ] Add request logging

---

## LOW PRIORITY (Post-Launch)

### 10. Analytics & Metrics

**Priority:** P3 - LOW

- [ ] Add PostHog or Mixpanel
- [ ] Track conversion rates
- [ ] Monitor license activation

### 11. Billing Portal

**Priority:** P3 - LOW

- [ ] Integrate Stripe Customer Portal
- [ ] Let users manage subscriptions

---

## Testing Checklist

### Before Launch

- [ ] End-to-end SDK purchase flow works
- [ ] License email received with valid key
- [ ] CLI validates license correctly
- [ ] Usage limits enforced
- [ ] Dashboard shows correct data
- [ ] Webhooks process correctly

### Load Testing

- [ ] Handle 100 concurrent users
- [ ] Webhook processing under load
- [ ] Database query performance

---

## Launch Sequence

### Week 1: Critical Fixes

1. **Day 1-2:** Email system + Resend setup
2. **Day 3:** Publish NPM packages
3. **Day 4:** Create real Stripe prices
4. **Day 5:** Usage enforcement

### Week 2: Polish & Launch

1. **Day 1:** License dashboard
2. **Day 2:** Documentation
3. **Day 3:** Production environment setup
4. **Day 4:** Testing & bug fixes
5. **Day 5:** Soft launch (5 beta users)
6. **Day 6-7:** Fix issues, public launch

---

## Success Metrics for Launch

- [ ] Zero critical bugs
- [ ] Email delivery rate >95%
- [ ] SDK install works with `npm install @drew/billing-sdk`
- [ ] CLI install works with `npx @drew/billing-cli`
- [ ] Stripe webhooks processing correctly
- [ ] License validation working end-to-end

---

## Notes for AI Agent

**Architecture Understanding:**

- This is a "deploy-your-own" billing platform, not a central service
- Customers host their own instances
- You sell licenses to use the software
- Revenue comes from SDK license sales + SaaS subscriptions

**Tech Stack:**

- Next.js 16 + React 19
- Drizzle ORM + PostgreSQL
- Stripe for payments
- Better Auth for authentication
- Resend for email (to be added)

**Critical Files:**

- `app/api/webhooks/license/route.ts` - Must send email
- `packages/sdk/src/license.ts` - SDK license validation
- `packages/cli/src/commands/init.ts` - CLI license check
- `app/pricing/page.tsx` - Product selection UI
