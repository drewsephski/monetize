# AI Credits App

A credit-based AI application with usage billing and hard paywalls.

## Features

- **Credit System** - Pre-purchase credits that are consumed per AI generation
- **Hard Paywall** - Block access when credits run out
- **Top-up Flow** - Easy credit purchasing when low
- **Real-time Balance** - Live credit counter in UI
- **Usage Analytics** - Track credit consumption
- **Sandbox Mode** - Test without real charges

## Quick Start

```bash
cd examples/ai-credits
npm install
npm run billing:sandbox
```

## How It Works

1. User buys credits (e.g., 100 credits for $10)
2. Each AI generation costs 1-10 credits based on complexity
3. Credits are deducted in real-time
4. When credits < 10, show top-up prompt
5. When credits = 0, show paywall with buy button

## Pricing

- 100 credits - $10
- 500 credits - $40 (20% off)
- 2000 credits - $120 (40% off)

## Sandbox Mode

Test the full flow without Stripe:

```bash
npm run billing:sandbox
```

Test paywall by simulating zero credits, test purchasing, etc.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/drew/billing/tree/main/examples/ai-credits)
