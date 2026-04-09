# API Product Starter

A complete API product with usage-based billing, API key management, and rate limiting.

## Features

- **API Key Management** - Create, revoke, and manage API keys
- **Usage-Based Billing** - Pay per API call with metered billing
- **Rate Limiting** - Tier-based rate limits tied to subscription plan
- **Protected Endpoints** - Authenticate and track API usage
- **Usage Dashboard** - Real-time usage tracking and billing
- **Sandbox Mode** - Test without real Stripe setup

## Quick Start

### Option 1: Via CLI

```bash
npx @drew/billing init --template api-product
cd api-product
npm install
npm run billing:sandbox
```

### Option 2: Manual Setup

```bash
cd examples/api-product
npm install
```

Create `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BILLING_API_URL=http://localhost:3000
```

```bash
npm run dev
```

## API Endpoints

### Authentication
All API endpoints require an `X-API-Key` header.

### Endpoints

```
GET  /api/v1/status           - Check API status
POST /api/v1/generate         - Generate data (uses 1 credit)
GET  /api/v1/usage            - Get current usage stats
```

## Usage Flow

1. User signs up and subscribes to a plan
2. User creates API key in dashboard
3. User makes API calls with key
4. Usage is tracked and billed monthly
5. User can view usage in dashboard

## Pricing Tiers

- **Free** - 100 calls/month, 10 req/min
- **Pro** - 10,000 calls/month, 100 req/min, $29/month
- **Enterprise** - 100,000 calls/month, 1000 req/min, $99/month

## Sandbox Mode

Test without Stripe:

```bash
npm run billing:sandbox
```

Simulate usage:
```bash
# Trigger a subscription
curl -X POST http://localhost:3000/api/sandbox/subscribe \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro"}'

# Make API calls (they'll be tracked)
curl -H "X-API-Key: sandbox_key_123" \
  http://localhost:3000/api/v1/generate
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/drew/billing/tree/main/examples/api-product)

## Structure

```
api-product/
├── app/
│   ├── (auth)/           # Sign up / Sign in
│   ├── dashboard/         # API key management, usage
│   ├── pricing/          # Plan selection
│   └── api/              # API routes + protected endpoints
├── components/
│   ├── api-key-manager   # Create/revoke keys
│   ├── usage-meter       # Display usage
│   └── rate-limit-display
├── lib/
│   ├── auth.ts           # Session/auth
│   ├── rate-limit.ts     # Rate limiting logic
│   └── billing.ts        # Billing integration
└── middleware.ts         # API key auth
```

## Learn More

- [Documentation](https://billing.drew.dev/docs)
- [Sandbox Guide](https://billing.drew.dev/docs/sandbox)
- [Support](https://github.com/drew/billing/issues)
