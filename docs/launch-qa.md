# Launch QA — Pre-launch Checklist

Run this checklist before flipping production traffic on. Per MVP Spec
v1.3 §10 (Definition of Done). Most items are manual — there's no
substitute for actually clicking through.

**How to use:** copy this file into a working `launch-qa-YYYY-MM-DD.md`
on launch day; tick boxes as you go; commit the completed file as the
launch record. Anything that fails goes in the `Failures + decisions`
section at the bottom and either gets fixed or explicitly accepted as
a launch risk.

---

## Pre-flight

Before you start, confirm:

- [ ] `firstninety.vercel.app` (or your canonical prod URL) returns the marketing landing
- [ ] All required Vercel env vars are set (see `docs/posthog-events.md` + `.env.example`)
- [ ] Stripe is in **Live mode** (NOT test mode) — `STRIPE_SECRET_KEY` starts with `sk_live_`
- [ ] Stripe webhook endpoint configured to prod URL with the prod `whsec_...`
- [ ] Supabase Auth → URL Configuration includes the prod URL + `prod-url/**` redirect allowance
- [ ] `npm.cmd run typecheck` passes locally on `main`
- [ ] `npm.cmd run lint` passes locally on `main`

---

## Functional

End-to-end flows that have to work.

- [ ] **Onboarding completes for a new user.** Fresh email, walk steps 1-4, land on `/home`. Verify in DB: `users.onboarding_completed_at` is set, `user_context.entry_state` is `'A'`.
- [ ] **All 6 features work end-to-end (BA role).** Walk through:
  - [ ] Daily Home renders Day-1 state with a mission card
  - [ ] Mission Track shows the BA week-1 missions; opening + completing one works
  - [ ] Situation Room intake → response stream → session persisted
  - [ ] Simulator scenario brief → run → debrief
  - [ ] Coach standalone — open `/coach`, start a thread, send a message, response streams
  - [ ] Playbook Library — open `/playbook`, read one playbook end-to-end
- [ ] **Probation flow works simulated.** Set `user_context.probation_review_date = today + 14 days` for a test user in Supabase Studio. Visit `/home` — probation banner renders. Activate Probation Mode. Generate a Brief. Visit `/probation/brief` — Brief renders. Visit `/probation/outcome` — outcome capture form renders. Submit each outcome (use 4 test users).
- [ ] **Stripe Checkout works.** From `/settings/billing` click "Start free trial" → land at Stripe Checkout → complete with a real card (or `4242 4242 4242 4242` if still in test mode for the QA) → redirect to `/home?checkout=success` → `subscriptions.tier = 'pro'`, `subscriptions.status = 'trialing'`.
- [ ] **Stripe Portal works.** From `/settings/billing` (now showing Pro) click "Manage subscription" → land at Stripe Portal → cancel → confirmation email arrives → `subscriptions.cancel_at_period_end = true`.
- [ ] **PWA installs on iOS Safari (real device).** Safari → Share → Add to Home Screen. Icon appears; tapping launches FirstNinety in standalone mode.
- [ ] **PWA installs on Chrome Android (real device).** Chrome → menu → Install app. Icon appears on home screen; tapping launches standalone.
- [ ] **All AI surfaces stream responsively.** Send a Coach message, a Situation Room intake, and run a Simulator turn. Measure P50 first-token latency for each (Chrome DevTools → Network → look for the first byte of the SSE response). Target: < 2.5s.

---

## Quality (per Design Brief §12 premium checklist)

- [ ] **Walk every page and check the premium checklist passes:**
  - [ ] No gradient backgrounds (single solid colours only)
  - [ ] No pure white or pure black (`--paper #FAF7F2`, `--ink #0E1116`)
  - [ ] No emojis (only ✓, →, ↗)
  - [ ] No exclamation marks
  - [ ] No stock illustrations of people, no abstract gradients, no AI sparkles
  - [ ] No celebratory animations (confetti, fireworks, bouncing buttons)
  - [ ] Single accent colour (no second accent)
  - [ ] 0-4px corner radius on all buttons (no pill shapes)
  - [ ] No "Let's get started!" / "You've got this!" / "Awesome!" copy
- [ ] **All five signature design moments hand-reviewed:**
  - [ ] Memory screen (`/settings/memory`) — editorial doc treatment
  - [ ] Situation Room intake — large field, three soft labels, anonymise prompt
  - [ ] Simulator brief — cinematic dark canvas
  - [ ] Day 90 Survival Report — link surfaces on post-90 home (the artefact itself stubbed pre-launch)
  - [ ] Day 1 empty state — dramatic whitespace, one mission card
- [ ] **No exclamation marks or emojis in product UI** (grep `--include="*.tsx" "!"` and triage)

---

## Safety

