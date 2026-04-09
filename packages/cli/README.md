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

Full docs at [github.com/drewsephski/monetize](https://github.com/drewsephski/monetize/tree/main/packages/cli#readme)

See the main repo for example apps and detailed setup instructions.

## License

MIT
