# FirstNinety — CLAUDE.md (v1.3)

This file provides project context to Claude (Claude Code, Claude.ai, or any Claude integration) when working on the FirstNinety codebase or design system.

**Version:** 1.3
**Last updated:** 23 May 2026
**Companion documents:** PRD v1.9, MVP Spec v1.3, Competitive Analysis v1.1, Design Brief v1.0, Design Prompts v2.1, SKILL.md v1.3, Build Prompts v1.3

**Changes from v1.2:**
- §"What NOT to do" extended with item 17: no "catch up" mode for mid-journey users (they're not behind, they're starting where they are)
- §"Post-Day-90 reuse" extended to clarify Probation Mode is independent of curriculum state
- New section: "Three entry states" explaining State A / B / C handling at signup
- Cross-references updated to v1.9 PRD and v1.3 MVP Spec

**Changes from v1.1 (carried forward from v1.2):**
- §"What NOT to do" extended with item 16: no technical execution help

---

## What FirstNinety Is

FirstNinety is a premium AI-native workplace coaching SaaS that helps freshly trained tech professionals survive their first 90 days in a new role. The MVP supports six roles: Business Analyst, Project Manager, Scrum Master, Product Owner, Data Analyst, and Junior/Associate AI Engineer.

The product is **not** a job-search tool (that's Joberlify, a sibling product), **not** mid-career executive coaching (that's BetterUp territory), **not** a bootcamp curriculum (that's upstream). It is workplace-survival-and-tradecraft coaching for the first 90 days inside the job.

Pricing: **$39.99/month Pro** ($399/year), with a deliberately-rebalanced generous free tier. UK + US launch markets. Premium positioning — Maya (28-42, career-changer, £45-60k UK / $70-100k US) is the primary persona.

---

## Core Features (MVP) — six surfaces

1. **Situation Room** — on-demand AI help for real workplace moments happening now (Feature; agentic deepening in Phase 2A). The product's most-used surface. Four entry types: prep / is-this-normal / debrief / probation (fourth only visible when Probation Mode is active).
2. **AI Coach** — the conversational engine; the only lightly agentic surface at MVP via tool-calling. Powers Situation Room responses and ad-hoc conversations.
3. **Scenario Simulator** — AI roleplays of role-specific workplace situations with structured debriefs (Feature, not Agent; uses two-call persona + coordinator pattern per MVP Spec §4.4)
4. **Playbook Library** — worked examples of real-world artefacts with margin annotations (BRDs, user stories, eval rubrics, Probation Prep Pack, etc.) (Content; no AI at retrieval)
5. **90-Day Mission Track** — fixed-ordering curriculum at MVP (state machine; no AI in orchestration). **Concludes at Day 90 by design** — see §"Post-Day-90 reuse" below.
6. **Probation Prep Mode** — time-bound surface for the final 21 days before the user's probation review (PRD §6.6). Layered over the other surfaces (banner replacement, missions inserted, fourth Situation entry, fourth Coach tool). Auto-deactivates on review date. Optional outcome capture.

Read PRD v1.8 for the canonical feature spec.

---

## Stack & Conventions

### Technology stack
- **Frontend:** Next.js 16 (App Router) as installable PWA, TypeScript, TailwindCSS, shadcn/ui
- **Auth:** Supabase Auth (email + Google)
- **Database:** Supabase Postgres
- **AI:** Claude Opus 4.7 (Coach, Simulator persona reasoning), Claude Haiku 4.5 (lightweight retrieval, summarisation)
- **Payments:** Stripe (UK + US at launch; Paystack and Razorpay in Phase 2C)
- **Email:** Resend
- **Hosting:** Vercel
- **Analytics:** PostHog
- **Mobile:** PWA at MVP; native Expo/React Native conditional in Phase 2B based on PWA metrics

### Code organisation
- App routes live under `app/`; group by user surface, not by feature type (`app/(marketing)`, `app/(app)`, `app/(api)`)
- Server actions over API routes wherever possible
- Shared UI in `components/ui/` (shadcn-generated, never edited in place); shared business components in `components/`
- Domain logic in `lib/` organised by feature (`lib/simulator/`, `lib/coach/`, `lib/situation-room/`, etc.)
- Types co-located with the module they describe; no global `types.ts` dumping ground
- Supabase types generated into `lib/db/types.gen.ts`; never edited by hand

### Naming conventions
- Files: kebab-case (`scenario-runner.ts`)
- Components: PascalCase (`ScenarioRunner.tsx`)
- DB tables: snake_case plural (`scenario_runs`, `situation_sessions`)
- API routes: kebab-case under `app/(api)/`
- Env vars: SCREAMING_SNAKE_CASE; new vars require an entry in `.env.example`

### Database conventions
- Every table has `id` (uuid), `created_at`, `updated_at` (auto-managed via trigger)
- User-owned rows have `user_id` with RLS enforced (see §"Security" below)
- Content tables (`scenarios`, `playbooks`, `missions`) carry a `role` field — six values: `ba`, `pm`, `sm`, `po`, `da`, `aie`
- `career_stage` field reserved on content tables but unused at MVP (deferred from staged-product discussion)

### Frontend conventions
- **Tailwind classes only** — no CSS modules, no styled-components. Tailwind is the design system.
- **CSS variables for tokens** (see Design Brief §4 and §5). Tokens defined in `app/globals.css`, referenced via Tailwind config.
- **No inline styles** except for dynamic values that genuinely can't be expressed in Tailwind (positioning calculations, dynamic gradients — which we don't use anyway).
- **Server components by default**; client components only where interactivity demands it. Mark with `'use client'` at the top.
- **Streaming where it matters** — Coach responses, Simulator turns, and Situation Room responses stream via SSE.

