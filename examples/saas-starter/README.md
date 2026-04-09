# SaaS Starter

A polished SaaS billing example with:

- `/` overview
- `/pricing` plan comparison + sandbox checkout
- `/dashboard` subscription state + usage

## Quick Start

```bash
cd examples/saas-starter
bun install
bun run billing:sandbox
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/pricing`
- `http://localhost:3000/dashboard`

## What To Test

1. Open `/pricing`
2. Trigger the Growth checkout
3. Confirm the dashboard switches from the empty state to the paid state

## Notes

- Sandbox mode is the intended first-run path
- The example is synced from `packages/cli/templates/saas`
- Docs link points to the shared central docs destination