- [ ] **Crisis flag triggers correctly.** In a non-production test user, paste a phrase from the crisis category list (see `lib/safety/checks.ts`) into the Situation Room. Verify `situation_sessions.flagged_for_safety = true` AND the CrisisReferral component renders in the response.
- [ ] **Crisis referral component renders.** Open the test session at `/situation-room/<id>` → CrisisReferral panel visible above the conversation.
- [ ] **No real names captured anywhere.** In Supabase Studio, query: `select transcript->'opening' from situation_sessions order by created_at desc limit 50;` — spot-check that no real-looking names appear. Same for `coach_messages.content`. The anonymise advisory + per-user opt-out (PRD §9.6 + SKILL §5) should be doing the heavy lifting here.
- [ ] **Privacy Policy and Terms published.** Visit `/privacy` and `/terms` — both routable, content present (placeholder OK if final solicitor text isn't ready; flagged as launch risk in that case).
- [ ] **Refund policy published.** Visit `/refund-policy` — routable, content present.

---

## Operations

- [ ] **Cost-per-user dashboard live in PostHog.** Open PostHog → AI Cost dashboard (per `docs/posthog-setup.md`). Confirm the headline charts render with at least 24h of `ai_call_completed` events from production traffic.
- [ ] **All alerts configured.** PostHog → each of the 5 alerts (per-user cost runaway, global cost runaway, error rate spike, P95 latency spike, failed webhooks) shows as active. Lower one threshold temporarily and confirm it fires to Slack within 5 minutes; revert.
- [ ] **Health check returns 200.** `curl -H "Authorization: Bearer $CRON_SECRET" https://<prod>/api/health` returns 200 + all 4 probes report `ok: true`. If any probe is `degraded`, the body details which one and why.
- [ ] **Error pages render correctly.**
  - [ ] Visit `/xyz` → 404 renders
  - [ ] Force an error: in `app/(app)/home/page.tsx` temporarily add `throw new Error("test")` at top; visit `/home` → error.tsx renders with Try-again + Contact-support links; revert
  - [ ] Network → "Offline" in DevTools → banner appears at top of authenticated app; `/offline` page renders if you navigate to a stale route

---

## Commercial

- [ ] **Free-tier limits enforced.**
  - [ ] Situation Room weekly limit — burn 2 sessions in a fresh Free user, attempt a third → TierLimitPrompt appears
  - [ ] Coach weekly message limit — burn 5 messages, attempt 6th → TierLimitPrompt appears
  - [ ] Simulator lifetime limit — burn 4 runs, attempt 5th → TierLimitPrompt appears with "upgrade" CTA
- [ ] **Pro signup conversion path tested end-to-end.** Free user hits a limit → clicks the TierLimitPrompt CTA → lands at `/settings/billing` → starts trial → confirms in Stripe Checkout → returns to /home → can now use the previously-gated surface.
- [ ] **Refund policy published** (see Safety section — verified there).

---

## Smoke test — the full 30-minute happy path

A brand-new user (use a real fresh email):

1. Sign up. Confirm email if confirmation is enabled.
2. Walk onboarding steps 1-4. Pick BA role, start date = today.
3. From `/home`, click the first mission card → read the mission → complete it.
4. Click the Situation Room input on home → submit a test situation (e.g. "Workshop tomorrow, lead dev hostile") → receive a stream response → land on the session page.
5. Open `/simulator` → pick `ba-hostile-lead-dev` → start a run → complete one user turn → return to home.
6. Open `/coach` → send "what should I focus on this week?" → receive stream response → start a follow-up message.
7. Open `/playbook` → read one BA playbook end-to-end.
8. Burn the Situation Room weekly limit (submit 2 more → 3rd shows TierLimitPrompt).
9. Click "Upgrade to Pro" on the limit prompt → land at billing → start trial → complete Stripe Checkout → return to home.
10. From `/settings/probation` set probation date to today+14, activate Probation Mode.
11. From `/probation/brief` generate the Brief.
12. From `/settings/billing` open Stripe Portal → cancel subscription.

The full path should land under 30 minutes of clicking. If any step
takes a markedly long time or doesn't work as documented, log it
below as a launch risk.

---

## Performance (Lighthouse)

Run Lighthouse on three pages and record the scores. Target: 95+ on
Performance, Accessibility, Best Practices, SEO for each.

- [ ] `/` (marketing landing) — Performance: ___, A11y: ___, Best Practices: ___, SEO: ___
- [ ] `/pricing` — Performance: ___, A11y: ___, Best Practices: ___, SEO: ___
- [ ] `/ai-engineer` — Performance: ___, A11y: ___, Best Practices: ___, SEO: ___

Lighthouse on authenticated pages will be lower (they're all
`force-dynamic` and personalised); not a target.

---

## Failures + decisions

List any item that didn't pass. For each: either fix-before-launch or
explicit accept-as-launch-risk with the reason.

| Item | Status | Decision |
|------|--------|----------|
|      |        |          |

---

## Sign-off

When everything above is ticked or explicitly accepted as a risk:

**Launched on:** _____________ (date + time UTC)
**By:** _____________
**Smoke test passed:** Y / N
**Health check returns 200:** Y / N
**Outstanding launch risks (link to entries above):** _____________
