# @drewsepsi/billing-sdk

TypeScript SDK for adding subscriptions and usage billing to your Next.js app. Integrate with Stripe in minutes, not days.

## Quick Start

```bash
npm install @drewsepsi/billing-sdk
```

```typescript
import { BillingSDK } from "@drewsepsi/billing-sdk";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Create a checkout session
const url = await billing.createCheckout({
  priceId: "price_pro",
  userId: "user_123",
});

// Redirect user to Stripe
window.location.href = url;
```

## Features

- ⚡ **One-line checkout** - Create Stripe checkout sessions instantly
- 📊 **Usage tracking** - Built-in metering for usage-based billing
- 🔐 **License validation** - Verify SDK licenses with tier-based features
- 🎨 **React hooks** - Ready-to-use `useSubscription`, `useBilling` hooks
- 🧪 **Sandbox mode** - Test billing flows without real charges
- 📝 **TypeScript** - Full type safety out of the box

## Installation

```bash
npm install @drewsepsi/billing-sdk
# or
yarn add @drewsepsi/billing-sdk
# or
pnpm add @drewsepsi/billing-sdk
```

## Basic Usage

### 1. Initialize the SDK

```typescript
import { BillingSDK } from "@drewsepsi/billing-sdk";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  license: {
    licenseKey: process.env.DREW_BILLING_LICENSE_KEY, // Optional: for SDK features
  },
});
```

### 2. Create a Checkout

```typescript
const checkout = await billing.createCheckout({
  priceId: "price_pro_monthly",
  userId: "user_123",
  successUrl: "/dashboard?success=true",
  cancelUrl: "/pricing?canceled=true",
});

// Redirect to Stripe
window.location.href = checkout.url;
```

### 3. Check Subscription Status

```typescript
const subscription = await billing.getSubscription("user_123");

if (subscription.status === "active") {
  // Grant premium access
}
```

### 4. Track Usage

```typescript
// Record an API call or feature usage
await billing.trackUsage({
  userId: "user_123",
  event: "api_call",
  quantity: 1,
});

// Check remaining quota
const usage = await billing.getUsage("user_123");
console.log(`Used ${usage.current} of ${usage.limit}`);
```

## React Integration

### Provider Setup

```tsx
import { BillingProvider } from "@drewsepsi/billing-sdk/react";

function App() {
  return (
    <BillingProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
      }}
    >
      <YourApp />
    </BillingProvider>
  );
}
```

### Use Subscription Hook

```tsx
import { useSubscription } from "@drewsepsi/billing-sdk/react";

function Dashboard() {
  const { subscription, isLoading, isActive } = useSubscription("user_123");

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>Dashboard</h1>
      {isActive ? (
        <PremiumFeatures />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

## Server-Side Usage

For API routes and server components:

```typescript
import { BillingSDK } from "@drewsepsi/billing-sdk/server";

// Server-side SDK (no React dependencies)
const billing = new BillingSDK({
  baseUrl: process.env.API_URL,
  apiKey: process.env.BILLING_API_KEY,
});

// Validate a license key
const license = await billing.validateLicense("license_key_here");

if (license.valid && license.tier === "pro") {
  // Grant pro features
}
```

## Sandbox Mode

Test your billing integration without real charges:

```typescript
import { createSandboxBilling } from "@drewsepsi/billing-sdk/sandbox";

const billing = createSandboxBilling({
  baseUrl: "http://localhost:3000",
});

// All operations work without hitting Stripe
const checkout = await billing.createCheckout({
  priceId: "test_price",
  userId: "test_user",
});
```

## License Validation (SDK Customers)

If you've purchased a Drew Billing SDK license, validate it to unlock features:

```typescript
const billing = new BillingSDK({
  baseUrl: "https://your-app.com",
  license: {
    licenseKey: process.env.DREW_BILLING_LICENSE_KEY,
  },
});

// The SDK automatically validates on initialization
// and enables features based on your tier (Pro/Team/Enterprise)
```

## API Reference

### `BillingSDK`

Main SDK class for billing operations.

| Method | Description |
|--------|-------------|
| `createCheckout(options)` | Create a Stripe checkout session |
| `getSubscription(userId)` | Get user's subscription status |
| `getUsage(userId)` | Get usage statistics |
| `trackUsage(event)` | Track a usage event |
| `validateLicense(key)` | Validate a license key |
| `createCustomerPortal(userId)` | Create customer portal session |

### React Hooks

| Hook | Description |
|------|-------------|
| `useSubscription(userId)` | Get subscription state |
| `useBilling()` | Access SDK instance |
| `useUsage(userId)` | Track and display usage |

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-app.com

# Optional (for SDK license validation)
DREW_BILLING_LICENSE_KEY=your-license-key-here

# Optional (for server-side)
BILLING_API_KEY=your-api-key
```

## Examples

### SaaS Starter

```bash
npx @drewsepsi/billing-cli init --template saas
```

### API Product with Usage

```bash
npx @drewsepsi/billing-cli init --template api
```

### AI Credits System

```bash
npx @drewsepsi/billing-cli init --template ai-credits
```

## Documentation

- [Full Documentation](https://monetize-two.vercel.app/docs)
- [API Reference](https://monetize-two.vercel.app/docs/api)
- [CLI Guide](https://monetize-two.vercel.app/docs/cli)
- [GitHub Repo](https://github.com/drew/billing)

## License

MIT © [Drew](https://github.com/drew)

---

Built with ❤️ by Drew Billing
