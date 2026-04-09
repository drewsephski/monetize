# @drewsepsi/billing

**Add subscriptions to your Next.js app in 10 minutes.**

Complete billing system with CLI setup, pre-built components, and automatic webhook handling. Stop wrestling with Stripe docs.

[![Live Demo](https://img.shields.io/badge/try-live%20demo-b8860b)](https://monetize-two.vercel.app/try)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Quick Start

### Option 1: Add to Existing Project (10 minutes)

```bash
# 1. Run the CLI
npx @drewsepsi/billing-cli init

# 2. Follow the prompts - enter your Stripe keys
# The CLI creates products, sets up webhooks, and configures everything

# 3. Start your app
npm run dev

# 4. Visit /pricing — you're live!
```

### Option 2: Self-Host Drew Billing (Full Control)

```bash
# 1. Clone and setup
git clone https://github.com/drew/billing.git
cd billing
bun install

# 2. Configure environment
cp .env.example .env.local
# Add your Stripe and Resend keys

# 3. Setup database
bun run db:push

# 4. Seed plans
bun run seed:plans

# 5. Start dev server
bun run dev

# 6. In another terminal, start Stripe webhook forwarding
bun run stripe:webhook
```

---

## Pricing

### Drew Billing Cloud (Hosted SaaS)

Let us handle hosting, updates, and maintenance:

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | Free | Up to 100 customers, Community support |
| **Pro** | $29/mo | Unlimited customers, Priority support, Analytics |
| **Growth** | $99/mo | Everything in Pro + Team features, Custom integrations |

[Sign up for Cloud](https://monetize-two.vercel.app)

### Drew Billing SDK (Self-Hosted)

Own your billing infrastructure. One-time license, unlimited usage:

| Plan | Price | Best For |
|------|-------|----------|
| **Pro** | $149 | Solo developers, side projects |
| **Team** | $499 | Startups, small teams (up to 10) |
| **Enterprise** | $1,499 | Large teams, priority support, SLA |

[Buyn an SDK License](https://monetize-two.vercel.app/pricing)

**SDK Includes:**

- Complete source code
- Lifetime updates
- All features (billing, webhooks, usage tracking)
- No customer limits
- No recurring fees

---

## What You Get

### One-Line SDK

```typescript
import { BillingSDK } from "@drewsepsi/billing-sdk";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL
});

// Create checkout — returns Stripe URL
const url = await billing.createCheckout({
  priceId: "price_pro",
  userId: "user_123",
});

// Check subscription anywhere
const { hasSubscription, plan } = await billing.getSubscription("user_123");

// Feature flags + usage limits
const { features, limits } = await billing.getEntitlements("user_123");
// → { features: ["api_access", "analytics"], limits: { api_calls: 10000 } }
```

### Pre-Built Components

Drop-in pricing page, customer portal, and subscription management UI — all customizable.

### Automatic Webhooks

Webhooks handled with idempotency, retries, and database sync out of the box.

---

## 3 Example Apps

| Template | Use Case | Deploy Time |
|----------|----------|-------------|
| **SaaS Starter** | Complete app with auth, pricing, dashboard | 10 min |
| **API Billing** | Usage-based billing for APIs | 10 min |
| **AI Credits** | Credit system for AI apps | 10 min |

```bash
npx drew-billing-cli init --template saas    # or api, ai-credits
```

---

## Why Not Just Use Stripe?

| Feature | Stripe Only | @drewsepsi/billing |
|---------|-------------|---------------|
| Database schema | Build yourself | ✓ Included |
| Webhook handling | Build yourself | ✓ Automatic |
| Customer portal UI | Build yourself | ✓ Pre-built |
| Usage-based billing | Complex API | ✓ One line |
| Subscription sync | Manual | ✓ Automatic |
| **Time to launch** | 2-3 weeks | **10 minutes** |

We use Stripe under the hood. We just handle the hard parts so you don't have to.

---

## Live Demo

Try the full checkout experience (sandbox mode):

👉 **[monetize-two.vercel.app/try](https://monetize-two.vercel.app/try)**

---

## Documentation

- [Quickstart Guide](/docs/quickstart)
- [SDK Reference](/docs/sdk)
- [API Docs](/docs/api)
- [Example Apps](/examples)
- [Resend Setup](SETUP_RESEND.md)
- [Stripe Webhook Setup](SETUP_STRIPE.md)
- [Deploy Checklist](DEPLOY_CHECKLIST.md)

---

## SDK License

When you purchase a Drew Billing SDK license, you get:

1. **License Key** - Delivered via email immediately after purchase
2. **Full Source Code** - Everything in this repository
3. **Lifetime Updates** - All future versions included
4. **Usage Rights** - Use in unlimited projects per license tier

### Using Your License

```bash
# 1. Set your license key
export DREW_BILLING_LICENSE_KEY="your-license-key"

# 2. Install the SDK
npm install @drewsepsi/billing-sdk

# 3. The SDK validates your license automatically
# See SDK documentation for details
```

### License Validation

The SDK automatically validates your license on startup. Your license key is:

- Tied to your email address
- Valid for the tier you purchased (Pro/Team/Enterprise)
- Renewable if lost (contact support)

---

## Local Development

```bash
# Clone and install
git clone https://github.com/drew/billing.git
cd billing
bun install

# Setup environment
cp .env.example .env
# Add your Stripe keys to .env

# Database
bun run db:push      # Push schema
bun run db:studio    # Drizzle Studio

# Run dev server
bun run dev

# Stripe webhooks (separate terminal)
bun run stripe:webhook
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth
- **Payments:** Stripe
- **Styling:** Tailwind CSS

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT © [Drew](https://github.com/drew)

# monetize
