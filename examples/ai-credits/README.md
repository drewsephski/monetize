# AI Credits

A polished AI credits billing example with:

- `/` overview
- `/pricing` recurring plans + top-up packs
- `/dashboard` credit balance and account state
- `/usage` generation + low-balance + top-up loop

## Quick Start

```bash
cd examples/ai-credits
bun install
bun run billing:sandbox
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/pricing`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/usage`

## What To Test

1. Open `/pricing`
2. Trigger the Studio checkout
3. Visit `/usage`
4. Spend credits until the warning appears
5. Trigger a top-up and confirm the dashboard updates

## Notes

- Sandbox mode is the default first-run experience
- The example is synced from `packages/cli/templates/usage`
- Docs link points to the shared central docs destination
