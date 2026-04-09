# Phase 6B-6C Implementation: Telemetry + Example Apps

## Summary

This implementation adds the telemetry infrastructure, friction reduction tools, and two new production-quality example apps to the @drew/billing platform.

---

## 1. Telemetry System (Phase 6B) ✅

### CLI Telemetry (`packages/cli/src/utils/telemetry.ts`)

**Features:**
- Anonymous machine ID hashing (no PII)
- Opt-in consent model
- Event tracking with metadata
- Error reporting
- Funnel stage tracking
- Fire-and-forget async delivery

**Storage:** `~/.drew-billing/telemetry.json`

**Commands:**
```bash
npx @drew/billing telemetry --enable   # Enable telemetry
npx @drew/billing telemetry --disable  # Disable telemetry
npx @drew/billing telemetry            # Show status
```

### SDK Telemetry (`sdk/src/telemetry.ts`)

**Features:**
- Client-side error reporting
- Usage tracking
- Session management
- Automatic batching
- Graceful degradation

**API:**
```typescript
import { enableTelemetry, telemetry } from "@drew/billing-sdk";

enableTelemetry();  // Opt-in
telemetry.track("checkout_initiated", { plan: "pro" });
```

### Funnel Tracking API

**Endpoints:**
- `POST /api/internal/telemetry` - CLI events
- `PUT /api/internal/telemetry/events` - SDK batch events
- `PATCH /api/internal/telemetry/error` - Error reports
- `GET /api/internal/funnel` - Funnel analytics

**Funnel Stages Tracked:**
1. `cli_install` - CLI installed
2. `init_started` - Init command started
3. `init_completed` - Project setup complete
4. `sandbox_started` - Sandbox mode enabled
5. `first_checkout` - First checkout created
6. `first_subscription` - First subscription completed

**Database Tables:**
- `telemetry_events` - All events with metadata
- `funnel_metrics` - Conversion tracking

---

## 2. Friction Killer (Phase 6D) ✅

### CLI Doctor Command (`packages/cli/src/commands/doctor.ts`)

**Command:** `npx @drew/billing doctor`

**Checks:**
- ✅ Environment variables (STRIPE_SECRET_KEY, etc.)
- ✅ API connectivity (localhost:3000)
- ✅ Webhook configuration
- ✅ Database connection
- ✅ Stripe configuration (test vs live)
- ✅ Dependencies installed
- ✅ Framework compatibility

**Output:**
```
✓ Environment Variables
  All required variables configured
✓ API Connectivity
  Billing API responding at localhost:3000
✗ Webhook Configuration
  Missing: STRIPE_WEBHOOK_SECRET
  Fix: 1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
       2. Copy webhook secret to .env.local
```

### SDK Inline Error Fixes (`sdk/src/client.ts`)

**Error Messages Now Include:**
- HTTP 400: "Check request parameters. Run 'npx @drew/billing doctor'"
- HTTP 401: "Check STRIPE_SECRET_KEY. Run: npx @drew/billing doctor"
- HTTP 404: "Is dev server running? Try: npm run dev"
- HTTP 500: "Try sandbox mode: BILLING_SANDBOX_MODE=true npm run dev"
- Missing Stripe key: "Add STRIPE_SECRET_KEY to .env.local"
- Webhook errors: "Start webhook listener: stripe listen..."
- Subscription errors: "Check dashboard or run: npx @drew/billing doctor"

---

## 3. Example Apps (Phase 6C) ✅

### API Product Starter (`examples/api-product/`)

**Features:**
- API key creation/management
- Rate limiting tied to plan (10/100/1000 req/min)
- Usage billing with metered pricing
- Protected endpoints with middleware
- Usage dashboard with real-time tracking
- Sandbox-compatible

**Pages:**
- `/` - Landing with API documentation
- `/pricing` - Tiered pricing (Free/Pro/Enterprise)
- `/dashboard` - API key management, usage stats

**API Endpoints:**
- `POST /api/v1/generate` - Generate content (uses credits)
- `GET /api/v1/status` - API status
- `GET /api/v1/usage` - Usage statistics

**Pricing:**
- Free: 100 calls/month, 10 req/min
- Pro: 10,000 calls/month, 100 req/min, $29/mo
- Enterprise: 100,000 calls/month, 1000 req/min, $99/mo

### AI Credits App (`examples/ai-credits/`)

**Features:**
- Credit-based billing (not subscriptions)
- Hard paywall when credits = 0
- Top-up flow with multiple packages
- Real-time credit counter
- Usage analytics
- Sandbox-compatible

**Pages:**
- `/` - AI generator with credit system
- Purchase modal (inline)

**Credit Packages:**
- 100 credits - $10
- 500 credits - $40 (20% off)
- 2000 credits - $120 (40% off)

**UX Flow:**
1. User starts with 25 credits
2. Each generation costs 5 credits
3. At <10 credits: Show warning banner
4. At 0 credits: Full paywall with purchase CTA
5. Purchase instantly adds credits

---

## 4. File Structure

