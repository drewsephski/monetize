# @drew/billing

**Add subscriptions to your Next.js app in 10 minutes.**

Complete billing system with CLI setup, pre-built components, and automatic webhook handling. Stop wrestling with Stripe docs.

[![Live Demo](https://img.shields.io/badge/try-live%20demo-b8860b)](https://billing.drew.dev/try)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 10-Minute Quickstart

```bash
# 1. Run the CLI
npx drew-billing-cli init

# 2. Enter your Stripe keys (test mode recommended)
# The CLI creates products, sets up webhooks, and configures everything

# 3. Start your app
npm run dev

# 4. Visit /pricing — you're live!
```

---

## What You Get

### One-Line SDK

```typescript
import { BillingSDK } from "@drew/billing-sdk";

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

| Feature | Stripe Only | @drew/billing |
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

👉 **[billing.drew.dev/try](https://billing.drew.dev/try)**

---

## Documentation

- [Quickstart Guide](https://billing.drew.dev/docs/quickstart)
- [SDK Reference](https://billing.drew.dev/docs/sdk)
- [API Docs](https://billing.drew.dev/docs/api)
- [Example Apps](https://billing.drew.dev/examples)

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
