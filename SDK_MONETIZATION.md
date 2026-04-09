# SDK License Monetization Guide

This document explains how the @drew/billing SDK monetization system works and how to implement it.

## Overview

The SDK supports **dual monetization**:

1. **Hosted SaaS** - Customers use your billing API (what we just set up)
2. **SDK Licenses** - Developers embed the SDK in their apps with license keys

## Pricing Tiers

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | $0 | Basic checkout, 1 project, 1000 API calls | Hobby projects |
| **Pro** | $29/mo | 10k API calls, 5 projects, priority support | Indie devs |
| **Team** | $99/mo | 100k API calls, 20 projects, team features | Startups |
| **Enterprise** | $499/mo | Unlimited, SSO, SLA, dedicated support | Scale-ups |

## How It Works

### 1. License Validation Flow

```typescript
import { BillingSDK } from "@drew/billing-sdk";

const billing = new BillingSDK({
  baseUrl: "https://monetize-two.vercel.app",
  license: {
    licenseKey: "DREW-XXXX-XXXX-XXXX-XXXX", // Customer's license key
  }
});

// Validate license on startup
const result = await billing.validateLicense();
if (!result.valid) {
  console.error("License invalid:", result.error);
  process.exit(1);
}

console.log("Licensed tier:", result.license?.tier);
console.log("Features:", result.license?.features);
```

### 2. Feature Gating

```typescript
// Check if license has specific feature
const hasAdvanced = await billing.licenseHasFeature("usage_based_billing");
if (!hasAdvanced) {
  console.log("Upgrade to Pro for usage-based billing");
}

// Check usage limits
const usage = await billing.checkLicenseUsage("apiCalls", 1);
if (!usage.allowed) {
  console.log(`API limit reached. ${usage.remaining} calls remaining.`);
}
```

### 3. Creating Licenses

Use the admin API to create licenses when customers purchase:

```bash
curl -X POST https://monetize-two.vercel.app/api/license/create \
  -H "Authorization: Bearer <admin_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "dev@example.com",
    "tier": "pro",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx"
  }'
```

Response:

```json
{
  "success": true,
  "license": {
    "id": "uuid",
    "licenseKey": "DREW-ABCD-EFGH-IJKL-MNOP",
    "tier": "pro",
    "status": "active"
  }
}
```

## Implementation in Your Code

### CLI Tool Example

```typescript
// packages/cli/src/commands/init.ts
import { BillingSDK } from "@drew/billing-sdk";

export async function initCommand() {
  // Check for license key in environment
  const licenseKey = process.env.DREW_BILLING_LICENSE_KEY;
  
  if (!licenseKey) {
    console.log("⚠️  No license key found. Running in free mode.");
    console.log("   Get a license at: https://monetize-two.vercel.app/pricing");
  }
  
  const billing = new BillingSDK({
    baseUrl: process.env.BILLING_API_URL || "https://monetize-two.vercel.app",
    license: licenseKey ? { licenseKey } : undefined,
  });
  
  // Validate license if provided
  if (licenseKey) {
    const result = await billing.validateLicense();
    if (!result.valid) {
      console.error("❌ License invalid:", result.error);
      process.exit(1);
    }
    console.log(`✅ Pro license active (${result.license?.tier})`);
  }
  
  // Gate premium features
  const hasAdvanced = await billing.licenseHasFeature("advanced_analytics");
  if (flags.advancedAnalytics && !hasAdvanced) {
    console.error("❌ Advanced analytics requires Pro license");
    console.log("   Upgrade at: https://monetize-two.vercel.app/pricing");
    process.exit(1);
  }
  
  // Continue with init...
}
```

### Web App Example

```typescript
// app/dashboard/page.tsx
import { BillingSDK } from "@drew/billing-sdk";

export default async function Dashboard() {
  const billing = new BillingSDK({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    license: { licenseKey: process.env.BILLING_LICENSE_KEY! },
  });
  
  const result = await billing.validateLicense();
  
  if (!result.valid) {
    return (
      <div>
        <h1>License Required</h1>
        <p>Your license is {result.license?.status}.</p>
        <a href="/pricing">Upgrade now</a>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tier: {result.license?.tier}</p>
      <p>Features: {result.license?.features.join(", ")}</p>
    </div>
  );
}
```

## License Key Format

License keys follow the pattern: `DREW-XXXX-XXXX-XXXX-XXXX`

- Auto-generated on license creation
- Unique per customer
- Tied to Stripe subscription status
- Tracks usage and machine IDs

## API Endpoints

### POST `/api/license/verify`

Validate a license key.

```json
{
  "licenseKey": "DREW-ABCD-EFGH-IJKL-MNOP",
  "machineId": "optional-machine-id",
  "eventType": "verify",
  "metadata": {}
}
```

### POST `/api/license/create`

Create a new license (admin only).

```json
{
  "customerEmail": "dev@example.com",
  "tier": "pro",
  "stripeCustomerId": "cus_xxx",
  "stripeSubscriptionId": "sub_xxx"
}
```

## Stripe Integration

When a customer subscribes:

1. Stripe webhook triggers `checkout.session.completed`
2. Your webhook handler calls `/api/license/create`
3. License key is generated and emailed to customer
4. Customer adds `DREW_BILLING_LICENSE_KEY` to their `.env`

## Best Practices

1. **Cache license validation** - SDK caches for 5 minutes to reduce API calls
2. **Graceful degradation** - Free tier works without any license key
3. **Clear upgrade paths** - Show what's available in higher tiers
4. **Usage tracking** - Monitor API calls to predict upgrades
5. **Machine tracking** - Track unique installations (optional privacy-respecting hash)

## Revenue Model

| Tier | Price | Est. Monthly Revenue at 100 customers |
|------|-------|--------------------------------------|
| Free | $0 | $0 (acquisition funnel) |
| Pro | $29 | $1,450 (50 customers) |
| Team | $99 | $2,970 (30 customers) |
| Enterprise | $499 | $9,980 (20 customers) |
| **Total** | | **~$14,400/mo** |

## Next Steps

1. ✅ Database schema created (`sdk_licenses`, `sdk_license_usage`)
2. ✅ API endpoints created (`/api/license/verify`, `/api/license/create`)
3. ✅ SDK updated with license validation
4. ⏳ Add Stripe webhook to auto-create licenses on purchase
5. ⏳ Email license keys to customers
6. ⏳ Update CLI to check license for premium features
7. ⏳ Add license dashboard in web app

## Testing

```bash
# Create a test license
curl -X POST http://localhost:3000/api/license/create \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "tier": "pro"
  }'

# Verify the license
curl -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "DREW-XXXX-XXXX-XXXX-XXXX",
    "machineId": "test-machine"
  }'
```

---

## Summary

You now have a complete SDK monetization system:

- **License validation** with tier-based feature access
- **Usage tracking** to enforce limits
- **Machine tracking** for license compliance
- **Stripe integration** ready for auto-license generation

This enables you to monetize both the hosted service AND the SDK itself, doubling your revenue potential.
