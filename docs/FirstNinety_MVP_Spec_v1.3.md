# FirstNinety — MVP Specification v1.0

**Version:** 1.3
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Status:** Pre-build
**Last updated:** 23 May 2026
**Companion documents:** PRD v1.9, Competitive Analysis v1.1, Design Brief v1.0, CLAUDE.md v1.3, SKILL.md v1.3

**Changes from v1.2 — Mid-journey signups and decoupled Probation Mode:**
- §2.5 `mission_status_enum` extended with `skipped_pre_signup` value
- §3 `completeOnboarding` server action extended to backfill missed mission_completions rows
- §3 added `getEntryState` server action to compute State A / B / C at signup
- §4.2 Coach gains third system prompt context variant for State C users (no first-90-days framing)
- §9 Phase 1.2 (onboarding) extended with three-state detection
- §9 Phase 2.2 (Daily Home) extended with State B mid-journey welcome state
- §9 Phase 3.17 added: Probation Mode in post-Day-90 standalone context (no curriculum overlay)
- Build time estimate adjusted from 30-38 days to 33-41 days (+3 days)
- §11 Open spec: State B Survival Report eligibility question added

---

## 0. How to Read This Document

This document specifies *how* FirstNinety is built. The PRD tells you what the product is and why; this spec tells you how to build it.

Order of reading:
1. PRD v1.6 first (what the product does)
2. CLAUDE.md (project conventions)
3. SKILL.md (content authoring rules)
4. **This document** (technical specification — what to build, in what order, against which contracts)
5. Build Prompts v1.0 (the prompt-by-prompt sequence for Claude Code)

Every section here is referenced by one or more Build Prompts. Where a Build Prompt says *"per MVP Spec §X.Y"*, it means *go read that section before proceeding*.

---

## 1. Architecture Overview

### 1.1 Stack confirmed

- **Frontend:** Next.js 16 (App Router) deployed as installable PWA
- **Language:** TypeScript (strict, no `any`, no `@ts-ignore` without justification)
- **Styling:** TailwindCSS + CSS variables (design tokens from Design Brief §4–§5)
- **UI components:** shadcn/ui (generated into `components/ui/`, never edited in place)
- **Database:** Supabase Postgres with Row-Level Security on every user-owned table
- **Auth:** Supabase Auth (email + Google OAuth)
- **AI:** Claude Opus 4.7 (Coach, Simulator persona reasoning, Situation Room), Claude Haiku 4.5 (lightweight retrieval, summarisation)
- **Payments:** Stripe (UK + US at launch; Paystack and Razorpay in Phase 2C)
- **Email:** Resend
- **Hosting:** Vercel
- **Analytics:** PostHog (events + feature flags)
- **Native mobile:** out of scope at MVP; PWA serves mobile

### 1.2 Repository structure

Single Next.js repo, monorepo not required.

```
firstninety/
├── app/
│   ├── (marketing)/              # Public marketing surfaces
│   │   ├── page.tsx              # Main landing
│   │   ├── ai-engineer/page.tsx  # Dedicated AI Engineer landing
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx            # Marketing layout (different chrome)
│   ├── (app)/                    # Authenticated product surfaces
│   │   ├── home/                 # Daily home / dashboard
│   │   ├── mission-track/        # Mission Track week + detail views
│   │   ├── situation-room/       # Situation Room intake + sessions
│   │   ├── simulator/            # Scenario Simulator
│   │   ├── coach/                # AI Coach
│   │   ├── playbook/             # Playbook Library
│   │   ├── settings/             # Memory, billing, account
│   │   └── layout.tsx            # App layout with sidebar nav
│   ├── (auth)/                   # Auth surfaces (login, register, callback)
│   ├── (onboarding)/             # 4-step onboarding (post-signup, pre-app)
│   ├── api/                      # API routes — only where server actions can't
│   │   ├── stripe/webhook/route.ts
│   │   ├── claude/stream/route.ts
│   │   └── push/subscribe/route.ts
│   ├── globals.css               # Design tokens as CSS variables
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn-generated (never edited)
│   ├── nav/                      # Navigation chrome
│   ├── mission/                  # Mission cards, week views
│   ├── situation/                # Situation Room components
│   ├── simulator/                # Simulator brief, active session, debrief
│   ├── coach/                    # Coach conversation components
│   ├── playbook/                 # Playbook reader, margin annotations
│   ├── shared/                   # Persona monograms, status badges, etc.
│   └── marketing/                # Marketing-only components
├── lib/
│   ├── db/                       # Supabase client, generated types, query helpers
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookies)
│   │   ├── service.ts            # Service-role client (limited use)
│   │   └── types.gen.ts          # Generated from schema
│   ├── auth/                     # Auth helpers
│   ├── coach/                    # Coach engine — prompts, tool schemas, streaming
│   ├── simulator/                # Simulator engine — persona logic, debrief generation
│   ├── situation-room/           # Situation Room intake + AI logic
│   ├── mission-track/            # Mission Track state machine
│   ├── memory/                   # User memory model (Level 1)
│   ├── playbooks/                # Playbook loading + rendering helpers
│   ├── billing/                  # Stripe integration
│   ├── safety/                   # AI safety guardrails (shared across AI surfaces)
│   ├── tracing/                  # PostHog + cost tracking
│   └── content/                  # Seed content loaders (scenarios, missions, playbooks)
├── content/                      # Content as data files (markdown + JSON)
│   ├── scenarios/                # Scenario briefs + rubrics by role
│   ├── playbooks/                # Playbook content + worked examples
│   ├── missions/                 # Mission Track content by role
│   └── coach-prompts/            # System prompts (versioned)
├── supabase/
│   ├── migrations/               # SQL migrations
│   ├── seed.sql                  # Dev seed data
│   └── config.toml
├── public/
│   ├── icons/                    # PWA icons (multiple sizes)
│   ├── manifest.json             # PWA manifest
│   └── fonts/                    # Self-hosted Fraunces / Inter / Geist Mono variable files
├── scripts/                      # One-off utilities (content seeding, migrations)
├── tests/                        # Integration + e2e tests
├── .env.example
├── CLAUDE.md
├── SKILL.md
├── README.md
└── package.json
```

**Three principles for this structure:**
1. Group by user-facing surface (`app/(app)/situation-room/`) not by technical layer
2. Domain logic lives in `lib/` organised by feature, not by tech
3. Content lives in `content/` as data files — scenarios and playbooks are content, not code

### 1.3 Environment variables (`.env.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=
CLAUDE_OPUS_MODEL=claude-opus-4-7
CLAUDE_HAIKU_MODEL=claude-haiku-4-5-20251001

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID_MONTHLY=
STRIPE_PRO_PRICE_ID_YEARLY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_FEATURE_FLAGS_DEFAULT=
NODE_ENV=
```

Every new env var requires an entry here. Never commit `.env.local`.

---

## 2. Database Schema

The schema is designed for the MVP feature set (PRD §6) and the three-tier memory model (PRD §9.6). It is intentionally tight — every table has a clear owner and a clear purpose.

### 2.1 Naming conventions

- Tables: snake_case plural (`scenario_runs`)
- Columns: snake_case
- Primary keys: `id` (uuid, default `gen_random_uuid()`)
- Timestamps: `created_at`, `updated_at` — both `timestamptz`, both NOT NULL, both auto-managed via trigger
- Foreign keys: `<table>_id` (e.g., `user_id`, `scenario_id`)
- Booleans: positive phrasing (`is_active` not `is_inactive`)
- JSON: use `jsonb` not `json`

### 2.2 Tables — Core

#### `users`

Supabase Auth manages auth users. We extend with an application-level `users` row created on signup.

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  primary_role role_enum not null,
  secondary_role role_enum,
  signup_source text,                    -- 'organic', 'bootcamp_<partner_id>', etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type role_enum as enum ('ba', 'pm', 'sm', 'po', 'da', 'aie');
```

