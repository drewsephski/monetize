# drew-billing-cli

CLI for adding subscriptions to your Next.js app in 10 minutes.

```bash
npx drew-billing-cli init
```

## What it does

1. Detects your framework (Next.js, React, etc.)
2. Creates Stripe products and prices
3. Sets up database schema
4. Installs billing components and templates
5. Configures environment variables
6. Tracks setup progress with telemetry

## Templates

- `saas` — Complete SaaS with pricing page, dashboard, customer portal
- `api` — Usage-based billing for APIs
- `ai-credits` — Credit system for AI apps
- `minimal` — Just the core SDK

```bash
npx drew-billing-cli init --template saas
```

## Documentation

Full docs at [billing.drew.dev](https://billing.drew.dev)

Live demo: [billing.drew.dev/try](https://billing.drew.dev/try)

## License

MIT