---

## What NOT to do — common failure modes

These are the patterns that *will* break the FirstNinety premium positioning, listed because they're easy to drift into:

1. **Do not add gradient backgrounds.** Single solid colours only. If a screen feels "boring", the answer is more whitespace, not more colour.
2. **Do not use pure white or pure black.** `--paper` is `#FAF7F2`, `--ink` is `#0E1116`. Pure white reads cheap, pure black reads cold.
3. **Do not add emojis to product UI.** Only ✓, →, ↗ are allowed.
4. **Do not add exclamation marks to product UI.** They cheapen the premium signal.
5. **Do not add stock illustrations of people, abstract gradient blobs, or "AI sparkles" (✨).**
6. **Do not generate "celebratory" animations** — no streak fireworks, no confetti, no bouncing buttons.
7. **Do not introduce a second accent colour.** The palette is intentionally tight.
8. **Do not use rounded-pill buttons.** 0-4px corner radius only.
9. **Do not write copy with phrases like "Let's get started!", "You've got this!", "Awesome!"** Voice rules in Design Brief §2.
10. **Do not capture employer/colleague real names** in any DB field. See PRD §9.6 and §12.2 — this is a positive trust commitment.
11. **Do not integrate with employer systems** (Jira, Slack, employer email/calendar). Explicitly out of scope at MVP and likely forever in the consumer product.
12. **Do not build features that turn the Coach into a generic chatbot.** The Coach is *role-aware, situation-aware*. Anything that drifts toward "talk to AI about anything" weakens the core differentiator.
13. **Do not build agentic features at MVP** unless explicitly specced. See PRD §9.5: Coach tool-calling is the only agentic surface. Everything else is well-prompted features.
14. **Do not over-build the Mission Track.** At MVP it's a deterministic state machine — fixed ordering, no AI in orchestration. Adaptive ordering is Phase 2B.
15. **Do not add a community / forum surface.** Cohort tier was deliberately removed; do not reintroduce it through the back door.
16. **Do not build features that provide technical execution help.** No SQL syntax helpers, no code debugging surfaces, no library configuration walkthroughs, no "explain this error" tools, no IDE-style autocomplete. FirstNinety's moat is workplace context (role-aware, situation-aware, probation-aware). ChatGPT, Stack Overflow, Cursor, and GitHub Copilot already serve technical execution at scale; users pay them $0–20/month for that lane. FirstNinety at $39.99/month only justifies its premium by doing what those tools cannot: knowing the user is a Week-6 BA at a financial services firm with a hostile lead developer. Features that drift into technical execution erode the premium positioning, confuse the value proposition, and risk hallucinating technical content that damages trust in the workplace coaching the product *is* good at. The Coach handles this boundary at runtime (see SKILL.md v1.2 §8.4); features built on the Coach must not contradict it.
17. **Do not build a "catch up" mode for mid-journey signup users.** Users who sign up at Week 3 of their role are not behind — they're starting where they are. Building a condensed Week 1-3 catch-up track implies they should have been using FirstNinety from Day 1, which is wrong both architecturally (Mission Track works against lived experience, not retroactively) and emotionally (the user feels she joined something for people more organised than her). Instead, missed missions are marked `skipped_pre_signup` (per MVP Spec v1.3 §2.5) — accessible-to-read but not blocking, not required, not framed as "missed." The product respects where the user is. See PRD v1.9 §7.1 for the three entry states.