RLS: users can `select` and `update` their own row only.

#### `subscriptions`

Stripe is source of truth for billing state; we cache critical fields locally for fast gating without API calls.

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status subscription_status_enum not null default 'free',
  tier tier_enum not null default 'free',
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type subscription_status_enum as enum ('free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type tier_enum as enum ('free', 'pro');

create unique index subscriptions_user_id_unique on public.subscriptions(user_id);
```

RLS: users can `select` their own subscription. Inserts and updates are server-side only (service role).

### 2.3 Tables — User context

#### `user_responsibilities`

Level 1 declared memory (PRD §9.6). User-provided plain-text responsibilities and project context.

```sql
create table public.user_responsibilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  description text not null,             -- Free-text "I'm working on the customer onboarding portal"
  source memory_source_enum not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type memory_source_enum as enum ('onboarding', 'sunday_prompt', 'coach_inferred', 'user_manual');

create index user_responsibilities_user_current on public.user_responsibilities(user_id, is_current);
```

RLS: users can CRUD their own rows.

#### `user_context`

Lightweight profile + journey state. One row per user.

```sql
create table public.user_context (
  user_id uuid primary key references public.users(id) on delete cascade,
  start_date date,                       -- When the user's "Day 1" begins
  sector text,                            -- Optional anonymised sector tag
  work_setup work_setup_enum,
  current_week integer not null default 1,
  current_day integer not null default 1,
  focus_areas text[],
  last_sunday_prompt_at timestamptz,
  -- Probation Mode fields (PRD §6.6, §7.5)
  probation_review_date date,            -- Optional; user-provided
  probation_mode_active boolean not null default false,
  probation_window_days integer not null default 21,  -- Min 7, max 90
  probation_brief_generated_at timestamptz,
  probation_outcome probation_outcome_enum,
  probation_outcome_captured_at timestamptz,
  timezone text default 'UTC',           -- For Sunday prompt + probation trigger timing
  entry_state entry_state_enum not null default 'A',  -- Computed at signup; see PRD v1.9 §7.1
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type work_setup_enum as enum ('remote', 'hybrid', 'office');
create type probation_outcome_enum as enum ('continued', 'extended', 'ended', 'prefer_not_to_say');
create type entry_state_enum as enum ('A', 'B', 'C');
```

RLS: users can CRUD their own row.

### 2.4 Tables — Content (shared, not user-owned)

These tables hold the **role-specific content**. They are read-only for users; writes are administrative (via seed scripts and admin tools, not via the app).

#### `scenarios`

```sql
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,             -- e.g., 'ba-hostile-lead-dev'
  role role_enum not null,
  title text not null,
  one_liner text not null,               -- 15-20 word setup
  brief text not null,                   -- 2-3 paragraph cinematic brief
  objective text not null,
  curveball text not null,               -- Hidden mid-scenario reveal
  personas jsonb not null,               -- Array: [{name, role, position, fear, monogram}]
  rubric jsonb not null,                 -- {green: [], yellow: [], red: []}
  estimated_minutes integer not null default 12,
  difficulty integer not null default 2, -- 1-5
  career_stage text not null default 'first_90_days', -- Reserved for staged-product
  is_published boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenarios_role_published on public.scenarios(role, is_published);
```

RLS: any authenticated user can `select` rows where `is_published = true`. No user-side writes.

#### `playbooks`

```sql
create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  role role_enum not null,
  artefact_type text not null,           -- 'brd', 'user_story', 'raid_log', etc.
  title text not null,
  variant text,                          -- 'standard' | 'regulatory' | 'greenfield' etc.
  description text not null,
  empty_template_md text not null,       -- Markdown of clean template
  worked_examples jsonb not null,        -- Array: [{title, content_md, annotations: [{section_id, note}]}]
  common_mistakes text[] not null,
  variant_patterns text[],
  related_scenarios text[],              -- Array of scenario slugs
  career_stage text not null default 'first_90_days',
  is_published boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index playbooks_role_published on public.playbooks(role, is_published);
```

RLS: published-rows readable by authenticated users.

#### `missions`

```sql
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  role role_enum not null,
  week integer not null,                 -- 1-13
  sequence_in_week integer not null,     -- 1-4
  title text not null,
  why_matters text not null,
  steps text[] not null,
  resource_refs jsonb,                   -- {playbook_slugs: [], scenario_slugs: []}
  success_criteria text not null,
  reflection_prompt text not null,
  estimated_minutes integer not null,
  prerequisites text[],                  -- Mission slugs that must be done first
  career_stage text not null default 'first_90_days',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index missions_role_week_seq on public.missions(role, week, sequence_in_week);
```

RLS: published rows readable by authenticated users.

### 2.5 Tables — User activity

#### `mission_completions`

```sql
create table public.mission_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id),
  status mission_status_enum not null default 'in_progress',
  reflection_response text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type mission_status_enum as enum ('in_progress', 'completed', 'skipped', 'skipped_pre_signup');

create unique index mission_completions_user_mission on public.mission_completions(user_id, mission_id);
```

RLS: users CRUD their own rows.

#### `scenario_runs`

Each Simulator session.

```sql
create table public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id),
  transcript jsonb not null default '[]',   -- Array: [{turn, speaker, content, timestamp}]
  status scenario_run_status_enum not null default 'active',
  debrief jsonb,                         -- {judgement, green_flags, yellow_flags, red_flags, what_next}
  outcome text,                          -- 'green', 'yellow', 'red'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type scenario_run_status_enum as enum ('active', 'completed', 'abandoned');

create index scenario_runs_user_status on public.scenario_runs(user_id, status);
```

RLS: users CRUD their own rows.

#### `situation_sessions`

Each Situation Room session.

```sql
create table public.situation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_type situation_entry_type_enum not null,
  situation_summary text not null,       -- The user's initial submission
  transcript jsonb not null default '[]',
  related_playbook_ids uuid[],
  related_scenario_id uuid references public.scenarios(id),
  flagged_for_safety boolean not null default false,
  safety_referral_shown boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type situation_entry_type_enum as enum ('prep', 'is_this_normal', 'debrief');

create index situation_sessions_user_created on public.situation_sessions(user_id, created_at desc);
```

RLS: users CRUD their own rows.

#### `coach_threads` and `coach_messages`

Persistent Coach conversations, scoped per topic.

```sql
create table public.coach_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_title text not null,             -- Auto-generated from first user message, editable
  is_archived boolean not null default false,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.coach_threads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role coach_message_role_enum not null,
  content text not null,
  tool_calls jsonb,                      -- Captured tool_use blocks for traceability
  cost_usd numeric(10,6),
  input_tokens integer,
  output_tokens integer,
  model text,                            -- e.g. 'claude-opus-4-7'
  created_at timestamptz not null default now()
);

create type coach_message_role_enum as enum ('user', 'assistant', 'tool', 'system');

