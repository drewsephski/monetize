# drew-billing-cli

CLI for adding subscriptions to your Next.js app in 10 minutes.

```bash
npx drew-billing-cli init
```

## What it does

1. **Scaffolds a new Next.js project** (in empty directories) using `create-next-app`
2. Detects your framework (Next.js, React, etc.)
3. Creates Stripe products and prices
4. Sets up database schema
5. Installs billing components and templates
6. Configures environment variables
7. Tracks setup progress with telemetry

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
