# PostHog Setup — Dashboards + Alerts

Step-by-step guide for configuring the seven dashboards and four alerts
in PostHog Cloud (EU region). Companion to `posthog-events.md` — every
insight in this doc references events defined there.

**Time to complete:** ~25-35 minutes of clicking in the PostHog UI.

Open PostHog → https://eu.posthog.com → log in → select the FirstNinety
project. All dashboard/alert work happens in the UI; no code changes.

---

## Dashboard 1 — Acquisition

**Purpose:** Where new users come from + the funnel from landing to active.

**Create:** Dashboards → New dashboard → "Acquisition".

**Insights to add:**

1. **Signups by source.** Insight type: Trend.
   - Event: `$pageview`, filtered to URL contains `/register` (until the dedicated `signup_completed` event lands per `posthog-events.md` follow-up 2).
   - Breakdown: `signup_source` user property (set during signUpAction).
   - Time range: last 30 days, daily.

2. **Landing → register conversion.** Insight type: Funnel.
   - Step 1: `landing_section_viewed` where `section_id = 'hero'`.
   - Step 2: `$pageview` where path = `/register`.
   - Step 3: `$pageview` where path matches `/onboarding/step-1`.
   - Conversion window: 24 hours.

3. **AIE wedge funnel.** Insight type: Funnel.
   - Step 1: `landing_section_viewed` where `section_id starts with 'aie-'`.
   - Step 2: `landing_section_viewed` where `section_id = 'aie-probation'` (the dedicated probation-section signal).
   - Step 3: `$pageview` where path = `/register`.
   - Step 4: `$pageview` where path matches `/onboarding/step-1`.
   - Tells you whether the AIE landing converts vs the main landing.

4. **Net signup growth.** Insight type: Trend.
   - Event A: `$pageview` where URL contains `/onboarding/step-4` (proxy for signup-completed until the dedicated event lands).
   - Event B: `account_deleted` (subtracted).

Note: 'Joberlify cross-sell signups' from the original Prompt 5.7 is **removed** — Joberlify cross-sell is no longer a feature (per the May 2026 decision). The signup_source field stays; it just won't have Joberlify values.

---

## Dashboard 2 — Activation

**Purpose:** The north-star metric and the first-48-hours funnel.

**Create:** Dashboards → New dashboard → "Activation".

**Insights:**

1. **Day-30 Active Rate (north star).** Insight type: Lifecycle.
   - Event: `$pageview` (any page).
   - Or `ai_call_completed` (stricter — only counts users who actively used an AI surface).
   - Display: % of cohort still active at day 30.
   - The PRD §10 calls this out as the primary growth metric.

2. **Activation rate (within 48h of signup).** Insight type: Funnel.
   - Step 1: `$pageview` where path = `/onboarding/step-4` (proxy for signup until dedicated event).
   - Step 2: `ai_call_completed` (any surface).
   - Conversion window: 48 hours.
   - Note: this gets cleaner once the `first_mission_completed` / `first_situation_room_session` / `first_simulator_run` events land per posthog-events.md follow-up 3.

3. **Surface-by-surface activation.** Insight type: Trend.
   - Event: `ai_call_completed`, breakdown by `surface`.
   - Time range: last 30 days, daily.
   - Tells you which surface is the first-touch for activated users.

---

## Dashboard 3 — Retention

**Purpose:** Whether users stick past the first week + how deeply they use the product.

**Create:** Dashboards → New dashboard → "Retention".

**Insights:**

1. **Weekly active users.** Insight type: Trend.
   - Event: `ai_call_completed` (active = made at least one AI call this week).
   - Display: weekly bar chart, last 12 weeks.
   - Math: Unique users.

2. **Simulator runs per active user per week.** Insight type: Trend.
   - Event: `ai_call_completed` where `surface = 'simulator'`.
   - Math: Total events / Unique users (calculated metric).
   - Time range: last 8 weeks, weekly.