---

## Security & Privacy — first-class concerns

These are not optional:

1. **Row-Level Security (RLS) on every user-owned table.** No exceptions. Every `select` and `update` policy explicitly checks `auth.uid() = user_id`.
2. **Coach and Situation Room transcripts encrypted at rest** via Supabase Vault or pgcrypto for sensitive content.
3. **GDPR / UK GDPR compliance from day one.** DPIA produced pre-launch following ICO structure. User can delete all data in one action.
4. **No employer system ingestion.** Documented in PRD §12.2. Codified as a hard rule, not a deferral.
5. **No real names of colleagues / employers stored.** Onboarding actively encourages anonymisation ("call them 'my lead dev' instead of their real name"). Situation Room intake actively prompts to anonymise.
6. **Three-tier memory model** (PRD §9.6): Level 1 declared (MVP), Level 2 inferred (Phase 2A), Level 3 workplace ingestion (excluded).
7. **AI safety guardrails on Coach and Situation Room:** no employment law advice, no medical/mental health diagnosis, no judgement of named individuals. Fixed referral pathways for crisis, harassment, discrimination topics.
8. **Rate limiting on AI endpoints** to prevent runaway cost burn — both per-user and global circuit breakers.
9. **Cost tracking per user** as a first-class metric in the analytics dashboard.

---

## AI Architecture — features vs agents

The product is **mostly features, one lightly agentic surface (Coach with tool-calling)** at MVP. See PRD v1.8 §9.5 for the full philosophy. Engineering implications:

- **Strict tool schemas on Coach tool-calls.** Max 3 tool calls per Coach response normally; max 4 when Probation Mode is active.
- **Every Claude call traced and cost-tagged.** PostHog event with `model`, `input_tokens`, `output_tokens`, `cost_usd`.
- **Streaming via SSE** on Coach, Simulator, and Situation Room.
- **Fallback paths** for AI failures — if Claude returns 5xx, surface a graceful retry, not a crash.
- **No "improvise with the LLM" features.** Every prompt is templated, versioned, and changeable in a single file.

Tools the Coach can call at MVP:
1. `get_user_context` — current week, role, recent missions, recent simulator runs (always available)
2. `search_playbooks` — semantic search over the user's role's playbooks (always available)
3. `get_situation_history` — past Situation Room sessions for context (always available)
4. `get_probation_evidence` — structured evidence from the user's 90-day journey for probation prep (**only registered when Probation Mode is active**; max-tool-calls budget becomes 4 in this state)

Four tools, strict schemas, no surprises. Dynamic registration based on user state — see MVP Spec v1.2 §4.2.

