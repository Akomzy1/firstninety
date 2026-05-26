# PostHog Events — Reference

The canonical list of every event the FirstNinety codebase emits to
PostHog. Update this file when a new event is added; the production
dashboards and alerts (see `posthog-setup.md`) reference event names
listed here.

**Project ID:** `phc_kL4vbuwUpi8a6VM6eJm25ugEUHUrXQLMJnBUShguHgbE` (from
`NEXT_PUBLIC_POSTHOG_KEY`; EU region).

**Distinct ID model:**
- Client-side events (e.g. `landing_section_viewed`) use PostHog's
  auto-generated anonymous distinctId until `identifyUser(user.id)` is
  called.
- Server-side events (`captureServerEvent`) use the FirstNinety
  `user.id` directly.
- **Merge bridge:** `<IdentifyBridge>` is mounted at the top of
  `(app)/layout.tsx`. On first mount of the authenticated shell it
  fires `identifyUser(user.id, {email, role})` — merging the anonymous
  client distinctId with the user.id so client + server events line up
  per user. Resets on `userId={null}`.

---

## Server-side events

### `ai_call_completed`
**Fired from:** `lib/tracing/ai-cost.ts` after every Anthropic SDK call.
**Distinct ID:** `user_id` (if present; some calls are system-initiated and skip the PostHog capture).
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `user_id` | string\|null | FirstNinety user id |
| `surface` | string | `coach` \| `situation_room` \| `simulator` \| `simulator_debrief` \| `probation_brief` |
| `model` | string | e.g. `claude-opus-4-7`, `claude-haiku-4-5-20251001` |
| `input_tokens` | number | Tokens sent to the model |
| `output_tokens` | number | Tokens received |
| `cost_usd` | number | Calculated from per-model pricing in ai-cost.ts |
| `latency_ms` | number\|null | End-to-end SDK call time |
| `tool_calls_count` | number | Tool invocations within this turn |
| `error` | string\|null | Set on SDK error; null on success |
**Powers:** the AI Cost dashboard (per-user cost, per-surface cost, cost outliers); the Performance dashboard (latency by surface, error rates). **Most important event in the codebase** — drives the cost runaway alerts.

### `stripe_webhook`
**Fired from:** `app/api/stripe/webhook/route.ts` for every Stripe webhook event received.
**Distinct ID:** `user_id` if resolvable from `subscription.metadata.user_id`, else literal `stripe-webhook-anonymous`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `event_type` | string | e.g. `customer.subscription.created`, `invoice.payment_failed` |
| `event_id` | string | Stripe's `evt_...` id for dedup tracing |
| `outcome` | string | `ok` \| `unhandled` \| `no_user_id_resolvable` \| `no_customer_id` |
| `livemode` | boolean | True for live keys, false for test |
| Extras vary by event type | | E.g. `status`, `cancel_at_period_end`, `trial_end` |
**Powers:** the Conversion dashboard (trial-to-paid, cancellation rate); the Failed Webhook alert.

### `account_deleted`
**Fired from:** `app/(app)/settings/privacy/actions.ts` during the user's two-step account-delete flow, just before the cascade-delete.
**Distinct ID:** `user.id` (final event before the user vanishes).
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `email` | string | Captured for analytics; the user row is then deleted |
**Powers:** the Acquisition dashboard (net signup growth = signups − deletions).

### `signup_completed`
**Fired from:** `app/(auth)/actions.ts:signUpAction` after `supabase.auth.signUp` returns successfully.
**Distinct ID:** the new auth `user.id` from the signUp response.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `signup_source` | string | E.g. `organic`; the source-tracking pipeline (formerly used for Joberlify) |
| `email_confirmation_pending` | boolean | True if Supabase email confirmation is enabled and the session wasn't established yet |
**Powers:** the Acquisition dashboard (top-of-funnel growth signal).

### `onboarding_completed`
**Fired from:** `app/(onboarding)/onboarding/actions.ts:completeOnboardingAction` after the user finishes step 4.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `entry_state` | string | `A` \| `B` \| `C` per MVP Spec v1.3 §3 |
| `role` | string | `ba` \| `pm` \| `sm` \| `po` \| `da` \| `aie` |
| `sector` | string\|null | If captured in step 3 |
| `work_setup` | string\|null | `remote` \| `hybrid` \| `office` |
| `current_day` | number | Day-state computed at completion |
| `current_week` | number | Week-state computed at completion |
**Powers:** the Activation dashboard (step-by-step funnel from signup → onboarding-complete).

### `mission_completed`
**Fired from:** `app/(app)/mission-track/actions.ts:completeMissionAction`.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `mission_slug` | string | E.g. `ba-w1-map-stakeholders` |
| `week` | number | Mission's week (1-13) |
| `sequence_in_week` | number | Position within the week |
| `had_reflection` | boolean | True if the reflection field was filled |
**Powers:** the Retention dashboard (Mission Track completion + per-week trajectory). Use PostHog's "first-time matched" filter to derive first-mission-completed for the Activation dashboard.