3. **Situation Room sessions per active user per week.** Insight type: Trend.
   - Event: `ai_call_completed` where `surface = 'situation_room'`.
   - Math: Total events / Unique users.

4. **Mission Track completion at Day 90.** Insight type: Trend.
   - Source: needs the `mission_completed` event added per posthog-events.md follow-up 3. Stub: track via direct SQL query for now (mission_completions table count per user vs total missions).

5. **Retention curve.** Insight type: Retention.
   - Cohortise by: signup week (proxy: first `$pageview` at `/onboarding/step-4`).
   - Returning event: `ai_call_completed`.
   - Periods: weekly, 12 weeks out.

---

## Dashboard 4 — Conversion

**Purpose:** Free → Pro funnel + trial conversion + churn.

**Create:** Dashboards → New dashboard → "Conversion".

**Insights:**

1. **Trial-to-paid conversion.** Insight type: Funnel.
   - Step 1: `stripe_webhook` where `event_type = 'customer.subscription.created'` and the subscription was in trial.
   - Step 2: `stripe_webhook` where `event_type = 'invoice.payment_succeeded'`, occurring after the trial-end timestamp.
   - Window: 14 days from trial start.

2. **Cancellation events over time.** Insight type: Trend.
   - Event: `stripe_webhook` where `event_type = 'customer.subscription.deleted'`.
   - Display: weekly count, last 12 weeks.

3. **Failed-payment events.** Insight type: Trend.
   - Event: `stripe_webhook` where `event_type = 'invoice.payment_failed'`.
   - Display: weekly count.
   - Anything above ~2-3/week warrants a look.

---

## Dashboard 5 — AI Cost

**Purpose:** Cost per user, per surface, identifying cost outliers.

**Create:** Dashboards → New dashboard → "AI Cost".

**Insights:**

1. **Total daily AI cost.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: Sum of `cost_usd`.
   - Time range: last 30 days, daily.
   - **This is the daily-spend chart.** Alert thresholds (see "Alerts" below) reference this.

2. **Cost per user per month.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: Sum of `cost_usd` ÷ unique users (calculated metric).
   - Time range: last 4 months, monthly.

3. **Cost by surface.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: Sum of `cost_usd`.
   - Breakdown: `surface`.
   - Stacked bar, last 30 days, daily.

4. **Cost outliers — top 10 expensive users this week.** Insight type: User Paths or table.
   - Event: `ai_call_completed`.
   - Math: Sum of `cost_usd` per user.
   - Filter: last 7 days.
   - Sort: descending, limit 10.
   - **Use this weekly** to spot users who may be hitting an unintended-cost pattern (long Coach threads, repeated Simulator runs, etc.).

5. **Cost-per-call distribution.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: Median + P95 of `cost_usd`.
   - Useful for spotting if a small fraction of calls are dragging the average up.

---

## Dashboard 6 — Probation

**Purpose:** Whether Probation Mode is actually being used + the outcome distribution.

**Create:** Dashboards → New dashboard → "Probation".

**Stub-status note:** the canonical Probation events (`probation_mode_activated`, `probation_brief_generated`, `probation_outcome_captured`) **don't exist in the codebase yet** (per posthog-events.md follow-up 4). Until they're wired, this dashboard's insights have to be sourced from direct SQL queries on `user_context` and `probation_artefacts`. Add the events; then revisit.

**Insights once the events are wired:**

1. **Probation activation rate.** Trend of `probation_mode_activated` events per week.
2. **Brief generation rate.** Funnel: `probation_mode_activated` → `probation_brief_generated`.
3. **Outcome capture rate.** Funnel: `probation_brief_generated` → `probation_outcome_captured`.
4. **Outcome distribution.** Trend of `probation_outcome_captured`, breakdown by outcome (`continued` / `extended` / `ended` / `prefer_not_to_say`).

---

## Dashboard 7 — Performance

**Purpose:** Latency + error rates per AI surface.

