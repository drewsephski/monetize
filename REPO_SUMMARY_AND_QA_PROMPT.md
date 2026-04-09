# @drew/billing - Repository Summary & QA Developer Prompt

---

## 1. Repository Overview

### What This Is

**@drew/billing** is a complete billing infrastructure for Next.js applications that enables developers to add Stripe subscriptions in ~10 minutes. It's a full-stack SaaS billing solution with CLI tooling, SDK, pre-built components, and webhook automation.

### Target Use Cases

- SaaS startups needing subscription billing
- API products requiring usage-based billing
- AI applications needing credit systems
- Teams wanting multi-tenant/organization billing

### Value Proposition

| Stripe Only | @drew/billing |
|-------------|---------------|
| 2-3 weeks setup | 10 minutes setup |
| Build DB schema yourself | Included |
| Build webhook handling yourself | Automatic with retries |
| Build customer portal yourself | Pre-built components |
| Complex usage billing | One-line SDK call |

---

## 2. Architecture & Tech Stack

### Core Technologies

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (email/password + OAuth ready)
- **Payments:** Stripe (v22.0.1)
- **Styling:** Tailwind CSS 4.2 + shadcn/ui components
- **Language:** TypeScript 5.9

### Monorepo Structure

```
/Users/drewsepeczi/monetize/monetize/
├── app/                    # Next.js app (main platform)
│   ├── (auth)/            # Auth pages (signin/signup)
│   ├── api/               # API routes (checkout, webhooks, etc.)
│   ├── checkout/          # Checkout success/cancel pages
│   └── dashboard/         # User dashboard
├── components/billing/    # Pre-built billing UI components
├── drizzle/               # Database schema & migrations
├── lib/                   # Core business logic
│   ├── billing/           # Billing engine
│   │   ├── events/        # Stripe webhook handlers
│   │   ├── hooks.ts       # Billing lifecycle hooks
│   │   ├── middleware.ts  # Subscription/entitlement middleware
│   │   └── webhook-queue.ts # Reliable webhook processing
│   ├── auth.ts            # Better Auth configuration
│   ├── db.ts              # Database connection
│   └── env.ts             # Environment validation
├── packages/
│   └── cli/               # drew-billing-cli (npm: drew-billing-cli)
│       └── src/commands/  # init, doctor, verify, add, sandbox
├── sdk/                   # @drew/billing-sdk
│   └── src/
│       ├── client.ts      # Core SDK client with retries
│       ├── react/         # React hooks
│       ├── checkout.ts    # Checkout helpers
│       ├── entitlements.ts # Feature flagging
│       └── usage.ts       # Usage tracking
└── examples/              # Starter templates
    ├── saas-starter/      # Complete SaaS app
    ├── api-product/       # API billing example
    └── ai-credits/        # AI credit system example
```

---

## 3. Database Schema (799 lines in drizzle/schema.ts)

### Core Tables

- `users` - User accounts (Better Auth)
- `customers` - Stripe customer mapping
- `plans` - Subscription plans with features/limits
- `subscriptions` - Subscription lifecycle tracking
- `invoices` - Invoice records
- `stripeEvents` - Webhook event log with idempotency

### Advanced Features Tables

- `usageEvents` / `usageAggregates` - Usage-based billing
- `organizations` / `organizationMembers` / `organizationSubscriptions` - Team billing
- `dunningAttempts` - Revenue recovery
- `developerAccounts` / `apiKeys` / `apiKeyUsage` - API key monetization
- `webhookQueue` - Reliable webhook fallback
- `entitlementsCache` - Cached entitlement lookups
- `telemetryEvents` / `funnelMetrics` / `feedbackEvents` - Analytics
- `requestTraces` / `eventTimeline` / `billingMetrics` - Observability

### Better Auth Tables

- `sessions`, `accounts`, `verifications`

---

## 4. Key Features

### 1. Webhook Processing (`lib/billing/events/`)

- **Idempotent processing** with database-level locking
- **Supported events:** checkout.session.completed, customer.subscription.*, invoice.*, charge.*, customer.deleted
- **Transaction safety** - all handlers run in DB transactions
- **Retry logic** with exponential backoff
- **Dead letter queue** for failed events

