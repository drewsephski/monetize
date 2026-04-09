# Phase 7: 7-Day Launch Plan

**Objective:** Get first 25–50 real developers to try, activate, and provide feedback.

---

## Pre-Launch Checklist (Day -1)

- [x] Landing page optimized (hero, examples, comparison, CTAs)
- [x] Live demo page created (`/try` — sandbox checkout flow)
- [x] README.md rewritten with launch structure
- [x] Launch assets prepared (Twitter thread, Reddit, HN, IH posts)
- [x] Feedback collection implemented (CLI prompt + database table)
- [ ] Deploy to production (`billing.drew.dev`)
- [ ] Verify demo works end-to-end
- [ ] Test CLI feedback flow
- [ ] Prepare analytics dashboard (funnel metrics visible)

---

## Day 1: Launch Day — Awareness

### Morning (9am EST)
- [ ] **Post Twitter thread** (all 7 tweets spaced 10-15 min apart)
- [ ] **Submit to Hacker News** ("Show HN" format)

### Midday (10-11am)
- [ ] **Post Reddit** r/webdev (Saturday Showoff thread if weekend)
- [ ] **Post Indie Hackers** (product launch)

### Afternoon (12-2pm)
- [ ] **Send email** to existing list/newsletter
- [ ] **Post LinkedIn**
- [ ] **Share in Discord/Slack communities** (React, Next.js, SaaS groups)

### Throughout Day
- [ ] Monitor all channels, reply to every comment within 30 minutes
- [ ] Track funnel metrics hourly
- [ ] Fix any critical bugs immediately

### Success Metrics (End of Day 1)
- Target: 100+ landing page visitors
- Target: 10+ CLI installs
- Target: 3+ successful activations (init_completed)

---

## Day 2: Engagement & Iteration

### Morning
- [ ] **Post follow-up Twitter thread** (show code examples, more detail)
- [ ] Review overnight feedback from all channels
- [ ] Identify top 3 friction points from feedback

### Afternoon
- [ ] **Ship 1-2 quick fixes** based on Day 1 feedback
- [ ] **Post Reddit** r/nextjs (if not posted Day 1)
- [ ] **Post Reddit** r/SaaS (if applicable)

### Evening
- [ ] **Analyze funnel metrics:** Where are users dropping off?
- [ ] Document patterns in feedback

### Success Metrics (End of Day 2)
- Target: 20+ CLI installs
- Target: 5+ successful activations
- Target: 3+ feedback responses

---

## Day 3: Deep Dive Content

### Morning
- [ ] **Publish technical blog post:** "How we reduced billing integration from 3 weeks to 10 minutes"
- [ ] **Post to Dev.to**
- [ ] **Post to Hashnode**

### Afternoon
- [ ] **Create and post demo video** (Loom or similar) showing 10-min setup
- [ ] **Share video on Twitter**
- [ ] **Share video on LinkedIn**

### Throughout Day
- [ ] Continue monitoring and replying to all comments
- [ ] Reach out to 5 potential users directly (DM/Twitter)

### Success Metrics (End of Day 3)
- Target: 30+ CLI installs
- Target: 10+ successful activations
- Target: 1+ first checkout attempt

---

## Day 4: Product Hunt Preparation

### Morning
- [ ] **Finalize Product Hunt listing**
  - [ ] Tagline finalized
  - [ ] Description polished
  - [ ] Screenshots/GIFs prepared
  - [ ] Maker profile updated

### Afternoon
- [ ] **Email existing users/connections** asking for PH support on launch day
- [ ] **Post "coming soon" teaser** on Twitter

### Throughout Day
- [ ] **Ship 1-2 more fixes** based on accumulated feedback
- [ ] **Analyze doctor command usage** (passive feedback signal)

### Success Metrics (End of Day 4)
- Target: 40+ CLI installs
- Target: 15+ successful activations
- Target: 5+ feedback responses

---

## Day 5: Product Hunt Launch

### Morning (12:01am PST — PH optimal time)
- [ ] **Launch on Product Hunt**
- [ ] **Post Twitter announcement** of PH launch
- [ ] **Send email** to list about PH launch

### Throughout Day
- [ ] **Reply to every PH comment** within minutes
- [ ] **Upvote and comment on related products** (build relationships)
- [ ] **Post to Twitter** multiple times with different angles
- [ ] **Share in communities** again (with PH link)

### Evening
- [ ] Analyze PH performance
- [ ] Document learnings

