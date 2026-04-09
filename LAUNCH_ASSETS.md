# Phase 7: Launch Assets

Complete launch package for drew-billing-cli.

---

## 1. Twitter/X Launch Thread

### Tweet 1/7 (Hook)
```
I spent 3 weeks integrating Stripe into my SaaS.

The webhooks. The database schema. The retry logic. The edge cases.

So I built something better:

Add subscriptions in 10 minutes, not 3 weeks.

🧵 Here's how it works:
```

### Tweet 2/7 (Problem)
```
Stripe is powerful but painful.

You need to:
→ Design a database schema for subscriptions
→ Handle webhook retries and idempotency  
→ Build a customer portal UI
→ Sync subscription state
→ Handle usage-based billing

That's weeks of work. Every. Single. Time.
```

### Tweet 3/7 (Solution)
```
drew-billing-cli gives you everything:

✅ One CLI command sets it all up
✅ Pre-built components (pricing, portal, dashboard)
✅ Automatic webhook handling with retries
✅ TypeScript SDK — one line to check subscriptions
✅ Usage-based billing built in

10 minutes. Not 3 weeks.

billing.drew.dev
```

### Tweet 4/7 (Demo)
```
Live demo (no signup required):

billing.drew.dev/try

See the exact checkout flow your customers will experience.

Click a plan → "pay" with test card → watch the subscription activate instantly.

The webhooks, database sync, and state management — all automatic.
```

### Tweet 5/7 (Code Example)
```
Check if a user has access to a feature:

const { hasSubscription, features } = await billing.getSubscription(userId);

if (features.includes("api_access")) {
  // Allow API call
}

That's it. No webhook parsing. No state syncing. No edge cases.

The SDK handles everything.
```

### Tweet 6/7 (Social Proof / Examples)
```
3 complete example apps included:

🚀 SaaS Starter — auth, pricing page, customer dashboard
⚡ API Billing — usage-based, API key management  
🤖 AI Credits — credit system, top-up flows

All deploy in 10 minutes. All production-ready.

github.com/drew/billing/examples
```

### Tweet 7/7 (CTA)
```
It's free. It's open source. No vendor lock-in.

We use Stripe under the hood — we just handle the hard parts.

Try the live demo → billing.drew.dev/try

Or run this:
npx drew-billing-cli init

RT to save a developer from Stripe webhook hell 🙏
```

---

## 2. Reddit Post (r/webdev)

```
Showoff Saturday: I built a billing system that sets up in 10 minutes

I got tired of spending weeks on Stripe integration for every project. Webhooks, retries, database schemas, customer portals... it's a lot.

So I built drew-billing-cli — a complete billing system with:

- CLI setup (detects your framework, installs everything)
- Pre-built components (pricing page, customer portal, dashboard)
- TypeScript SDK (one line to check subscriptions)
- Automatic webhook handling (with idempotency + retries)
- Usage-based billing built in

**Live demo (no signup):** billing.drew.dev/try

You can literally go from zero to accepting payments in 10 minutes. I have 3 example apps (SaaS, API billing, AI credits) that all deploy that fast.

It's open source and uses Stripe under the hood — just handles all the hard parts for you.

Try it: npx drew-billing-cli init

Would love feedback from anyone who's battled Stripe integration before!
```

---

## 3. Hacker News Post

```
Show HN: Add subscriptions in 10 minutes, not 3 weeks

I've built Stripe integrations for multiple SaaS products. Each time it was 2-3 weeks of:

- Database schema design for subscriptions
- Webhook handling with proper idempotency
- Retry logic with exponential backoff
- Customer portal UI
- Subscription state synchronization
- Usage-based billing infrastructure

So I built drew-billing-cli — a complete billing system that sets up with one CLI command.

What you get:
- One command: npx drew-billing-cli init
- Pre-built, customizable components (pricing, portal, dashboard)
- TypeScript SDK with one-line subscription checks
- Automatic webhook handling (idempotent, with retries)
- Usage-based billing out of the box
- 3 complete example apps (SaaS, API billing, AI credits)

Live demo: https://billing.drew.dev/try
GitHub: https://github.com/drew/billing

The demo lets you go through a full checkout flow (sandbox mode) to see exactly what your customers would experience.

It's free, open source, MIT licensed. Uses Stripe under the hood — just handles all the integration complexity.

Would appreciate any feedback or questions!
```