create index coach_messages_thread on public.coach_messages(thread_id, created_at);
```

RLS: users CRUD their own threads and messages.

### 2.6 Tables — Tracking & operational

#### `ai_calls` — Cost and usage tracking

Every Claude call writes a row here for cost tracking and debugging.

```sql
create table public.ai_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  surface text not null,                 -- 'coach', 'situation_room', 'simulator', 'simulator_debrief'
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  cost_usd numeric(10,6) not null,
  latency_ms integer,
  tool_calls_count integer default 0,
  error text,
  created_at timestamptz not null default now()
);

create index ai_calls_user_surface_created on public.ai_calls(user_id, surface, created_at desc);
```

RLS: users can `select` only their own rows. Inserts service-side only.

#### `usage_limits` — Free-tier enforcement counters

Per-user weekly rolling counters for free-tier enforcement.

```sql
create table public.usage_limits (
  user_id uuid primary key references public.users(id) on delete cascade,
  simulator_runs_lifetime integer not null default 0,
  situation_sessions_week integer not null default 0,
  coach_messages_week integer not null default 0,
  week_reset_at timestamptz not null default date_trunc('week', now() + interval '1 week'),
  updated_at timestamptz not null default now()
);
```

A scheduled function resets `_week` counters every Sunday midnight UTC. Trigger on the relevant insert tables increments the counter.

RLS: users `select` only.

#### `probation_artefacts` — Probation Mode generated documents (PRD §6.6)

Stores the structured Probation Brief, Self-Assessment, and Evidence Portfolio. JSONB rather than separate columns so the document structure can evolve without migrations.

```sql
create table public.probation_artefacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  artefact_type probation_artefact_type_enum not null,
  content jsonb not null,                -- Structure varies by type
  is_current boolean not null default true,
  generated_at timestamptz not null default now(),
  exported_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type probation_artefact_type_enum as enum ('brief', 'self_assessment', 'evidence_portfolio', 'pre_review_agenda');

create index probation_artefacts_user_type_current on public.probation_artefacts(user_id, artefact_type, is_current);
```

**Brief content structure:**
```typescript
{
  top_half: {
    delivered: string,    // 1 paragraph
    learned: string,      // 1 paragraph
    want_next: string     // 1 paragraph
  },
  bottom_half: {
    examples: [
      { title: string, paragraph: string, source_type: 'mission' | 'simulator' | 'situation' | 'manual', source_id?: string }
    ]
  },
  footer: {
    questions_for_manager: [string, string, string]
  },
  generated_for_review_date: string,
  user_edits: jsonb  // Tracks user modifications post-generation
}
```

RLS: users CRUD their own rows.

#### `push_subscriptions` — PWA push notifications

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index push_subscriptions_user_endpoint on public.push_subscriptions(user_id, endpoint);
```

### 2.7 Triggers

**`set_updated_at`** — auto-update `updated_at` on row updates. Applied to every table with an `updated_at` column.

**`increment_usage_simulator`** — on insert into `scenario_runs`, increment `usage_limits.simulator_runs_lifetime` for that user.

**`increment_usage_situation`** — on insert into `situation_sessions`, increment `usage_limits.situation_sessions_week`.

**`increment_usage_coach`** — on insert into `coach_messages` where `role = 'user'` and message is from an ad-hoc Coach thread (not from Situation Room or Simulator debrief), increment `usage_limits.coach_messages_week`.

**`reset_weekly_usage`** — scheduled (pg_cron or Vercel cron hitting an endpoint) every Sunday 00:00 UTC. Resets all `_week` counters.

### 2.8 Row-Level Security baseline

Every table with a `user_id` has these policies (templated):

```sql
alter table <table> enable row level security;

create policy "users_select_own" on <table>
  for select using (auth.uid() = user_id);

create policy "users_insert_own" on <table>
  for insert with check (auth.uid() = user_id);

create policy "users_update_own" on <table>
  for update using (auth.uid() = user_id);

create policy "users_delete_own" on <table>
  for delete using (auth.uid() = user_id);
```

Content tables (`scenarios`, `playbooks`, `missions`) have a read-only policy: `select` allowed where `is_published = true` AND user is authenticated. No user-side writes.

`subscriptions`, `ai_calls`, `usage_limits` allow user `select` only. Writes happen server-side with the service role.

---

## 3. API Surface

FirstNinety prefers **server actions over API routes** wherever feasible. API routes exist only for:

1. Stripe webhooks (must be a route, not an action)
2. SSE streaming for AI responses (cleaner as a route)
3. Push notification subscription/unsubscription

### 3.1 Server actions

Server actions live next to the surface they serve (e.g., `app/(app)/situation-room/actions.ts`).

**Naming convention:** verb-first, descriptive, never abbreviations.

#### Mission Track

- `startMission(missionId: string)` → `{ completion_id: string }`
- `completeMission(missionId: string, reflectionResponse?: string)` → `void`
- `skipMission(missionId: string, reason?: string)` → `void`
- `getCurrentWeekMissions()` → `Mission[]`
- `advanceToNextDay()` → `void`  *(triggered by cron at midnight user-local; this is the manual override for testing)*

#### Memory

- `addUserResponsibility(description: string, source: MemorySource)` → `void`
- `updateUserResponsibility(id: string, description: string)` → `void`
- `deleteUserResponsibility(id: string)` → `void`
- `listUserResponsibilities()` → `UserResponsibility[]`
- `submitSundayPrompt(response: string)` → `void`  *(parses response into one or more responsibilities)*

#### Onboarding

- `completeOnboarding(payload: OnboardingPayload)` → `{ redirect: string, entry_state: 'A' | 'B' | 'C' }`
  - Computes entry state from `payload.start_date`:
    - **State A:** start_date ≥ today − 3 days (fresh start)
    - **State B:** today − 89 days ≤ start_date < today − 3 days (mid-journey within 90 days)
    - **State C:** start_date < today − 89 days (post-Day-90 at signup)
  - For **State B:** backfills `mission_completions` rows with status `skipped_pre_signup` for all missions in weeks 1 through (current_week − 1). Mission detail pages remain readable; current week missions are not blocked by these.
  - For **State C:** does not create any `mission_completions` rows; user routes directly to post-Day-90 Daily Home state on first login.
  - For all states: updates `user_context` with `start_date`, `current_day`, `current_week` (computed), `probation_review_date` (if provided), `entry_state` (new column — see §2.3).
  - Redirect target: `/home` (Daily Home renders the right state based on `entry_state` and `current_day`).
