# Phase 6: Activation + Distribution Layer

## Goal
Transform @drew/billing from infrastructure into a product developers install, succeed with, and recommend.

## Success Criteria
A new developer must be able to:
1. Run one command
2. See a working billing flow
3. Understand how to use it
4. Trust it enough to integrate

---

## 1. File Structure

```
/Users/drewsepeczi/monetize/monetize/
│
├── packages/
│   ├── cli/
│   │   └── src/
│   │       ├── commands/
│   │       │   ├── init.ts                 # Enhanced with --example flag
│   │       │   ├── sandbox.ts              # Full sandbox with simulated events
│   │       │   └── dev.ts                  # NEW: npx @drew/billing dev
│   │       ├── templates/
│   │       │   └── starter/                # NEW: saas-starter template
│   │       │       ├── app/
│   │       │       ├── components/
│   │       │       ├── lib/
│   │       │       └── package.json
│   │       └── utils/
│   │           ├── sandbox-server.ts       # NEW: Fake Stripe server
│   │           ├── telemetry.ts            # NEW: Anonymous analytics
│   │           └── auth-adapters.ts        # NEW: Prebuilt auth integrations
│   │
│   └── sdk/
│       └── src/
│           ├── sandbox/                    # NEW: Sandbox mode SDK
│           │   ├── client.ts
│           │   ├── events.ts
│           │   └── storage.ts
│           └── react/
│               └── components/             # NEW: Success/powered-by components
│                   ├── PoweredBy.tsx
│                   └── SetupSuccess.tsx
│
├── examples/                               # NEW: Production example apps
│   ├── saas-starter/                       # Auth + dashboard + billing
│   ├── api-product/                        # API keys + usage billing
│   └── ai-credits/                         # Credits system + AI features
│
├── apps/
│   └── docs/
│       └── content/
│           ├── quickstart.mdx              # 10-minute guarantee
│           ├── sandbox.mdx                 # Testing guide
│           └── examples.mdx                # Deploy buttons
│
└── app/
    └── api/
        └── internal/
            ├── funnel/                     # NEW: Activation funnel endpoint
            ├── telemetry/                  # NEW: Telemetry ingest
            └── sandbox/                    # NEW: Sandbox webhook handler
```

---

## 2. Implementation Plan (Ordered)

### Phase 6A: Sandbox System (Week 1, Priority: Critical)

**Goal:** Developers can test billing without Stripe setup

1. **Fake Stripe Client**
   - File: `packages/sdk/src/sandbox/client.ts`
   - Simulates: checkout sessions, subscriptions, webhooks
   - Stores data in localStorage (dev) / memory (tests)

2. **Event Simulator**
   - File: `packages/sdk/src/sandbox/events.ts`
   - Commands: `npx @drew/billing sandbox event <type>`
   - Events: subscription.created, payment_failed, upgrade, downgrade

3. **Sandbox Server**
   - File: `packages/cli/src/utils/sandbox-server.ts`
   - Local webhook server that simulates Stripe webhooks
   - Webhook UI for manual triggering

### Phase 6B: Starter Template (Week 1-2, Priority: Critical)

**Goal:** One command creates a complete working app

1. **Template Structure**
   - Pre-built pages: pricing, dashboard, auth
   - Working checkout flow (sandbox mode)
   - Feature gating examples

2. **CLI Enhancement**
   - `npx @drew/billing init --example saas-starter`
   - Auto-detects if running in empty directory vs existing project
   - Deploy to Vercel button generation

3. **First-Run Experience**
   - Welcome screen after init
   - Interactive tour of features
   - One-click enable sandbox mode

### Phase 6C: Example Apps (Week 2-3, Priority: High)

**Goal:** Real-world proof that inspires confidence

1. **SaaS Starter**
   - Next.js 15 + Better Auth + Billing
   - Pricing page, dashboard, subscription management
   - 1-click Vercel deploy

2. **API Product**
   - API key generation
   - Usage tracking + billing
   - Rate limiting by plan

3. **AI Credits**
   - Credit system (not seats)
   - "Generate" feature locked behind credits
   - Top-up flow

### Phase 6D: Developer Feedback Loop (Week 3, Priority: Medium)

**Goal:** Understand where developers struggle

1. **Anonymous Telemetry (opt-in)**
   - CLI command usage
   - Setup success/failure rates
   - Time to first checkout

2. **Error Reporting**
   - SDK error capture
   - Grouped by error type
   - No PII, no billing data

3. **In-CLI Feedback**
   - After init: "How did it go? (1-5)"
   - Optional: "What blocked you?"

### Phase 6E: Activation Funnel (Week 3-4, Priority: Medium)

**Goal:** Track and optimize the developer journey

1. **Funnel Stages**
   - CLI installed
   - Project initialized
   - First checkout created
   - First successful payment
   - First retained user

2. **Dashboard Endpoint**
   - `/api/internal/funnel` - current metrics
   - `/api/internal/funnel/trends` - over time

3. **Alerts**
   - Big drop-off detection
   - Success milestone notifications