### Coach system prompt — two variants by user day

The Coach's system prompt context block has two variants, selected at request-time by the prompt-building function (not by Claude):

- **Days 1–90:** *"You are coaching a [role] in week [N] of their first 90 days at a new role."*
- **Day 91+:** *"You are coaching a [role] who completed their first 90 days at this organisation on [date]. They are now [N] weeks into the role beyond probation."*

Voice and behaviour rules are unchanged across both variants. Only the situational priming changes. See SKILL.md v1.2 §8 for the post-90 voice adjustment.

---

## Three Entry States — how the product handles signup timing

Per PRD v1.9 §7.1, FirstNinety handles three distinct entry states based on when the user signs up relative to their actual role start date:

- **State A — Fresh start** (start_date ≥ today − 3 days): Standard journey. Mission Track Day 1 signature empty state activates. The user gets the editorial onboarding moment.
- **State B — Mid-journey within first 90 days** (today − 89 days ≤ start_date < today − 3 days): The user has already lived through some of the curriculum. Mid-journey welcome state on Daily Home replaces the Day 1 signature moment. Missions from weeks the user lived through are marked `skipped_pre_signup` — accessible-to-read but not blocking the current week.
- **State C — Post-Day-90 at signup** (start_date < today − 89 days): The user joined past Day 90 of their role. No Mission Track is created. User routes directly to the post-Day-90 Daily Home layout on first login. Coach uses a third system prompt context variant (per MVP Spec v1.3 §4.2) that doesn't assume the user used FirstNinety during their first 90 days.

Entry state is computed once at signup (in `completeOnboarding` per MVP Spec v1.3 §3) and stored in `user_context.entry_state`. It does not change after signup (a State B user who reaches Day 90 inside the product is still a State B user — the framing in their Survival Report, if any, acknowledges this).

### Why this matters for code

Any feature that touches onboarding, Daily Home, Mission Track, Coach system prompts, Probation Mode, or post-90 navigation must:
1. Check `user_context.entry_state` to determine which variant applies
2. For State C users with a future probation date, Probation Mode is the *dominant* Daily Home surface during the active window — not an overlay on a non-existent Mission Track
3. Do not surface "your first 90 days" framing in Coach voice for State C users (see SKILL.md v1.3 §11.1)
4. Do not surface a Survival Report link for State C users (they have no Survival Report)

If you're building something and the spec doesn't tell you how to handle a State B or State C user, ask. Don't assume State A is the only case.

---



Per PRD v1.8 §6.0 and §7.4, FirstNinety distinguishes between time-bound surfaces and continuing surfaces:

**Continues indefinitely** for any paying user:
- Situation Room (the daily-relevance engine — arguably *more* valuable over time as Situation history accumulates)
- AI Coach (with the post-90 priming variant — see "AI Architecture" above; State C users get a third variant)
- Playbook Library (permanent professional reference shelf)
- Scenario Simulator (with quarterly content additions per PRD v1.9 §13)

**Concludes at Day 90 by design (State A and State B users only):**
- Mission Track (13-week curriculum with a defined endpoint; State C users have no Mission Track from the start)

**Time-bound by design, independent of curriculum state:**
- Probation Prep Mode (auto-deactivates on review date; activates 21 days before *any* future probation review, regardless of where the user is in their journey or whether they have a Mission Track at all — see PRD v1.9 §6.6)

### Probation Mode works for all four user populations

This is worth being explicit about, because the original v1.7 framing of Probation Mode tied it to the 90-day curriculum. Per PRD v1.9 §6.6, that's no longer the case:

1. **State A users at end of Mission Track** (typical case) — Probation Mode overlays the final 21 days of the curriculum
2. **State B users mid-journey** — Probation Mode activates 21 days before *their* review date, which may be earlier or later than Day 90 in product terms
3. **State C users with future probation** (e.g. 6-month probation, signed up at Month 3) — Probation Mode becomes the dominant Daily Home surface during the active window, replacing the standard post-Day-90 banner
4. **Any user with an extended/repeat probation** after Day 90 — same as State C handling