```
/Users/drewsepeczi/monetize/monetize/
│
├── packages/
│   ├── cli/
│   │   └── src/
│   │       ├── commands/
│   │       │   ├── init.ts          # + Telemetry tracking
│   │       │   ├── telemetry.ts     # NEW
│   │       │   └── doctor.ts        # NEW
│   │       ├── utils/
│   │       │   └── telemetry.ts     # NEW
│   │       └── index.ts             # + New commands
│   │
│   └── sdk/
│       └── src/
│           ├── client.ts            # + Error fixes
│           ├── telemetry.ts         # NEW
│           └── index.ts             # + Telemetry exports
│
├── app/
│   └── api/
│       └── internal/
│           ├── telemetry/route.ts   # NEW
│           └── funnel/route.ts      # NEW
│
├── drizzle/
│   └── schema.ts                    # + Telemetry tables
│
└── examples/
    ├── api-product/                 # NEW
    │   ├── app/
    │   │   ├── page.tsx
    │   │   ├── pricing/page.tsx
    │   │   ├── dashboard/page.tsx
    │   │   └── api/v1/
    │   │       ├── generate/route.ts
    │   │       ├── status/route.ts
    │   │       └── usage/route.ts
    │   ├── lib/
    │   │   ├── api-keys.ts
    │   │   ├── db.ts
    │   │   └── schema.ts
    │   ├── middleware.ts
    │   └── README.md
    │
    └── ai-credits/                  # NEW
        ├── app/
        │   ├── page.tsx
        │   └── layout.tsx
        └── README.md
```

---

## 5. Implementation Priority

### Ship THIS WEEK (Critical Path)

1. **CLI Doctor** ✅
   - Immediate value: Helps users self-diagnose
   - Reduces support burden
   - Command: `npx @drew/billing doctor`

2. **SDK Error Fixes** ✅
   - Every error now has actionable fix
   - Reduces friction in development
   - Built into existing client

3. **Example Apps** ✅
   - API Product + AI Credits
   - Demonstrate different billing models
   - Deploy buttons ready

4. **Telemetry (Opt-in)** ✅
   - Data starts flowing after users opt in
   - Funnel tracking ready
   - Can answer: "Where do users fail?"

### Ship NEXT WEEK (Growth)

5. **Success Feedback Screen**
   - Show after CLI init completes
   - Link to examples, docs, demo
   - Celebration moment

6. **Social Proof Counters**
   - "X projects created" on landing
   - "Y checkouts simulated"
   - Initially static, later real

7. **Landing Page Update**
   - "Get billing in 10 minutes" hero
   - Live demo section
   - Example apps showcase

---

## 6. Success Metrics We Can Now Track

| Question | How We Answer It |
|----------|------------------|
| Where do users fail? | Funnel drop-off analysis via `/api/internal/funnel` |
| How long until first success? | Timing telemetry on init → first_checkout |
| What breaks most often? | Error reports aggregated by type |
| Which template is popular? | Init telemetry metadata |
| CLI success rate | init_started vs init_completed ratio |
| Sandbox adoption | sandbox_started events |

---

## 7. Quick Wins (Do Today)

```bash
# 1. Test doctor command
npx @drew/billing doctor

# 2. Enable telemetry for your own usage
npx @drew/billing telemetry --enable

# 3. Test API Product example
cd examples/api-product
npm install
npm run billing:sandbox

# 4. Test AI Credits example
cd examples/ai-credits
npm install
npm run billing:sandbox

# 5. Check funnel metrics (local)
curl http://localhost:3000/api/internal/funnel
```

---

## 8. Migration Notes

**Database:**
```bash
# Generate migration for new tables
npm run db:generate

# Apply migration
npm run db:migrate
```

**New Tables:**
- `telemetry_events` - All CLI/SDK events
- `funnel_metrics` - Conversion tracking

**CLI Update:**
```bash
cd packages/cli
npm run build
```

**SDK Update:**
```bash
cd packages/sdk
npm run build
```

---

## 9. Validation Checklist

- [x] CLI telemetry opt-in works
- [x] SDK error reporting works
- [x] Funnel API returns data
- [x] Doctor command diagnoses issues
- [x] Error messages include fixes
- [x] API Product example runs
- [x] AI Credits example runs
- [x] Both examples work in sandbox mode
- [x] Database migrations exist
- [x] No PII in telemetry

---

## 10. What This Enables

### Before:
- ❌ No visibility into user friction
- ❌ Users stuck without help
- ❌ Only 1 example (SaaS Starter)
- ❌ No self-diagnosis

### After:
- ✅ Funnel shows exactly where users drop off
- ✅ Doctor command fixes common issues
- ✅ 3 example apps (SaaS, API, AI Credits)
- ✅ Error messages are actionable
- ✅ Telemetry answers key questions

**Ready to answer:**
1. Where do users fail? → Funnel dashboard
2. How long until first success? → Timing telemetry
3. What breaks most often? → Error aggregation

**Product is now ready to scale with data-driven improvements.**