**Create:** Dashboards → New dashboard → "Performance".

**Insights:**

1. **P95 first-token latency by surface.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: P95 of `latency_ms`.
   - Breakdown: `surface`.
   - **Caveat:** `latency_ms` in `ai_call_completed` is end-to-end SDK call time, not first-token-to-stream. For streaming-true first-token, instrument SSE-emit time separately (Phase 6 candidate).

2. **P50 latency by surface.** Same as above but P50 math.

3. **Error rate by surface.** Insight type: Trend.
   - Event: `ai_call_completed`.
   - Math: % of events where `error` is not null.
   - Breakdown: `surface`.

4. **Error rate global.** Same as above without breakdown.

5. **Webhook health.** Insight type: Trend.
   - Event: `stripe_webhook`.
   - Math: % where `outcome != 'ok'`.
   - Daily, last 30 days.

---

## Alerts

PostHog supports alerts on trend insights (Cloud only). Configure:
Insight → ⋯ → "Manage alerts" → New alert.

### Alert 1 — AI cost runaway (per-user)
- **Insight:** "Cost outliers — top 10 expensive users this week" (Dashboard 5).
- **Condition:** Any user's `cost_usd` sum > $5 over a rolling 24h window.
- **Channel:** Email + Slack webhook (set up `#firstninety-alerts` Slack channel).
- **Note:** the $5 threshold is the starting point; tighten after one week of production data.

### Alert 2 — AI cost runaway (global)
- **Insight:** "Total daily AI cost" (Dashboard 5).
- **Condition:** Daily total cost > $X. Set X after one week of production data; typical starting point is 3× the median daily cost over the first week.
- **Channel:** Same as Alert 1.

### Alert 3 — Error rate spike
- **Insight:** "Error rate by surface" (Dashboard 7).
- **Condition:** Any surface's error rate > 5% over a rolling 1-hour window, where total event count > 20 in that window (to avoid noise on low-traffic surfaces).
- **Channel:** Same as Alert 1.

### Alert 4 — P95 latency spike
- **Insight:** "P95 first-token latency by surface" (Dashboard 7).
- **Condition:** Any surface's P95 > 6,000ms over a rolling 1-hour window.
- **Channel:** Same as Alert 1.

### Alert 5 — Failed webhooks
- **Insight:** "Webhook health" (Dashboard 7).
- **Condition:** Any `stripe_webhook` event with `outcome != 'ok'` AND `outcome != 'unhandled'` within the last 5 minutes.
- **Channel:** Same as Alert 1 + the on-call email for Stripe webhook escalation.

---

## Slack webhook setup

PostHog → Project Settings → Integrations → Slack.

1. Create the `#firstninety-alerts` Slack channel in your workspace.
2. Add the PostHog Slack app to the channel.
3. Paste the resulting webhook URL into PostHog's Slack integration.
4. Test by editing one of the alerts above, lowering the threshold temporarily, and confirming it fires to Slack within 5 minutes.

---

## Reviewing dashboards — operational cadence

Per MVP Spec §10:

- **Daily (weekday morning):** AI Cost dashboard. Flag any outlier user; investigate within the day.
- **Weekly (Monday):** Acquisition + Activation + Retention. Note any week-over-week movement >20%.
- **Monthly:** Conversion + Probation. The probation outcome distribution is the closest thing FirstNinety has to a product-market-fit indicator.
- **Ad-hoc:** Performance — only when an alert fires or when shipping a Coach-engine change.

---

## When something changes

If you add a new event to the codebase:
1. Document it in `posthog-events.md`.
2. Decide which dashboard it powers (or whether it needs its own).
3. Update this file's relevant dashboard section.

If you change an event's properties:
1. Update `posthog-events.md`.
2. Audit dashboards that reference the changed property — older insights may need their filter updated.

If you delete an event:
1. Remove from `posthog-events.md`.
2. Search this file for the event name + retire / replace the insights.
