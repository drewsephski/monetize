# API Product

A polished API billing example with:

- `/` overview
- `/pricing` usage-based plans
- `/dashboard` workspace status
- `/api-keys` sandbox key creation
- `/usage` quota and endpoint activity

## Quick Start

```bash
cd examples/api-product
bun install
bun run billing:sandbox
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/pricing`
- `http://localhost:3000/api-keys`
- `http://localhost:3000/usage`

## What To Test

1. Open `/pricing`
2. Trigger the Pro checkout
3. Go to `/api-keys` and generate a sandbox key
4. Use the curl example against `/api/v1/status`
5. Review `/usage`

## Notes

- Middleware accepts `sandbox_key_*` credentials locally
- The example is synced from `packages/cli/templates/api`
- Docs link points to the shared central docs destination