### 2. Subscription Middleware (`lib/billing/middleware.ts`)

- `requirePlan()` - Route protection by plan tier
- `requireFeature()` - Feature gating middleware
- `withEntitlements()` - Higher-order function for API routes
- `compose()` - Composable middleware chain
- **Cached lookups** via React cache for performance

### 3. Billing Hooks System (`lib/billing/hooks.ts`)

- `onPaymentFailed` - Failed payment notifications
- `onSubscriptionStatusChange` - Status change callbacks
- `onTrialEnding` - Trial expiration warnings
- `onSubscriptionCreated` - Welcome flows

### 4. SDK Features (`sdk/src/`)

- **Exponential backoff retry** with jitter
- **Typed errors** with actionable fix suggestions
- **Telemetry integration** for error tracking
- **React hooks:** useSubscription, useEntitlements, useUsage

### 5. CLI Commands (`packages/cli/src/commands/`)

- `init` - Project setup with interactive prompts
- `doctor` - Diagnostics and troubleshooting
- `verify` - Stripe configuration verification
- `add` - Add billing to existing project
- `sandbox` - Sandbox mode for testing without Stripe
- `whoami` - Account info
- `telemetry` - Usage data preferences

---

## 5. API Routes

| Endpoint | Purpose |
|----------|---------|
| `/api/checkout` | Create Stripe checkout sessions |
| `/api/stripe/webhook` | Webhook handler with idempotency |
| `/api/customer-portal` | Stripe customer portal sessions |
| `/api/subscription/*` | Subscription management APIs |
| `/api/entitlements` | Feature/entitlement checking |
| `/api/usage` | Usage tracking for metered billing |
| `/api/cron/*` | Cron jobs for dunning, sync, cleanup |
| `/api/health` | Health check endpoint |

---

## 6. Environment Configuration (`lib/env.ts`)