### Success Metrics (End of Day 5)
- Target: 50+ CLI installs
- Target: 20+ successful activations
- Target: Top 5 on Product Hunt

---

## Day 6: Double Down on What Works

### Morning
- [ ] **Analyze all metrics:** What's working? What's not?
- [ ] **Identify top traffic source** — double down there
- [ ] **Identify biggest drop-off** in funnel — fix it

### Afternoon
- [ ] **Ship 1 significant fix** for biggest drop-off
- [ ] **Create content** based on top-performing post from Days 1-5
- [ ] **Reach out to 10 more potential users**

### Throughout Day
- [ ] Continue engaging with all comments/messages

### Success Metrics (End of Day 6)
- Target: 60+ CLI installs
- Target: 25+ successful activations
- Target: 2+ first subscription events

---

## Day 7: Analyze & Plan Week 2

### Morning
- [ ] **Full metrics review:**
  - Total visitors
  - CLI installs
  - Init completions
  - First checkouts
  - First subscriptions
  - Feedback collected

### Afternoon
- [ ] **Compile feedback themes**
- [ ] **Identify top 3 feature requests**
- [ ] **Identify top 3 friction points**
- [ ] **Plan Week 2 priorities**

### Evening
- [ ] **Write retrospective** (blog post or Twitter thread)
- [ ] **Thank community** publicly
- [ ] **Set Week 2 goals**

### Success Metrics (End of Day 7)
- Target: 70+ CLI installs
- Target: 30+ successful activations
- Target: 10+ feedback responses
- Target: 70% init success rate
- Target: 50% first checkout rate

---

## Daily Loop (Every Day)

Every single day of launch week:

1. **Check funnel metrics** (telemetry dashboard)
2. **Identify biggest drop-off** in the funnel
3. **Fix that ONE issue** (ship same day if possible)
4. **Engage with every comment/message** publicly
5. **Track feedback** and look for patterns

---

## Activation Benchmarks (Track These)

| Stage | Target | How to Track |
|-------|--------|--------------|
| CLI Install | N/A | npm download stats |
| Init Started | Baseline | `init_started` event |
| Init Completed | **70%** | `init_completed` event |
| First Checkout | **50%** of completed | `first_checkout` event |
| First Subscription | **30%** of completed | `first_subscription` event |

**Where to track:**
- Telemetry events table (`telemetry_events`)
- Funnel metrics table (`funnel_metrics`)
- Custom dashboard query

---

## Feedback Collection Plan

### Inline Feedback (CLI)
- **Trigger:** After `init_completed`
- **Question:** "Was this easy to set up? (y/n)"
- **If no:** "What was difficult? (1 sentence)"
- **Storage:** `feedback_events` table

### Passive Signals
- Doctor command usage frequency
- Error frequency by step
- Funnel drop-off points
- Time spent per step

### Active Outreach (Day 3+)
- DM 5 users who completed init
- Ask for 5-min call feedback
- Offer help with any issues

---

## Launch Channels Priority

1. **Twitter/X** — Primary (your audience lives here)
2. **Hacker News** — High potential, unpredictable
3. **Product Hunt** — Day 5 focus
4. **Reddit** — r/webdev, r/nextjs, r/SaaS
5. **Indie Hackers** — Good for feedback
6. **LinkedIn** — Professional network
7. **Discord/Slack communities** — Targeted reach

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Demo breaks | Test end-to-end before launch; have rollback ready |
| CLI has bug | Have `npx drew-billing-cli@latest` ready; monitor error telemetry |
| Negative feedback | Respond quickly, acknowledge publicly, fix fast |
| Low engagement | Prepare 2-3 backup content pieces; pivot angles |
| Server overload | Deploy on Vercel (auto-scales); monitor logs |

---

## Success Definition

**Phase 7 is successful if:**

- [ ] 25+ real developers tried the product
- [ ] 10+ successful activations (init_completed)
- [ ] Clear data showing where users fail
- [ ] 3+ specific improvements identified from feedback
- [ ] 1+ real user subscription (even test mode)

**If you don't have real users, nothing else matters.**

---

## Post-Launch: Week 2 Preview

Based on feedback, prioritize:

1. **Bug fixes** from user reports
2. **Friction reduction** in highest drop-off step
3. **Documentation** improvements (if users are confused)
4. **Feature requests** with most votes
5. **Example apps** expansion (if users want specific templates)

---

**Launch date:** _____________

**Lead metric:** _____________ (daily active focus)

**Lagging metric:** _____________ (weekly review)
