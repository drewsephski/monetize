# Phase 6: Complete File Structure

## Critical Components (Phase 6A - COMPLETE)

### 1. Sandbox SDK
```
packages/sdk/src/sandbox/
├── index.ts      - Public API exports
├── storage.ts    - In-memory data store
├── client.ts     - Fake Stripe client
└── events.ts     - Event simulators
```

### 2. CLI Enhancements
```
packages/cli/src/
├── sandbox-types.ts              - Sandbox type definitions
├── utils/sandbox-server.ts       - Local webhook server
├── commands/sandbox-event.ts     - Event trigger command
└── commands/sandbox.ts           - Enhanced (existing)
```

### 3. SaaS Starter Example
```
examples/saas-starter/
├── README.md                 - Setup instructions
├── package.json              - Dependencies
├── .env.example              - Environment template
├── tailwind.config.ts        - Styling config
├── tsconfig.json           - TypeScript config
├── next.config.js          - Next.js config
├── app/
│   ├── layout.tsx          - Root layout
├── globals.css             - Global styles
├── page.tsx                - Landing page
│   ├── pricing/
│   │   └── page.tsx        - Pricing page
│   ├── dashboard/
│   │   └── page.tsx        - User dashboard
│   └── api/
│       ├── checkout/
│       │   └── route.ts    - Checkout API
│       └── billing/
│           └── subscription/
│               └── route.ts - Subscription API
├── components/
│   ├── ui/                 - UI components
│   └── theme-provider.tsx  - Theme context
└── lib/
    └── utils.ts            - Utilities
```

## Quick Reference

### Enable Sandbox Mode
```bash
# Set environment variable
export BILLING_SANDBOX_MODE=true

# Or use CLI
npx @drew/billing sandbox --enable
```

### Trigger Sandbox Events
```bash
# List all events
npx @drew/billing sandbox event --list

# Trigger specific events
npx @drew/billing sandbox event checkout.session.completed
npx @drew/billing sandbox event customer.subscription.created
npx @drew/billing sandbox event invoice.payment_failed
```

### Use the Starter Template
```bash
# Via CLI (when implemented)
npx @drew/billing init --example saas-starter

# Or manually
cp -r examples/saas-starter my-app
cd my-app
npm install
npm run billing:sandbox
```

## SDK Package.json Export

Added to `packages/sdk/package.json`:
```json
{
  "exports": {
    "./sandbox": {
      "import": "./dist/sandbox/index.js",
      "types": "./dist/sandbox/index.d.ts"
    }
  }
}
```

## Environment Variables

### For Sandbox Mode
```env
BILLING_SANDBOX_MODE=true
```

### For Production
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
BILLING_API_URL="http://localhost:3000"
```

## Key Code Patterns

### Using Sandbox SDK
```typescript
import { SandboxStripeClient, shouldUseSandbox } from "@drew/billing-sdk/sandbox";

if (shouldUseSandbox()) {
  const stripe = new SandboxStripeClient("pk_test_fake");
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: "price_123", quantity: 1 }],
    mode: "subscription",
    success_url: "/success",
    cancel_url: "/cancel",
  });
}
```

### Triggering Events
```typescript
import { simulateEvent } from "@drew/billing-sdk/sandbox";

// Simulate a successful payment
await simulateEvent("checkout.session.completed", {
  session_id: "cs_sandbox_123",
});

// Simulate payment failure
await simulateEvent("invoice.payment_failed", {
  subscription_id: "sub_123",
});
```

## Next Steps (Phase 6B-D)

### Phase 6B - Telemetry & Funnel
- [ ] Anonymous telemetry collection
- [ ] `/api/internal/telemetry` endpoint
- [ ] `/api/internal/funnel` dashboard
- [ ] CLI usage tracking

### Phase 6C - Growth Hooks
- [ ] "Powered by @drew/billing" badge component
- [ ] Shareable success page
- [ ] Vercel deploy button
- [ ] Social sharing integration

### Phase 6D - More Examples
- [ ] API Product example (API keys + usage billing)
- [ ] AI Credits example (credit-based billing)

### Phase 6E - Auth Adapters
- [ ] NextAuth adapter
- [ ] Clerk adapter
- [ ] Supabase adapter

---

**All critical Phase 6A components are complete and ready for use.**