- `getEntryState()` → `{ state: 'A' | 'B' | 'C', current_day: number, current_week: number, has_survival_report_eligibility: boolean }`
  - Read-only helper used by Daily Home and Coach handlers to determine which state and priming variant to render. `has_survival_report_eligibility` is true only for State A and State B users (not State C — they didn't run the curriculum).

#### Settings

- `updateProfile(payload: ProfileUpdate)` → `void`
- `deleteAccount()` → `{ confirmation_required: boolean }`  *(two-step destructive flow)*

#### Billing

- `createCheckoutSession(priceId: string)` → `{ url: string }`
- `createPortalSession()` → `{ url: string }`
- `getSubscriptionStatus()` → `SubscriptionState`

#### Probation Mode (PRD §6.6, §7.5)

- `setProbationReviewDate(date: string | null)` → `void` — store or clear probation date
- `setProbationWindow(days: number)` → `void` — override default 21-day window (min 7, max 90)
- `activateProbationMode()` → `void` — switches mode on; idempotent
- `deactivateProbationMode()` → `void` — user-initiated only; mode also auto-deactivates on review date
- `getProbationStatus()` → `{ active: boolean, days_to_review: number | null, window_days: number, brief_generated: boolean }`
- `generateProbationBrief()` → `{ artefact_id: string }` — invokes Opus to assemble the Brief; uses `get_probation_evidence` server-side
- `updateProbationBrief(artefactId: string, edits: object)` → `void` — capture user edits
- `exportProbationBrief(artefactId: string)` → `{ pdf_url: string }` — server-rendered PDF; one-time URL with 24h TTL
- `captureProbationOutcome(outcome: ProbationOutcome)` → `{ followup_thread_id: string }` — records outcome and opens a Coach thread voiced for the outcome

### 3.2 API routes

#### `POST /api/claude/stream`

Streams Claude responses via Server-Sent Events. Used by Coach, Situation Room, and Simulator surfaces.

Request body:
```typescript
{
  surface: 'coach' | 'situation_room' | 'simulator' | 'simulator_debrief',
  context_id: string,   // thread_id, session_id, or run_id
  user_message?: string,
  // surface-specific fields documented per surface in §4
}
```

Response: SSE stream of:
- `{type: 'text_delta', delta: string}`
- `{type: 'tool_use_start', tool_name, tool_id}`
- `{type: 'tool_use_input', tool_id, input_delta}`
- `{type: 'tool_result', tool_id, result}`
- `{type: 'message_complete', message_id, cost_usd}`
- `{type: 'error', error}`

Authentication: Supabase JWT in cookie (server-side validated).

Tier enforcement: checked at the start of the request. If user is free-tier and the surface has reached its limit, return `{type: 'error', error: 'tier_limit_reached', upgrade_url}` immediately.

#### `POST /api/stripe/webhook`

Stripe webhook handler. Verifies signature, processes `customer.subscription.*` events, updates `subscriptions` table.

#### `POST /api/push/subscribe`

Registers a Web Push subscription for the authenticated user.

#### `POST /api/cron/reset-weekly-usage`

Triggered by Vercel cron every Sunday 00:00 UTC. Resets `usage_limits._week` counters. Authenticated via cron secret in header.

#### `POST /api/cron/sunday-prompt`

Triggered by Vercel cron every Sunday 18:00 user-local (computed per user). Sends the "what's coming up this week?" prompt via push + email.

### 3.3 Tier enforcement contract

All AI surfaces check tier limits via this server-side helper before invoking Claude:

```typescript
async function checkTierAllowance(
  userId: string,
  surface: 'simulator' | 'situation_room' | 'coach_adhoc'
): Promise<{ allowed: true } | { allowed: false; reason: string; limit: number; used: number }>
```

If `allowed: false`, the surface returns a tier-limit response before any AI call is made. **Never make an AI call and then deny — always deny first.**

---

## 4. AI Architecture

Per PRD §9.5, FirstNinety is **mostly features with one lightly agentic surface (the Coach's tool-calling)** at MVP. This section specifies how each AI surface works.

### 4.1 Shared infrastructure

#### Claude client wrapper

All Claude calls go through `lib/coach/claude.ts` — a thin wrapper that:

1. Authenticates with `ANTHROPIC_API_KEY`
2. Streams responses
3. Captures token usage and cost into `ai_calls`
4. Applies global circuit breakers (hard limits)
5. Honours per-user rate limiting
6. Includes safety guardrail system message injection (see §4.6)

Default config:
- Opus model: `claude-opus-4-7`
- Haiku model: `claude-haiku-4-5-20251001`
- Max tokens output: 2048 for Coach/Situation Room; 1024 for Simulator turns; 1500 for Simulator debriefs
- Temperature: 0.7 for Simulator persona turns; 0.4 for Coach and Situation Room; 0.3 for debriefs

#### Cost-tracking event

After every call:
```typescript
await trackAICall({
  user_id, surface, model, input_tokens, output_tokens,
  cost_usd, latency_ms, tool_calls_count, error
});
```

Cost calculation: simple per-1M-token rates loaded from a constants file, multiplied by token counts. Refresh rates when models update.

### 4.2 AI Coach engine

The Coach is the **only agentic surface at MVP**. It uses Claude Opus 4.7 with tool-calling.

#### System prompt structure

The system prompt is composed at request-time from these blocks:

1. **Role priming** (varies by user's primary role; loaded from `content/coach-prompts/role-{role}.md`)
2. **Voice & behaviour rules** (constant across all roles; loaded from `content/coach-prompts/voice.md`)
3. **Current context block** (dynamically generated; *three variants based on user's entry state and current day*):
   - **State A or B users, Days 1–90:** *"You are coaching a [role] in week [N] of their first 90 days at a new role."*
   - **State A or B users, Day 91+ (graduated within product):** *"You are coaching a [role] who completed their first 90 days at this organisation on [date]. They are now [N] weeks into the role beyond probation."*
   - **State C users (joined post-Day-90):** *"You are coaching a [role] who is now [N] weeks into their role at this organisation. They joined FirstNinety after their first 90 days had already passed, so you have no journey data from that period — only what they tell you and what they've done in FirstNinety since signup."*
   
   The voice and behaviour rules are unchanged across all three — only the situational priming changes. For State C users specifically, the Coach must not reference "your first 90 days" framing or surfaces that have concluded (Mission Track, Survival Report) — see SKILL.md v1.3 §11.1.
4. **Safety guardrails** (constant; from `lib/safety/guardrails.md`)
5. **Tool descriptions** (auto-generated from tool schemas; `get_probation_evidence` only registered when Probation Mode is active)

The full system prompt is concatenated and passed to Claude as the `system` parameter. Versioned in git. The day-based context variant is selected by the prompt-building function, not by Claude.

#### Tools (max 3 per response by default; 4 when Probation Mode active; strict schemas)

```typescript
// Tool 1: get_user_context
const getUserContextTool = {
  name: 'get_user_context',
  description: 'Retrieve the user\'s current role, week, day, recent missions, and recent journey context.',
  input_schema: {
    type: 'object',
    properties: {},  // No input — context is keyed by authenticated user
    required: []
  }
};

// Tool 2: search_playbooks
const searchPlaybooksTool = {
  name: 'search_playbooks',
  description: 'Search the Playbook library for relevant artefacts and worked examples. Returns up to 5 results.',
  input_schema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Natural language query.' },
      role: { type: 'string', enum: ['ba', 'pm', 'sm', 'po', 'da', 'aie'], description: 'Filter by role.' }
    },
    required: ['query']
  }
};

// Tool 3: get_situation_history
const getSituationHistoryTool = {
  name: 'get_situation_history',
  description: 'Retrieve the user\'s recent Situation Room sessions for context. Returns up to 10 most recent.',
  input_schema: {
    type: 'object',
    properties: {
      lookback_days: { type: 'integer', description: 'Number of days to look back.', default: 30 }
    },
    required: []
  }
};

// Tool 4: get_probation_evidence (only registered when Probation Mode is active)
const getProbationEvidenceTool = {
  name: 'get_probation_evidence',
  description: 'Retrieve structured evidence from the user\'s 90-day journey for probation prep: completed missions, green-scored simulator runs, situation sessions, journal reflections. Only available when Probation Mode is active.',
  input_schema: {
    type: 'object',
    properties: {
      categories: {
        type: 'array',
        items: { type: 'string', enum: ['missions', 'simulator_wins', 'situations', 'reflections'] },
        description: 'Which evidence categories to include.',
        default: ['missions', 'simulator_wins', 'situations', 'reflections']
      }
    },
    required: []
  }
};
```

**Tool count is dynamic:** if `user_context.probation_mode_active = true`, the fourth tool is registered and the per-response call limit becomes 4. Otherwise the tool is not exposed and the limit stays at 3.

Tools are implemented in `lib/coach/tools.ts`. Each tool is a function that returns a JSON-serializable result. Tool results are passed back to Claude as `tool_result` content blocks.

#### Request flow

1. User sends message → `POST /api/claude/stream`
2. Server validates auth, checks tier allowance
3. Server loads thread history (max 20 most recent messages)
4. Server constructs full message array (system + history + new user message)
5. Streams Claude response
6. On `tool_use` event: pauses stream, executes tool (max 3 per response), continues stream with result
7. On `message_complete`: writes message to `coach_messages`, updates `coach_threads.last_message_at`, tracks cost
8. Streams `message_complete` event to client and closes

### 4.3 Situation Room

The Situation Room uses Claude Opus 4.7 but **without tool-calling at MVP**. It's a feature, not an agent. The agentic deepening (Real-Situation Triage Agent) ships in Phase 2A.

#### Three entry templates

Each entry type has a distinct system prompt and intake structure (per SKILL.md §5).

**Prep mode** (`'I need help with something specific right now'`):
- System prompt block from `content/coach-prompts/situation-prep.md`
- Intake asks 2–3 clarifying questions in sequence (questions are templated, not generated)
- Final response is a structured "prep brief" + 3 response paths (read playbook / roleplay / talk it through)

**Is this normal mode**:
- System prompt block from `content/coach-prompts/situation-normal.md`
- Voice rules: validate first, resist catastrophising, resist false reassurance, offer 2-3 interpretations
- No clarifying questions — accepts the situation as given and responds

**Debrief mode**:
- System prompt block from `content/coach-prompts/situation-debrief.md`
- Asks: how are you feeling, what's the next interaction likely to be
- Returns: green flags / yellow flags / no flags / follow-up suggestion

#### Surface flow

1. User opens Situation Room → renders intake (large input field, 3 soft labels)
2. User selects entry type (default: prep) and submits situation
3. Server creates `situation_sessions` row with `entry_type` and `situation_summary`
4. Server calls Claude Opus 4.7 with the relevant system prompt
5. Streams response to user
6. Appends Claude's response to `situation_sessions.transcript`
7. Renders response paths cards (Read playbook / Roleplay / Talk it through)

If user clicks a response path:
- **Read playbook** → navigates to playbook detail
- **Roleplay** → creates a short Simulator session pre-loaded with situation context
- **Talk it through** → spawns a new Coach thread with the situation context attached

### 4.4 Scenario Simulator

The Simulator is a **feature**, not an agent. The persona AI roleplays multiple characters in a conversational loop, scored against a pre-authored rubric.

#### Architecture

The Simulator runs two distinct AI calls per turn:

1. **Persona response call** — Claude Opus 4.7 acting as one or more personas, generating their reply to the user's input
2. **Scenario coordinator call** — Claude Haiku 4.5 deciding whether the scenario has reached its objective, the curveball should fire, or the scenario should end

#### Persona response call

System prompt assembled from:
- Scenario brief (from `scenarios` table)
- Personas array with positions and fears
- Current turn number and history
- Instruction: "Respond as exactly one of the personas. Maintain their voice, position, and fear consistently. The conversation should escalate if the user fumbles."

Output: a single JSON object:
```typescript
{
  speaker: 'sam' | 'priya' | 'marcus',
  content: string,
  internal_note?: string  // not shown to user; for debugging
}
```

#### Scenario coordinator call

After each user turn, the coordinator (Haiku) decides:
- Has the objective been met? → end scenario as success
- Has the user stalled (3+ turns of no progress)? → end as yellow
- Has the user lost the room (specific failure patterns)? → end as red
- Should the curveball fire? → inject it into the next persona response
- Otherwise → continue

Input: scenario brief + rubric + full transcript so far
Output: `{action: 'continue' | 'end_success' | 'end_yellow' | 'end_red' | 'fire_curveball', reasoning: string}`

This coordinator pattern keeps the Simulator from running forever and ensures the debrief is rubric-grounded, not improvised.

#### Debrief generation

When scenario ends, a final Claude Opus 4.7 call generates the debrief per SKILL.md §4.3:
- Single Fraunces H1 judgement
- 2-3 green flags
- 2-3 yellow flags
- 0-1 red flag (only if outcome warrants)
- 1-sentence "what this rehearses for"
- 1-line "what's next" with surface recommendation

Stored in `scenario_runs.debrief` as JSONB.

### 4.5 Streaming protocol (SSE)

All AI surfaces stream via Server-Sent Events. Single endpoint: `POST /api/claude/stream`.

Event types:
- `text_delta` — incremental text content
- `tool_use_start` — Coach is about to call a tool
- `tool_use_input` — streaming tool input (rare to surface to user)
- `tool_result` — tool call completed
- `message_complete` — final message ready
- `scenario_end` — Simulator-specific
- `error` — surface to user
- `tier_limit` — special error for tier-gating

Client reconnect logic: on disconnect, client polls `/api/coach/thread/:id/latest` to recover state. Server is idempotent — partial messages are persisted on each delta-batch flush (every 500ms or 100 tokens, whichever is sooner).

### 4.6 Safety guardrails

Shared across all AI surfaces. Implemented in `lib/safety/guardrails.ts`.

#### System message injection

Every AI system prompt includes a `<safety_rules>` block from `lib/safety/guardrails.md`:

```
<safety_rules>
You do not provide employment law advice. If the user describes potential legal issues
(harassment, discrimination, wrongful termination, contract disputes), acknowledge the
seriousness, decline to advise, and suggest speaking to a lawyer or their HR department.

You do not provide medical or mental health diagnosis. If the user describes signs of
serious mental health distress (suicidal ideation, panic attacks, ongoing depression),
respond with care, decline to diagnose, and surface crisis resources.

You do not make judgements about named individuals. The user has been instructed to
anonymise — if they slip and use a real name, you should not store it in any
characterisation. Refer to people only by their role.

You stay scoped to professional tradecraft for the user's role and first 90 days.
If the user asks something out of scope (general life advice, political opinion,
unrelated technical questions), redirect gently.

You never refer to yourself as "an AI" or "an assistant" in third person. You speak
in first or second person.
</safety_rules>
```

#### Pre-flight content checks

Before sending a user message to Claude, run:

1. **Crisis keyword check** — if message matches crisis patterns (suicide, self-harm, abuse, harassment), set `flagged_for_safety = true` on the session, and **prepend a safety referral** to the AI's system prompt for that turn.
2. **PII scan** — if message contains an email address or phone number, prompt the user to remove it before submission.
3. **Real-name heuristic** — if message contains capitalised names that look like real names (not role titles), surface a gentle UI prompt: *"Looks like you might be using a real name. Anonymise as 'my lead dev' or similar."*

These checks are non-blocking advisories at MVP (the user can still submit) except for crisis keywords, which trigger an additional safety referral surface alongside the AI response.

#### Crisis referral surface

When `flagged_for_safety = true`, after the AI response renders, an additional component appears:

> *We noticed something in what you shared. If you're in immediate distress, please contact:*
> *— Samaritans (UK): 116 123 (free, 24/7)*
> *— 988 Suicide & Crisis Lifeline (US): call or text 988*
> *— [Your country's emergency line]*

This is **always shown** when the flag fires — not gated, not conditional on user behaviour.

---

## 5. PWA Configuration

### 5.1 Manifest

`public/manifest.json`:
```json
{
  "name": "FirstNinety",
  "short_name": "FirstNinety",
  "description": "The 90 days nobody trained you for.",
  "start_url": "/home",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#0E1116",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "orientation": "portrait",
  "categories": ["productivity", "education"]
}
```

### 5.2 Service worker scope (per PRD §9.1.1)

Use `next-pwa` for service worker generation. Caching rules:

- **App shell:** cached on install (chrome, fonts, design tokens)
- **Playbooks:** cached on first read, stale-while-revalidate
- **Mission Track metadata for current + next week:** cached
- **AI surfaces (Coach, Situation Room, Simulator):** *never cached* — network-only

### 5.3 Offline behaviour

- **Works offline:** reading Playbooks (cached), viewing Mission Track structure (cached), viewing past Situation Room transcripts (cached for 30 days)
- **Requires connectivity:** Coach, Situation Room (new), Simulator, Mission Track completion submission
- **Offline banner:** when navigator.onLine is false, show a thin banner at the top: *"You're offline. Playbooks are still readable; Coach and Situation Room will reconnect when you're back."*

### 5.4 Push notifications

- Web Push API; subscriptions stored in `push_subscriptions` table
- Permission prompt shown **only after first meaningful interaction** (not on landing)
- iOS-specific: install tutorial in onboarding step 4 walks user through Safari Share → Add to Home Screen → enable notifications
- Notifications used for: morning Mission Track reminder, Sunday recap prompt, Situation Room follow-up nudge
- **Never used for:** marketing, generic engagement, "we miss you"

### 5.5 Install prompt logic

1. On first mobile visit, do not show install prompt
2. After user completes any one of: first Mission, first Situation Room session, first Simulator run → trigger install prompt
3. iOS users see an animated overlay showing Safari Share → Add to Home Screen
4. Android/Chrome users see the native `beforeinstallprompt` flow
5. Dismissal stored in `localStorage` to avoid re-prompting; reset after 14 days

---

## 6. Content Authoring & Loading

Content lives in `content/` as Markdown and JSON files, version-controlled in git.

### 6.1 Scenario format

`content/scenarios/{role}/{slug}.json`:
```json
{
  "slug": "ba-hostile-lead-dev",
  "role": "ba",
  "title": "The Hostile Lead Dev",
  "one_liner": "You're facilitating your first requirements workshop. The lead dev does not want to be there.",
  "brief": "<full markdown brief with personas and setup>",
  "objective": "Capture the top 5 requirements without losing control of the room.",
  "curveball": "Marcus from compliance, silent so far, has a major concern about data residency that he hasn't raised. It surfaces around turn 6 if the user doesn't draw it out.",
  "personas": [
    { "name": "Sam Palmer", "role": "Senior Developer", "position": "This is a waste of time", "fear": "Being told to rewrite a system he just shipped", "monogram": "SP", "colour": "slate" },
    { "name": "Priya Rao", "role": "Business Sponsor", "position": "You tell me what you need to know", "fear": "Being seen as not knowing her own department", "monogram": "PR", "colour": "moss" },
    { "name": "Marcus Klein", "role": "Compliance Lead", "position": "Precise and cautious", "fear": "Regulatory exposure if compliance is skipped", "monogram": "MK", "colour": "ochre" }
  ],
  "rubric": {
    "green": [
      "Redirected Sam without dismissing him",
      "Used an open question to draw out Priya's actual frustration",
      "Surfaced the compliance question before it became an email"
    ],
    "yellow": [
      "Capitulated to Sam's framing in the first 3 turns",
      "Asked Priya 'what are the requirements' (closed question, low yield)",
      "Moved past Marcus's first interjection without acknowledgement"
    ],
    "red": [
      "Lost the room — Sam took over by turn 5",
      "Failed to surface compliance question at all",
      "Promised something specific that contradicts the curveball"
    ]
  },
  "estimated_minutes": 12,
  "difficulty": 2
}
```

A seed script (`scripts/seed-scenarios.ts`) reads these files and upserts into the `scenarios` table.

### 6.2 Playbook format

`content/playbooks/{role}/{slug}.json` with `empty_template_md` and `worked_examples` as markdown content.

### 6.3 Mission format

`content/missions/{role}/week-{N}/{seq}-{slug}.json`.

### 6.4 Coach prompt format

`content/coach-prompts/*.md` — versioned system prompt blocks. Loaded at request time, concatenated.

### 6.5 Seeding

`scripts/seed-content.ts` is the canonical loader. Runs:
1. Validation pass (every file matches the schema)
2. Upsert into Postgres
3. Mark `is_published = true` for files passing validation

Run on every deploy (via Vercel build hook), and locally via `pnpm seed`.

### 6.6 Content volume target at launch

Per PRD §5.0 and §6.6:
- 8–12 scenarios per role × 6 roles = ~60 scenarios
- **1 probation-specific scenario per role × 6 roles = 6 additional scenarios** ("The Probation Review" per role)
- ~8–10 playbooks per role × 6 roles = ~50 playbooks
- **1 Probation Prep Pack playbook (cross-role + 6 role-specific worked examples) = 1 + 6 worked examples**
- ~30–40 missions per role × 6 roles = ~200 missions
- **5 probation missions per role × 6 roles = 30 probation missions** (book 1:1, write self-assessment, assemble evidence, rehearse, pre-empt weakness)
- 1 Coach role-prompt per role + 3 Situation Room mode prompts + **1 Probation Coach voice block** + shared voice/safety blocks = ~12 prompt blocks

This is the critical-path content production load. Build prompts deliberately separate *engine* from *content*: the engine can ship at code-complete with stub content; production launch requires content-complete.

---

## 7. Authentication & Onboarding Flow

### 7.1 Signup

1. User visits `/register` → email + password OR Google OAuth
2. Supabase creates `auth.users` row
3. Trigger creates `public.users` row (without role — set later in onboarding)
4. Trigger creates `public.subscriptions` row with `tier = 'free'`
5. Trigger creates `public.user_context` row
6. Trigger creates `public.usage_limits` row
7. Redirect to `/onboarding/step-1`

### 7.2 Onboarding (4 steps per Design Brief)

`/onboarding/step-1` — Welcome screen, single CTA
`/onboarding/step-2` — Role selection (6 cards, select primary; secondary deferred to settings)
`/onboarding/step-3` — Start date, sector (optional), work setup
`/onboarding/step-4` — Memory introduction (declared facts shown, privacy commitments stated)

On step 4 completion:
- `users.primary_role` set
- `user_context` populated
- Initial `user_responsibilities` row created from any onboarding inputs that imply current responsibilities
- Redirect to `/home`

Onboarding can be resumed if abandoned (stored as URL state + DB completion flags).

### 7.3 Auth helpers

`lib/auth/server.ts`:
- `getCurrentUser()` — returns the authenticated user or null
- `requireAuth()` — throws if not authenticated; used in server actions
- `requirePro()` — throws if not on Pro tier
- `getTierAllowance(surface)` — returns the user's remaining allowance for a tier-gated surface

---

## 8. Joberlify Cross-Sell Integration (MVP scope)

Per the deferred decision, MVP includes **shared Supabase auth and a soft cross-sell prompt**, not deep product integration.

### 8.1 Shared Supabase project

Joberlify and FirstNinety share the same Supabase project. A user signing up to either gets a single `auth.users` row.

Implementation:
- Both apps point to the same `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Each app has its own application-level `users`, `subscriptions`, etc. tables — namespaced by table prefix or by schema (`firstninety.users`, `joberlify.users`)
- Common shared schema: `auth.*` (Supabase-managed)

### 8.2 Cross-sell prompt

In Joberlify, after a user marks a job as "offer accepted":
- A subtle inline banner appears in their next dashboard view: *"Just landed the job? FirstNinety helps you keep it. The first 90 days are the ones that matter most. → Set up your FirstNinety account in 30 seconds."*
- Clicking the link routes to FirstNinety's `/register?source=joberlify_offer_accepted&joberlify_user_id={uuid}`
- FirstNinety receives the `joberlify_user_id` in query string, links the new FirstNinety user row to the shared `auth.users` row, and short-circuits onboarding step 1 (welcome) with personalised copy: *"You're already signed up. Let's get you set up for what comes next."*

### 8.3 No deeper integration at MVP

Out of MVP scope:
- Joberlify pulling FirstNinety data into the job application UI
- FirstNinety reading Joberlify's CV / cover letter content
- Bundled pricing
- Shared in-product navigation

These are Phase 2A candidates if metrics justify them.

---

## 9. Phased Build Plan

The build is sequenced into **5 phases**, designed so each phase is independently shippable to a staging environment for review.

### Phase 0 — Setup (target: 2-3 days)

Foundations. No user-visible features yet.

- 0.1 Repository setup, Vercel project, env vars
- 0.2 Next.js 16 + TypeScript + Tailwind + shadcn/ui scaffold
- 0.3 Supabase project, auth configured, schema migrations applied
- 0.4 Design tokens as CSS variables in `globals.css`; Tailwind config extended
- 0.5 PWA shell — manifest, service worker stub, install prompt logic stub
- 0.6 Fonts loaded (Fraunces, Inter, Geist Mono)
- 0.7 PostHog initialised; cost-tracking stub in place
- 0.8 Marketing layout shell (header chrome only, no content)
- 0.9 App layout shell (sidebar nav, no content)

**Exit criteria:** auth works, design tokens render correctly on a stub page, PWA installs to home screen, PostHog events fire.

### Phase 1 — Foundations (target: 4-5 days)

Auth, onboarding, memory model, navigation. No AI yet.

- 1.1 Sign in / sign up surfaces
- 1.2 4-step onboarding flow (each step a route) — **including three-entry-state detection (State A/B/C) at step 3 per PRD v1.9 §7.1; backfill missed mission_completions as `skipped_pre_signup` for State B users; route State C users directly to post-Day-90 Daily Home on first login**
- 1.3 Role selection UI (6 cards, ink-on-paper hover)
- 1.4 Memory introduction screen (signature design moment 4 of 5)
- 1.5 Sidebar navigation + bottom nav (mobile)
- 1.6 Settings: "What FirstNinety knows about you" surface
- 1.7 Sunday "what's coming up?" prompt mechanism (cron + push + email)
- 1.8 Privacy controls: delete account, export data, edit memory

**Exit criteria:** a user can sign up, complete onboarding, see their declared memory, edit it, and delete their account.

### Phase 2 — Mission Track + Playbooks (target: 4-5 days)

The content surfaces. Still no AI.

- 2.1 Daily home page (Day 1 empty state + Day N populated state **+ State B mid-journey welcome variant per PRD v1.9 §7.1**)
- 2.2 Mission Track week view + mission detail view **(handle `skipped_pre_signup` mission state visually — quiet muted treatment, accessible-to-read but not blocking current week unlocks)**
- 2.3 Mission completion flow (state machine, reflection capture)
- 2.4 Playbook Library index
- 2.5 Playbook detail view with 2-column document + margin annotations
- 2.6 Mobile collapse: annotations become inline italic asides
- 2.7 Seed content for BA role at full depth (8 scenarios stubbed, 8 playbooks, 30 missions) — *content for other 5 roles in Phase 5*

**Exit criteria:** a BA user can complete missions, read playbooks, and see their week's structure. The product is usable as a content product without any AI.

### Phase 3 — AI Surfaces (target: 7-9 days, the heaviest phase)

The differentiated features.

- 3.1 Claude client wrapper + SSE streaming infrastructure
- 3.2 Cost tracking + tier enforcement
- 3.3 Safety guardrails + crisis surface
- 3.4 AI Coach engine + tool-calling (3 tools)
- 3.5 Coach conversation UI + thread list
- 3.6 Situation Room intake (signature design moment 2 of 5)
- 3.7 Situation Room: prep / is-this-normal / debrief modes
- 3.8 Situation Room: 3 response paths (read playbook / roleplay / talk it through)
- 3.9 Scenario Simulator brief screen (signature design moment 3 of 5)
- 3.10 Scenario Simulator: persona response engine
- 3.11 Scenario Simulator: scenario coordinator (Haiku) for end/curveball decisions
- 3.12 Scenario Simulator: debrief generation
- 3.13 Pre-flight content checks (PII, real-name, crisis keyword)
- 3.14 **Probation Mode surfaces:** activation flow, Daily Home banner state, fourth Situation Room entry type, fourth Coach tool (`get_probation_evidence`), Probation Prep Pack playbook surface, Probation Brief generator + PDF export, outcome capture + post-review Coach thread
- 3.15 **Coach post-90 priming:** conditional system prompt context variant (`current_day > 90`) loaded by the prompt-building function; voice and tools unchanged. Authored content file `content/coach-prompts/post-90-context.md` with the post-probation framing variant per role.
- 3.16 **Post-Day-90 Daily Home state:** third state of the Daily Home (alongside Day 1 empty + Day N populated) that activates when `current_day > 90`. Banner without week/mission, larger Situation Room input, "Recent" sidebar replacing "Week at a glance", small "Your Survival Report is always here →" link card. See PRD v1.9 §7.4.
- 3.17 **Probation Mode in standalone post-Day-90 context:** Probation Mode logic extended to work when there is no concurrent Mission Track (State C users with future probation, or post-Day-90 graduated users with extended probations). Per PRD v1.9 §6.6, when Probation Mode is active for a post-Day-90 user, the Probation banner replaces the standard post-Day-90 banner, probation missions become the daily missions, and the user gets the full Probation Mode experience. After review and outcome capture, the user returns to the standard post-Day-90 state. Build: extend Daily Home state selector to render Probation Mode banner above post-Day-90 layout when both conditions apply; verify Probation Brief generation works without Mission Track context (the Brief is drawn from situation sessions and Coach threads if no missions exist).

**Exit criteria:** all six product surfaces work end-to-end with seeded BA content **including the probation flow simulated against a test review date and a post-Day-90 user simulated by manually setting current_day to 95, AND a State C user simulated by setting start_date to 100 days ago**. Cost per Coach interaction is tracked. Tier gating denies free users at the right limits.

### Phase 4 — Payments + Cross-sell + Marketing (target: 3-4 days)

Revenue and growth surfaces.

- 4.1 Stripe Checkout integration (monthly + annual)
- 4.2 Stripe Customer Portal integration
- 4.3 Stripe webhook handler
- 4.4 Free → Pro upgrade flow with tier-gate UI
- 4.5 7-day free trial logic
- 4.6 Marketing landing page (B1 from design prompts)
- 4.7 AI Engineer dedicated landing page (B2)
- 4.8 Pricing page (B3)
- 4.9 Joberlify cross-sell auth integration (per §8)

**Exit criteria:** a user can subscribe, get charged, manage their subscription, and downgrade. The marketing surfaces are live at production URLs.

### Phase 5 — Content + Launch Readiness (target: 6-8 days, content-bound)

The critical path is content production for the remaining 5 roles.

- 5.1 Seed content for PM, SM, PO, DA, AIE roles — **including probation-specific scenario, probation missions, and Probation Prep Pack worked examples per role**
- 5.2 Quality review pass: every scenario, playbook, mission against SKILL.md §10 quality test
- 5.3 Email transactional templates (Resend): welcome, Sunday prompt, weekly recap, trial ending
- 5.4 PostHog dashboards configured (Day-30 Active Rate, Situation Room sessions/week, latency, cost-per-user)
- 5.5 Error pages, 404, 500, offline
- 5.6 Legal pages: Privacy Policy, Terms, DPIA summary, refund policy
- 5.7 Health checks + monitoring + alert thresholds
- 5.8 Pre-launch QA pass: every signature design moment hand-reviewed
- 5.9 Soft launch to founder's cousin's institute pilot users
- 5.10 Production launch readiness sign-off

**Exit criteria:** product is in production at firstninety.com (and firstninety.ai/ai-engineer), real users from the warm pilot are using it, monitoring is in place.

### Total estimated build time

**33–41 days** of focused engineering effort (revised from v1.2's 30–38 to reflect three-entry-state handling: +2 days in Phases 1-2 for onboarding and Daily Home variants, +1 day in Phase 3 for Probation Mode standalone context). This excludes content authoring time (which runs in parallel with Phases 1-3) and assumes a single engineer (Tokunbo). With parallelisable content production and design review, ship target is 7-9 weeks from build start to production launch.

---

## 10. Definition of Done — MVP Launch Criteria

The MVP ships to production only when **all** of these are true:

**Functional:**
- [ ] All six core features (Situation Room, Coach, Simulator, Playbook, Mission Track, Probation Prep Mode) work end-to-end
- [ ] All six roles have content at full depth (no "thin" labels) — including probation-specific scenario, missions, and Prep Pack per role
- [ ] Probation Brief generates correctly, exports as PDF, and is editable in-app
- [ ] Probation outcome capture works for all four outcome options, including "Prefer not to say"
- [ ] Probation Mode auto-deactivates on review date and triggers post-review Coach thread
- [ ] **Post-Day-90 Daily Home state renders correctly when `current_day > 90` (test by manually setting a user's start_date to 100 days ago)**
- [ ] **Coach post-90 priming variant loads correctly for users past Day 90 (verify in a test thread)**
- [ ] **State B (mid-journey within 90 days) signup tested — user signing up at Day 22 sees mid-journey welcome state, skipped weeks marked `skipped_pre_signup`, current week available**
- [ ] **State C (post-Day-90 at signup) signup tested — user with start_date 100 days ago lands directly into post-Day-90 Daily Home, no Survival Report link surfaced**
- [ ] **State C user with future probation date — Probation Mode activates correctly without curriculum overlay; Brief generates from situation sessions and Coach threads if no missions exist**
- [ ] Stripe Checkout and Portal both work in production
- [ ] PWA installs on iOS Safari and Chrome Android
- [ ] All AI surfaces stream responsively (P50 first-token < 2.5s)

**Quality:**
- [ ] No use of pure white or pure black anywhere in the UI
- [ ] No emoji or exclamation marks in product UI
- [ ] Premium checklist (Design Brief §12) passes on every key screen
- [ ] Five signature design moments (Design Brief §10) hand-reviewed and signed off

**Safety:**
- [ ] Safety guardrails active on every AI surface
- [ ] Crisis referral surface tested
- [ ] No real names captured anywhere in the system
- [ ] DPIA produced and on file
- [ ] Privacy Policy and Terms published

**Operations:**
- [ ] Cost-per-user dashboard live in PostHog
- [ ] Alert thresholds configured for cost runaway, AI errors, P95 latency
- [ ] Health checks passing
- [ ] Error pages render correctly

**Commercial:**
- [ ] Free tier limits enforced server-side
- [ ] Pro signup conversion path tested end-to-end
- [ ] Refund policy documented
- [ ] At least one bootcamp pilot conversation in flight (warm relationship)

---

## 11. Open Spec Questions (to resolve during build)

These remain unresolved from PRD §14 and need answers before the relevant build phase:

1. **Sunday prompt timing per user** (Phase 1) — store user's local timezone? Use IP-based default? Allow user override?
2. **Push permission timing** (Phase 1) — confirm "first meaningful interaction" trigger fires once and never re-prompts
3. **Stripe metadata for B2B2C** (Phase 4) — schema for linking institutional partner to user-level seats; institutional dashboard is Phase 2A but data model must support it from day one
4. **Soft launch user volume** (Phase 5) — how many pilot users from cousin's institute? Recommendation: 10-20 to start, expand once monitoring stable
5. **AI cost cap per user per month** (Phase 3) — hard ceiling for free tier ($1.50 ~ ?); soft warning ceiling for Pro tier ($15 ~ ?) — calibrate against actual usage in Phase 5
6. **Probation Mode timezone handling** (Phase 3.14) — `user_context.timezone` is captured but the Day 70 / T-21 trigger needs IP-fallback for users who haven't set it; confirm fallback policy
7. **Probation Brief regeneration policy** (Phase 3.14) — can the user regenerate the Brief multiple times before the review? Recommendation: yes, but cap at 3 generations to control cost (~$0.40 per generation at current Opus rates)
8. **Probation outcome capture window** (Phase 3.14) — how many days post-review do we prompt? Recommendation: prompt at +1 day, +3 days, +7 days, then stop. Outcome can always be added manually in Settings.
9. **Post-Day-90 cohort sizing** (Phase 5+) — at MVP launch, no users will reach Day 91 for ~3 months. The post-90 surface (3.16) is build-complete but operationally untested until then. Plan: manually fast-forward `current_day` for 3-5 pilot accounts in staging weekly during launch month to validate the post-90 state catches any rough edges before real users hit it. Document this as a launch operations item.
10. **State B Survival Report eligibility** (Phase 5) — should a State B user who signed up at Day 30 and reaches Day 90 inside the product receive a Survival Report? They have 60 days of FirstNinety data but no data for the first 30 days. **Recommendation:** yes, generate a Survival Report but include a small footnote acknowledging the start date in the document footer ("Based on your time with FirstNinety from [signup_date] onwards"). The Report still covers the first 90 days as a unit; the framing is honest about which portion FirstNinety helped with.
11. **State C user paths to Survival Report-equivalent artefact** (Phase 2A) — State C users have no Survival Report. If they end up using FirstNinety for a sustained period (e.g. 3+ months past signup), they might benefit from an equivalent end-of-period editorial document. Defer to Phase 2A as the "Day-365 Where you are" report idea (per PRD §13) — that document doesn't require a 90-day starting point and could serve State C users equivalently.

---

*End of MVP Spec v1.3*