### Phase 6F: Smart Defaults (Week 4, Priority: Medium)

**Goal:** Zero decisions to get started

1. **Auto-Generated Products**
   - Free (with limits)
   - Pro ($19/month)
   - Enterprise (contact)

2. **Feature Flags**
   - Auto-generated from common patterns
   - basic_analytics, advanced_analytics, api_access, priority_support

3. **Usage Limits**
   - Pre-configured tiers
   - Easy customization

### Phase 6G: Distribution Hooks (Week 4, Priority: Medium)

**Goal:** Viral growth loops

1. **Powered By Badge**
   - Optional footer component
   - Link to docs with referral param

2. **Success Page**
   - Post-setup celebration
   - Share button with pre-written tweet
   - Deploy preview link

### Phase 6H: Integration Layer (Week 5, Priority: Low)

**Goal:** Remove auth friction (biggest blocker)

1. **Auth Adapters**
   - NextAuth (Auth.js)
   - Clerk
   - Supabase Auth

2. **One-Line Integration**
   - `npx @drew/billing init --auth=clerk`
   - Auto-wires auth + billing

---

## 3. Key Code Snippets

### Sandbox Mode Client

```typescript
// packages/sdk/src/sandbox/client.ts
export class SandboxStripeClient {
  private storage: Map<string, any> = new Map();
  
  async createCheckoutSession(params: any) {
    const session = {
      id: `cs_sandbox_${randomId()}`,
      url: `/sandbox/checkout?session_id={id}`,
      status: 'open',
      ...params
    };
    this.storage.set(session.id, session);
    return session;
  }
  
  async simulateWebhook(event: StripeEvent) {
    // Trigger local webhook endpoint
    await fetch('/api/sandbox/webhook', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
```

### Starter Template Package.json

```json
{
  "name": "saas-starter",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "billing:sandbox": "npx @drew/billing sandbox --enable",
    "billing:products": "npx @drew/billing seed-products"
  },
  "dependencies": {
    "@drew/billing-sdk": "latest",
    "next": "^15",
    "better-auth": "^1.0"
  }
}
```

### Telemetry Tracking

```typescript
// packages/cli/src/utils/telemetry.ts
export async function track(event: string, data: any) {
  if (!isTelemetryEnabled()) return;
  
  await fetch('https://billing.drew.dev/api/internal/telemetry', {
    method: 'POST',
    body: JSON.stringify({
      event,
      data: anonymize(data),
      timestamp: Date.now(),
      sessionId: getSessionId()
    })
  });
}
```

### Activation Funnel API

```typescript
// app/api/internal/funnel/route.ts
export async function GET() {
  const metrics = await db.query.funnelMetrics.findMany({
    orderBy: desc(funnelMetrics.date)
  });
  
  return Response.json({
    stages: {
      cliInstall: metrics[0]?.cliInstalls || 0,
      initComplete: metrics[0]?.initCompletes || 0,
      firstCheckout: metrics[0]?.firstCheckouts || 0,
      firstPayment: metrics[0]?.firstPayments || 0,
      retainedUser: metrics[0]?.retainedUsers || 0
    },
    conversionRates: calculateRates(metrics[0])
  });
}
```

---

## 4. Ship First vs Later

### Ship FIRST (Week 1-2) - Critical Path

| Priority | Feature | Impact |
|----------|---------|--------|
| 🔥 | Full sandbox mode | Removes Stripe setup blocker |
| 🔥 | `init --example saas-starter` | 10-minute success guarantee |
| 🔥 | 1 working example app | Real-world proof |
| 🔥 | Sandbox event simulator | Test without real charges |

### Ship NEXT (Week 3-4) - Growth Loop

| Priority | Feature | Impact |
|----------|---------|--------|
| 🟡 | Telemetry (opt-in) | Understand drop-offs |
| 🟡 | Activation funnel dashboard | Track conversion |
| 🟡 | Smart defaults | Zero decisions |
| 🟡 | Distribution hooks | Viral growth |

### Ship LATER (Week 5+) - Scale

| Priority | Feature | Impact |
|----------|---------|--------|
| 🟢 | Auth adapters | Reduce auth friction |
| 🟢 | All 3 example apps | Market coverage |
| 🟢 | Advanced analytics | Optimization |

---

## 5. Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first checkout | < 10 min | Telemetry |
| Init success rate | > 80% | CLI tracking |
| Sandbox usage | > 60% of devs | CLI tracking |
| Example app deploys | 50/week | Vercel API |
| Docs → Init conversion | > 15% | Funnel tracking |
| Organic shares | 10/week | Referral params |

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sandbox too different from real Stripe | Build full mock that mimics Stripe API exactly |
| Template feels "cookie-cutter" | Make components easily customizable |
| Telemetry feels invasive | Strict opt-in, no PII, transparent data use |
| Auth adapters add complexity | Ship core first, adapters as plugins |

---

**Phase 6 Status: 🚧 IN PROGRESS**

Focus: Make developers successful in 10 minutes or less.
