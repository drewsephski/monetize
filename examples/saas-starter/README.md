# SaaS Starter

A complete SaaS starter template with authentication, billing, and dashboard - powered by @drew/billing.

## Features

- **Authentication** - Email/password auth with Better Auth
- **Billing** - Subscription management with Stripe (or sandbox mode)
- **Pricing Page** - 3-tier pricing with popular plan highlighting
- **Dashboard** - Protected user dashboard with subscription status
- **Feature Gating** - Free vs Pro feature access control
- **Responsive** - Mobile-first design with Tailwind CSS

## Quick Start

### 1. One-Command Setup

```bash
npx @drew/billing init --example saas-starter
```

### 2. Or Manual Setup

```bash
# Clone this example
cp -r examples/saas-starter my-saas
cd my-saas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Stripe keys

# Set up database
npm run db:push

# Seed default products (optional)
npm run billing:products

# Start development server
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/saas"

# Stripe (required for real payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Billing API
BILLING_API_URL="http://localhost:3000"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
```

## Sandbox Mode

Test without real Stripe setup:

```bash
npm run billing:sandbox
```

This runs the app with `BILLING_SANDBOX_MODE=true`, which:
- Simulates checkout sessions (no real charges)
- Generates fake webhooks
- Stores subscriptions in memory

## Customization

### Pricing Tiers

Edit `app/pricing/page.tsx`:

```typescript
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["1 user", "100 API calls/mo", "Basic support"],
  },
  // Add your own tiers
];
```

### Feature Flags

Gate features by plan in your components:

```typescript
import { useEntitlements } from "@drew/billing-sdk/react";

function ProFeature() {
  const { hasFeature } = useEntitlements();

  if (!hasFeature("advanced_analytics")) {
    return <UpgradePrompt />;
  }

  return <AdvancedAnalytics />;
}
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/drew/billing/tree/main/examples/saas-starter)

## Learn More

- [Documentation](https://billing.drew.dev)
- [SDK Reference](https://billing.drew.dev/docs/sdk)
- [GitHub](https://github.com/drew/billing)

---

**Powered by [@drew/billing](https://billing.drew.dev)**