Architecturally, this means Probation Mode logic must not depend on Mission Track state. The activation check is: *does the user have a future `probation_review_date`, and is today within `probation_window_days` of it?* That's the entire condition.

### Daily Home — three states

The Daily Home has three rendering states. Code must handle all three:

1. **Day 1** (signature design moment) — almost empty, one mission card, dramatic whitespace
2. **Day N within 90** — populated state with mission cards + Situation Room input + week sidebar
3. **Day 91+** — Mission Track cards gone, Situation Room input becomes the centre of gravity, "Recent" sidebar replaces "Week at a glance", "Your Survival Report is always here →" link card surfaces

See Design Prompts v2.0 C2 (states 1 + 2) and C16 (state 3). Build Prompts v1.0 prompt 2.2 handles the first two; the third is added in prompt 3.16 (authored in Build Prompts v1.1, now included in v1.2).

### Why this matters for code

Any feature that touches Daily Home, Coach system prompts, Mission Track, or post-90 navigation must:
1. Check `user_context.current_day` to determine which state applies
2. Use the post-90 Coach priming variant for users past Day 90
3. Not render Mission Track cards on Day 91+
4. Surface the "Your Survival Report is always here →" link on the post-90 home

If you're building something and the spec doesn't tell you what happens on Day 91, ask. Don't assume.

---

## Performance & Quality Bars

- **Coach / Situation Room latency:** P50 first-token < 2.5s (tracked metric)
- **Lighthouse score:** 95+ on Performance, Accessibility, Best Practices, SEO for marketing pages
- **PWA install conversion:** 40% within 7 days of first mobile-web session (tracked metric)
- **Type safety:** strict TypeScript, no `any`, no `@ts-ignore` without justification comment
- **Test coverage:** integration tests for every AI-dependent surface; unit tests for pure logic; e2e for critical paths (onboarding, paid signup, Mission Track completion)

---

## What Claude should always check before making changes

When working on FirstNinety code, before writing or modifying anything:

1. Have I read PRD v1.8 (latest version) for the feature I'm touching?
2. Is this feature in MVP scope or Phase 2A/2B/2C? (Don't accidentally build Phase 2 surfaces.)
3. Does this affect any of the "do not" list above?
4. Does this involve any AI call? If so, is it features or agents per §9.5?
5. Does this involve any user data? If so, am I respecting the three-tier memory model and RLS?
6. Does this introduce a new dependency? If so, justify it — the stack is intentionally tight.
7. Does the UI follow Design Brief §6 (component vocabulary) and §12 (premium checklist)?
8. **Does this surface need to handle the three day-states (Day 1 / Day N within 90 / Day 91+) correctly?**
9. **Does this surface need Probation-Mode-aware behaviour?** (e.g. Daily Home banner, Mission Track inserts, Situation Room fourth entry, Coach fourth tool)
10. **Does this surface need to handle the three entry states (A / B / C) correctly?** State B users have a partial Mission Track; State C users have none. Don't assume State A is the only case.

When in doubt, ask the user a sharp clarifying question rather than guessing.

---

## Working with Tokunbo

- **Workflow:** documentation-first (PRD → Competitive Analysis → MVP Spec → CLAUDE.md → SKILL.md → sequenced build prompts). Don't skip the docs.
- **Communication style:** direct, technical, no flattery, no "Great question!". Push back when something is wrong.
- **Decision pattern:** Tokunbo prefers small, sharp questions to large open-ended ones. Surface trade-offs explicitly; don't hide them.
- **File management:** all generated docs go in versioned form (`FirstNinety_PRD_v1.x.md`). Never overwrite a previous version silently.
- **Honesty over agreement:** if Tokunbo's call is wrong, say so once, briefly, then proceed with the call. Don't sandbag.

---

*End of CLAUDE.md v1.3*
