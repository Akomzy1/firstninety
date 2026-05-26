-- 00009_v1_3_entry_state.sql
--
-- MVP Spec v1.3 retrofit — three-entry-state model.
--
-- Three additions, plus an enum extension:
--
-- 1. `entry_state_enum` ('A' | 'B' | 'C') — the persisted version of the
--    State A / B / C distinction computed at signup. State A = fresh
--    start (<= 3 days), State B = mid-journey within 90 days, State C =
--    joined post-Day-90. See MVP Spec v1.3 §3 / PRD v1.9 §7.1.
--
-- 2. `user_context.entry_state` — defaults to 'A' for any existing rows
--    (they predate this distinction and were treated as State A in
--    practice). Computed by `completeOnboarding` going forward.
--
-- 3. `user_context.viewed_mid_journey_welcome_at` — gate for the
--    one-time State B mid-journey welcome card on the Daily Home (per
--    MVP Spec v1.3 §9). Null = not yet seen. Mirrors the structure of
--    `viewed_post_90_home_at` added in migration 00008.
--
-- 4. `mission_status_enum += 'skipped_pre_signup'` — distinguishes
--    "skipped because the user wasn't here yet" (system-skipped, no
--    judgement) from "skipped by user choice". State B users get
--    `mission_completions` rows backfilled with this value for all
--    pre-signup weeks.
--
-- The enum extension MUST be the last statement in the file. Postgres
-- enforces that a new enum value can't be referenced inside the same
-- transaction it was added in. This migration only declares the new
-- value; the first code path that uses it (the State B backfill in
-- `completeOnboardingAction`) runs in a later request, after the
-- migration has committed.
--
-- After applying, regenerate types: `npm run db:types` (or hand-patch
-- `lib/db/types.gen.ts` if Docker isn't available — same workflow as
-- migrations 00006-00008).

-- 1. Entry state enum
create type entry_state_enum as enum ('A', 'B', 'C');

-- 2. entry_state column on user_context
alter table public.user_context
  add column if not exists entry_state entry_state_enum not null default 'A';

-- 3. viewed_mid_journey_welcome_at column
alter table public.user_context
  add column if not exists viewed_mid_journey_welcome_at timestamptz;

comment on column public.user_context.entry_state is
  'A=fresh start (start_date <= 3 days ago); B=mid-journey within 90 days; C=joined post-Day-90. Computed by completeOnboarding from start_date.';

comment on column public.user_context.viewed_mid_journey_welcome_at is
  'Set the first time a State B user lands on the Daily Home. Gates the one-time "About the weeks you lived through" welcome card.';

-- 4. mission_status_enum += 'skipped_pre_signup'
-- Must be the last statement; new enum values can't be used in the
-- same transaction they're declared in.
alter type mission_status_enum add value if not exists 'skipped_pre_signup';