Required variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Stripe (production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Better Auth
BETTER_AUTH_SECRET="..."

# Optional
BILLING_SANDBOX_MODE="true"  # For testing without Stripe
BILLING_TELEMETRY="off"      # Telemetry opt-out
```

---

## 7. Known Areas Needing QA Attention

### Critical Path Issues

1. **Webhook queue processing** (`webhook-queue.ts:94-102`) - Handler dispatch is TODO/log only
2. **JWT verification** (`middleware.ts:250-259`) - Bearer token extraction is stubbed
3. **Session cookie auth** (`middleware.ts:262-268`) - Better Auth session validation incomplete
4. **Extract userId** function needs full implementation

### Error Handling Gaps

1. Some handlers throw generic errors instead of typed BillingError
2. Database transaction rollbacks not always tested
3. Stripe API error scenarios need better coverage
4. Network timeout handling in SDK needs edge case testing

### Security Concerns

1. Rate limiting implementation exists but needs verification
2. API key hashing/validation needs audit
3. Webhook signature verification is implemented but needs testing

### Performance Issues

1. Entitlement cache expiration logic needs validation
2. Database query N+1 potential in middleware
3. Cron job batch sizes may need tuning

### Missing Features (Partial Implementation)

1. Organization switching UI not complete
2. Dunning email sending not wired up
3. Usage aggregation job needs testing
4. Telemetry reporting is stubbed in some places

### Developer Experience

1. Error messages could be more actionable
2. CLI doctor command could detect more issues
3. Sandbox mode doesn't fully simulate all Stripe events

---

# QA DEVELOPER PROMPT

## Objective

Comprehensive QA testing, bug fixes, and robustness improvements for the @drew/billing platform.

## Scope of Work

### Phase 1: Critical Path Testing & Fixes

#### 1.1 Webhook System (`app/api/stripe/webhook/route.ts`, `lib/billing/webhook-queue.ts`)

**Current State:** Queue processing logs only (line 97-101), doesn't actually dispatch to handlers

**Tasks:**

- [ ] Implement actual event handler dispatch in `processWebhookQueue()`
- [ ] Test end-to-end webhook flow with Stripe CLI
- [ ] Verify idempotency works under concurrent load
- [ ] Test dead letter queue functionality
- [ ] Add webhook queue metrics/monitoring endpoint

**Success Criteria:**

- Webhooks process reliably with 99.9% success rate
- Duplicate events are correctly idempotent
- Failed events retry with exponential backoff
- Dead letter queue captures unprocessable events

#### 1.2 Authentication Middleware (`lib/billing/middleware.ts`)

**Current State:** JWT verification TODO (line 256), session cookie handling incomplete

**Tasks:**

- [ ] Implement JWT verification for Bearer tokens
- [ ] Integrate Better Auth session validation
- [ ] Test all three auth methods (Bearer, cookie, header)
- [ ] Add tests for auth edge cases (expired, malformed, missing)

**Success Criteria:**

- All auth methods work correctly
- Proper 401/403 responses for invalid auth
- No auth bypass vulnerabilities

### Phase 2: Error Handling & Resilience

#### 2.1 SDK Error Handling (`sdk/src/client.ts`)

**Tasks:**

- [ ] Add tests for all error code paths
- [ ] Verify retry logic works correctly
- [ ] Test timeout handling
- [ ] Ensure error messages are actionable
- [ ] Add circuit breaker pattern for degraded Stripe connectivity

#### 2.2 Database Transaction Safety

**Tasks:**

- [ ] Audit all webhook handlers for proper transaction usage
- [ ] Test rollback scenarios
- [ ] Verify foreign key constraints handle edge cases
- [ ] Add database-level tests for concurrent operations

#### 2.3 Stripe API Error Handling

**Tasks:**

- [ ] Test all Stripe error scenarios (rate limits, invalid IDs, network failures)
- [ ] Ensure idempotency keys are used consistently
- [ ] Add retry logic for rate-limited requests

### Phase 3: Security Audit

#### 3.1 Rate Limiting (`lib/rate-limit.ts`)

**Tasks:**

- [ ] Verify rate limiting applies to all API routes
- [ ] Test rate limit headers
- [ ] Ensure rate limits don't affect legitimate users
- [ ] Add per-user vs per-IP rate limiting

#### 3.2 API Key Security (`lib/auth/api-keys.ts`)

**Tasks:**

- [ ] Verify API key hashing (bcrypt/argon2)
- [ ] Test key prefix collision handling
- [ ] Audit key revocation flow
- [ ] Add key rotation support

#### 3.3 Webhook Security

**Tasks:**

- [ ] Test signature verification bypass attempts
- [ ] Verify timestamp tolerance window
- [ ] Test replay attack prevention

### Phase 4: Performance & Scalability

#### 4.1 Database Query Optimization

**Tasks:**

- [ ] Add EXPLAIN ANALYZE for all critical queries
- [ ] Fix N+1 queries in entitlement lookups
- [ ] Add query result caching where appropriate
- [ ] Optimize index usage

#### 4.2 Caching Strategy

**Tasks:**

- [ ] Implement Redis/memory cache for entitlements
- [ ] Add cache invalidation on subscription changes
- [ ] Test cache hit rates
- [ ] Handle cache stampede scenarios

### Phase 5: Feature Completion

#### 5.1 Dunning/Revenue Recovery

**Tasks:**

- [ ] Wire up dunning email sending
- [ ] Test dunning workflow end-to-end
- [ ] Add dunning analytics
- [ ] Test downgrade actions after failed recovery

#### 5.2 Usage-Based Billing

**Tasks:**

- [ ] Complete usage aggregation implementation
- [ ] Test usage event deduplication
- [ ] Verify Stripe usage record sync
- [ ] Test billing threshold alerts

#### 5.3 Organization/Team Billing

**Tasks:**

- [ ] Complete organization switching UI
- [ ] Test multi-member permission flows
- [ ] Verify subscription transfers between orgs
- [ ] Test seat-based billing calculations

### Phase 6: Testing Infrastructure

#### 6.1 Unit Tests

**Tasks:**

- [ ] Add Jest/Vitest setup
- [ ] Write tests for all billing logic
- [ ] Mock Stripe SDK properly
- [ ] Achieve >80% code coverage

#### 6.2 Integration Tests

**Tasks:**

- [ ] Set up test database
- [ ] Write end-to-end checkout flow tests
- [ ] Test webhook processing with Stripe test events
- [ ] Add subscription lifecycle tests

#### 6.3 E2E Tests

**Tasks:**

- [ ] Set up Playwright
- [ ] Test critical user journeys
- [ ] Add visual regression tests
- [ ] Test across browsers

### Phase 7: Documentation & Examples

#### 7.1 Documentation

**Tasks:**

- [ ] Document all billing hooks
- [ ] Create troubleshooting guide
- [ ] Document SDK API reference
- [ ] Add deployment guides

#### 7.2 Example Apps

**Tasks:**

- [ ] Ensure all 3 examples work correctly
- [ ] Add more customization examples
- [ ] Document example deployment steps
- [ ] Add Docker compose for examples

---

## Testing Checklist

### Checkout Flow

- [ ] Create checkout session
- [ ] Handle successful payment
- [ ] Handle payment failure
- [ ] Trial signup flow
- [ ] Cancel URL handling

### Subscription Management

- [ ] Upgrade subscription
- [ ] Downgrade subscription
- [ ] Cancel subscription
- [ ] Resume subscription
- [ ] Handle past due status

### Webhook Events

- [ ] checkout.session.completed
- [ ] customer.subscription.created
- [ ] customer.subscription.updated
- [ ] customer.subscription.deleted
- [ ] customer.subscription.past_due
- [ ] invoice.payment_succeeded
- [ ] invoice.payment_failed
- [ ] charge.succeeded
- [ ] charge.failed

### Feature Gating

- [ ] Free plan restrictions
- [ ] Pro plan features
- [ ] Usage limit enforcement
- [ ] Trial feature access

### API Usage

- [ ] API key creation
- [ ] API key authentication
- [ ] Usage tracking
- [ ] Rate limiting
- [ ] Quota enforcement

---

## Priority Matrix

| Priority | Area | Impact | Effort |
|----------|------|--------|--------|
| **P0** | Webhook queue dispatch | Critical | Medium |
| **P0** | Auth middleware completion | Critical | Medium |
| **P1** | Error handling robustness | High | High |
| **P1** | Database transaction safety | High | Medium |
| **P2** | Security audit | High | Medium |
| **P2** | Performance optimization | Medium | High |
| **P3** | Feature completion | Medium | High |
| **P3** | Testing infrastructure | Medium | High |

---

## Success Definition

The codebase is considered robust when:

1. **Reliability:** 99.9% webhook processing success rate
2. **Security:** No critical vulnerabilities in security audit
3. **Performance:** API responses <200ms p95
4. **Test Coverage:** >80% unit test coverage, all critical paths tested
5. **Documentation:** All public APIs documented with examples
6. **Monitoring:** Health checks and alerts in place
7. **Recovery:** Automated recovery from common failure scenarios

---

## Tools & Commands

```bash
# Development
bun run dev                    # Start dev server
bun run stripe:webhook         # Start webhook listener
bun run db:studio              # Drizzle Studio

# Testing (to be added)
bun test                       # Run unit tests
bun test:integration           # Run integration tests
bun test:e2e                   # Run E2E tests

# CLI
npx drew-billing-cli doctor    # Run diagnostics
npx drew-billing-cli verify    # Verify Stripe setup
npx drew-billing-cli sandbox   # Run in sandbox mode

# Database
bun run db:push                # Push schema changes
bun run db:migrate             # Run migrations
bun run db:generate            # Generate migration files
```

---

## Questions for Stakeholders

1. What's the target Stripe API version? (Currently using 2026-03-25.dahlia)
2. Is Redis available for caching, or should we use in-memory?
3. What's the preferred email provider for dunning emails? (Resend, SendGrid, etc.)
4. Should we support non-PostgreSQL databases?
5. What's the SLA target for webhook processing?

---

*Generated for repository: /Users/drewsepeczi/monetize/monetize*
*Date: April 2026*