---

## 4. Indie Hackers Post

```
I got tired of rebuilding Stripe billing for every project

Every SaaS I built needed the same thing:
→ Pricing page
→ Checkout flow
→ Subscription management
→ Customer portal
→ Webhook handling
→ Usage tracking

And every time I spent 2-3 weeks on it.

So I productized my approach:

drew-billing-cli — Complete billing system for Next.js

The pitch: 10-minute setup instead of 3 weeks.

What it includes:
• CLI that detects your stack and configures everything
• Pre-built components you can customize
• SDK: one line to check subscription status
• Automatic webhooks (idempotent, retries, the works)
• Usage-based billing
• 3 example apps (SaaS, API, AI credits)

Live demo: billing.drew.dev/try

Try it: npx drew-billing-cli init

It's open source (MIT). Uses Stripe — just handles the hard parts.

Anyone else tired of rebuilding billing?
```

---

## 5. Email to Existing List / Newsletter

**Subject:** Launching today: Billing in 10 minutes

```
Hey [name],

I'm launching drew-billing-cli today — a complete billing system for Next.js that sets up in 10 minutes.

If you've ever integrated Stripe, you know the drill:
- Database schemas
- Webhook handling
- Retry logic
- Customer portals
- Subscription state sync

Weeks of work. Every. Time.

drew-billing-cli does it all with one command:

npx drew-billing-cli init

You get:
✅ Pre-built pricing page, customer portal, dashboard
✅ TypeScript SDK — one line to check subscriptions  
✅ Automatic webhooks with idempotency + retries
✅ Usage-based billing
✅ 3 complete example apps

Try the live demo (no signup required):
https://billing.drew.dev/try

The project is open source (MIT). No vendor lock-in — it uses Stripe under the hood, just handles the integration complexity for you.

Would love your feedback. Hit reply and let me know what you think!

Drew
```

---

## 6. Product Hunt Launch (Preparation)

### Tagline
"Add subscriptions in 10 minutes — complete billing system for Next.js"

### Description
```
drew-billing-cli is a complete billing system that sets up with one CLI command. 

Instead of spending 2-3 weeks building Stripe integration (database schemas, webhooks, retry logic, customer portal), you get:

• One command setup (npx drew-billing-cli init)
• Pre-built, customizable components
• TypeScript SDK — check subscriptions in one line
• Automatic webhook handling (idempotent, with retries)
• Usage-based billing built in
• 3 complete example apps (SaaS, API billing, AI credits)

Live demo: billing.drew.dev/try

Open source (MIT). Uses Stripe under the hood — just handles the hard parts so you don't have to.
```

---

## 7. LinkedIn Post

```
I spent 3 weeks on Stripe integration for my last SaaS.

This time? 10 minutes.

Just launched drew-billing-cli — a complete billing system for Next.js:

✅ One CLI command sets everything up
✅ Pre-built components (pricing, portal, dashboard)  
✅ TypeScript SDK — check subscriptions in one line
✅ Automatic webhook handling with retries
✅ Usage-based billing included
✅ 3 complete example apps

The live demo lets you try a full checkout flow (no signup):
billing.drew.dev/try

It's open source and uses Stripe under the hood — we just handle all the integration complexity.

If you're building a SaaS, this will save you weeks.

#buildinpublic #saas #stripe #billing
```

---

## Summary: Launch Checklist

- [ ] Post Twitter thread (all 7 tweets)
- [ ] Post to r/webdev
- [ ] Submit to Hacker News
- [ ] Post to Indie Hackers
- [ ] Send email to existing list
- [ ] Prepare Product Hunt listing
- [ ] Post to LinkedIn
- [ ] Share in relevant Discord communities
- [ ] Share in relevant Slack communities

**Launch Day Actions:**
1. Post Twitter thread at 9am EST (optimal engagement time)
2. Submit HN 30 minutes later
3. Post Reddit at 10am
4. Post Indie Hackers at 11am
5. Send email at 12pm
6. Monitor responses and reply quickly
7. Track funnel metrics throughout the day
