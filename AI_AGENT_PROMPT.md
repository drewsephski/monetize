# AI Agent Prompt: Complete Drew Billing Production Implementation

## Project Overview

Drew Billing is a dual-product billing platform:

1. **Drew Billing Cloud** - SaaS billing platform (we host)
2. **Drew Billing SDK** - License-based SDK customers embed in their apps

Current Status: ~60% complete. Need to implement email delivery, publish NPM packages, and production hardening.

## Your Mission

Implement ALL missing pieces to get this product launch-ready. Follow the priority order below.

---

## CRITICAL PRIORITY (P0) - Must Complete First

### 1. Email Delivery System

**Problem:** Customers who buy SDK licenses don't receive their license keys.
**Solution:** Implement Resend email service.

**Files to Create:**

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLicenseEmail({
  to,
  licenseKey,
  tier,
  customerName,
}: {
  to: string;
  licenseKey: string;
  tier: string;
  customerName?: string;
}) {
  // Send email with license key
  // Include: license key, tier, setup instructions
}
```

**Files to Modify:**

- `app/api/webhooks/license/route.ts` - Add email sending after license creation
- `.env.local` - Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

**Test:**

```bash
# Should receive email with license key after purchase
```

---

### 2. NPM Package Publishing Setup

**Problem:** SDK and CLI can't be installed via npm.
**Solution:** Configure and publish both packages.

**SDK Package (`packages/sdk/`):**

```json
// package.json updates:
{
  "name": "@drew/billing-sdk",
  "version": "1.0.0",
  "description": "Billing SDK for Node.js applications",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist/"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Create `.npmignore`:

```
node_modules/
*.test.ts
.env
```

**CLI Package (`packages/cli/`):**

```json
// package.json updates:
{
  "name": "@drew/billing-cli",
  "version": "1.0.0",
  "description": "CLI for Drew Billing setup",
  "bin": {
    "drew-billing": "./dist/index.js"
  },
  "files": ["dist/", "templates/"],
  "publishConfig": {
    "access": "public"
  }
}
```

---

### 3. Real Stripe Price Configuration

**Problem:** SDK purchases use placeholder price IDs.
**Solution:** Create real Stripe products and update config.

**Action Steps:**

1. Create products in Stripe Dashboard:
   - Product: "Drew Billing SDK - Pro" → Price: $29/month recurring
   - Product: "Drew Billing SDK - Team" → Price: $99/month recurring  
   - Product: "Drew Billing SDK - Enterprise" → Price: $499/month recurring

2. Copy price IDs to environment:

```bash
NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO=price_live_xxx
NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM=price_live_xxx
NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE=price_live_xxx
```

---

## HIGH PRIORITY (P1)

### 4. Usage Metering & Enforcement

**Problem:** Free tier users can exceed limits without enforcement.
**Solution:** Track and enforce SDK usage limits.

**Files to Create:**

```typescript
// lib/sdk-usage.ts
export async function trackApiCall(licenseKey: string) {
  // Increment usage counter in sdk_license_usage table
  // Check if limit exceeded
  // Return { allowed: boolean, remaining: number }
}

export async function checkUsageLimit(licenseKey: string): Promise<boolean> {
  // Returns true if within limit, false if exceeded
}
```

**Files to Modify:**

- `sdk/src/license.ts` - Add usage tracking to validateLicense()
- Create middleware for API routes to enforce limits

---

### 5. License Management Dashboard

**Problem:** No UI for customers to view/manage their licenses.
**Solution:** Create license management page.

**Files to Create:**

```typescript
// app/dashboard/licenses/page.tsx
// Features:
// - List all licenses for current user
// - Show license keys (masked, with reveal button)
// - Show usage stats per license
// - Copy to clipboard button
// - Regenerate key button (with confirmation)
```

**API Routes to Create:**

- `GET /api/licenses` - List user's licenses
- `POST /api/licenses/:id/regenerate` - Generate new key

---

## MEDIUM PRIORITY (P2)

### 6. Production Environment Variables

Create `.env.production` template:

```bash
# Database
DATABASE_URL=postgresql://...

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# SDK Prices (LIVE)
NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO=price_live_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM=price_live_...
NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE=price_live_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=billing@monetize-two.vercel.app

# Auth
BETTER_AUTH_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://monetize-two.vercel.app
```

---

### 7. Error Monitoring (Sentry)

**Files to Create:**

```typescript
// lib/sentry.ts
// Initialize Sentry for error tracking
// Add to critical paths: webhooks, license validation, checkout
```

---

## IMPLEMENTATION ORDER

Follow this exact order:

1. **Email System** (Day 1)
   - Install Resend
   - Create email templates
   - Integrate into webhook

2. **NPM Packages** (Day 1-2)
   - Configure package.json files
   - Create .npmignore
   - Build and publish both packages

3. **Stripe Prices** (Day 2)
   - Create products in dashboard
   - Update env vars
   - Test purchases

4. **Usage Enforcement** (Day 3)
   - Create usage tracking
   - Add middleware
   - Test limit enforcement

5. **License Dashboard** (Day 4)
   - Create page
   - Add API routes
   - Test functionality

6. **Production Setup** (Day 5)
   - Environment variables
   - Error monitoring
   - Webhook security

7. **Testing** (Day 6-7)
   - End-to-end flows
   - Load testing
   - Bug fixes

---

## TESTING CHECKLIST

Before marking complete, verify:

- [ ] SDK purchase → Email received with license key
- [ ] `npm install @drew/billing-sdk` works
- [ ] `npx @drew/billing-cli` works
- [ ] CLI with valid license shows "Pro license active"
- [ ] CLI without license shows "Free tier"
- [ ] Usage limits enforced (429 after limit)
- [ ] Dashboard shows licenses correctly
- [ ] Stripe webhooks process without errors
- [ ] All TypeScript compiles (`bun tsc --noEmit`)

---

## KEY ARCHITECTURAL NOTES

**This is NOT a central service.** Customers host their own instances.

**Revenue Model:**

- You sell licenses ($29-$499/mo)
- Customers deploy to Vercel/Railway/etc
- Customers use their own Stripe accounts
- You collect license fees

**Critical Paths:**

1. Webhook creates license → Email sent → Customer gets key
2. Customer installs SDK → Enters license key → Features unlocked
3. CLI validates license on init → Gates features by tier

**Database Tables:**

- `sdk_licenses` - License keys and metadata
- `sdk_license_usage` - Usage tracking
- `customers` - Stripe customer linkage
- `subscriptions` - Subscription state

---

## HANDOFF CHECKLIST

When complete, provide:

1. All modified files committed
2. Test results showing all critical paths work
3. Environment variable template for production
4. Deploy instructions
5. Any manual steps needed (Stripe setup, etc.)

---

## QUESTIONS?

If unclear on any requirement:

1. Check `PRODUCTION_CHECKLIST.md` for context
2. Review existing code in `packages/sdk/` and `packages/cli/`
3. Look at `drizzle/schema.ts` for database structure

**Do not proceed without understanding the dual-product model.**
