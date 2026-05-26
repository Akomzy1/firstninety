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
- **Known gap:** `identifyUser()` is defined in `lib/tracing/posthog.ts`
  but not currently called anywhere on signIn / signUp. As a result,
  anonymous client-side sessions aren't merged with the user.id once
  the user authenticates. Worth fixing pre-launch — see "Open
  follow-ups" at the end.

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

Pre-launch worth doing (small):

1. **Wire `identifyUser(user.id)`** into the auth callback / app-shell mount so anonymous client sessions merge with the user.id on signIn. Without this, the `landing_section_viewed` → `account_created` funnel can't link the anonymous pre-signup events to the user once they convert.

2. **Add an explicit `signup_completed` event** in `signUpAction` (or in the auth callback that lands after email confirmation). Today, PostHog only sees `$pageview` traffic; a discrete signup event makes the Acquisition dashboard cleaner. Properties: `signup_source` (already captured on the user row).

3. **Add explicit lifecycle events** for the journey: `onboarding_completed`, `first_mission_completed`, `first_situation_room_session`, `first_simulator_run`. These power the Activation dashboard (Day-30-active requires distinguishing 'opened the app' from 'used a surface').

4. **Add `probation_mode_activated`, `probation_brief_generated`, `probation_outcome_captured`** events from the probation actions. These power the Probation dashboard; today the Probation surface is invisible to PostHog.

Each is a 1-2-line `captureServerEvent` call in the relevant action. Together they're the analytics fidelity gap between "we know users visited" and "we know what users actually did".