### `situation_session_created`
**Fired from:** `app/(app)/situation-room/actions.ts:submitSituationAction` after the situation_sessions row insert.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `entry_type` | string | `prep` \| `is_this_normal` \| `debrief` \| `probation` |
| `flagged_for_safety` | boolean | Crisis pre-flight result |
| `body_length` | number | Raw input length in characters |
**Powers:** Retention (sessions per active user per week); use "first-time matched" for the Activation funnel.

### `simulator_run_started`
**Fired from:** `app/(app)/simulator/actions.ts:startScenarioRunAction` after the scenario_runs row insert.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `scenario_slug` | string | E.g. `ba-hostile-lead-dev` |
| `scenario_id` | string | UUID of the scenarios row |
**Powers:** Retention (runs per active user per week); use "first-time matched" for the Activation funnel.

### `probation_mode_activated`
**Fired from:** both `app/(app)/probation/actions.ts:activateProbationModeAction` AND `app/(app)/settings/probation/actions.ts:activateProbationModeAction`. The `source` property distinguishes them.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `source` | string | `probation_banner` (the home banner CTA) \| `settings_page` (Settings → Probation toggle) |
**Powers:** the Probation dashboard.

### `probation_brief_generated`
**Fired from:** `lib/probation/brief.ts:generateProbationBrief` after the artefact insert + user_context stamp succeed.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `generation_number` | number | 1, 2, or 3 (lifetime cap of 3 per user) |
| `days_to_review` | number\|null | Computed from current_day; null for users past Day 90 |
**Powers:** the Probation dashboard (brief generation funnel from activation).

### `probation_outcome_captured`
**Fired from:** `app/(app)/probation/actions.ts:captureProbationOutcomeAction`.
**Distinct ID:** `user.id`.
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `outcome` | string | `continued` \| `extended` \| `ended` \| `prefer_not_to_say` |
**Powers:** the Probation dashboard outcome distribution — the closest thing FirstNinety has to a product-market-fit indicator.

---

## Client-side events

### `landing_section_viewed`
**Fired from:** `components/marketing/ScrollDepthTracker.tsx` when one of the named landing-page sections enters the viewport at ≥30% visibility. Fires once per section per pageview (auto-unobserved after firing).
**Distinct ID:** anonymous PostHog distinctId (these visitors are pre-signup).
**Properties:**
| Property | Type | Notes |
|---|---|---|
| `section_id` | string | One of: `hero`, `why-this-exists`, `how-it-works`, `tool-situation-room`, `tool-simulator`, `tool-coach`, `tool-playbook`, `tool-mission-track`, `tool-probation-prep`, `pricing` (main landing); `aie-hero`, `aie-convos`, `aie-probation`, `aie-whats`, `aie-clarify`, `aie-pricing` (AIE landing) |
| `scroll_y` | number | window.scrollY at the moment of firing |
| `viewport_height` | number | window.innerHeight at firing |
**Powers:** the Acquisition dashboard (which sections of the landing convert); the AIE wedge funnel (filter by `section_id` starting with `aie-`).

---

## Auto-captured events

The PostHog SDK is initialised with:
```ts
posthog.init(key, {
  capture_pageview: "history_change",  // SPA pageviews
  capture_pageleave: true,
  capture_exceptions: true,
  autocapture: false,                  // No DOM auto-capture
  person_profiles: "identified_only",
  persistence: "localStorage+cookie",
  disable_session_recording: true,
});
```

**Captured automatically:**
- `$pageview` — on history change (Next.js client navigation + initial load)
- `$pageleave` — on page unload
- `$exception` — on uncaught client exceptions

**NOT captured (deliberate):**
- Autocapture (click / form / change events) — disabled to keep traffic explicit and to avoid capturing form-field content
- Session recording — disabled (privacy + cost)

---

## Open follow-ups

Remaining gaps (small, optional):

1. **Coach engagement events** — `coach_thread_created` + `coach_message_sent` would add an analytics surface for the Coach (currently visible only via `ai_call_completed` filtered to `surface=coach`). Useful for the Activation dashboard's first-time-Coach-message signal.

2. **Stripe-driven events with cleaner names** — currently every Stripe webhook fires `stripe_webhook` with `event_type` as a property. Adding aliased events (`subscription_started`, `subscription_canceled`, `trial_will_end`) inside the webhook handler would make PostHog insights simpler to author. The raw `stripe_webhook` stays for completeness.

3. **`scenario_run_completed`** — only `simulator_run_started` is fired today. Adding the completed-event from `completeScenarioRunAction` (when it lands) would let the Retention dashboard show the start-vs-finish ratio per scenario.

4. **`mission_skipped` (user-initiated)** — distinguish user-skipped from `skipped_pre_signup` (which is structural backfill from the State B mid-journey path). Lets us see whether users are actively skipping missions vs just inheriting skips.

None of these are blockers; the wiring done in this commit covers the seven dashboards' core needs.
