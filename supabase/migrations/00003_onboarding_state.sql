-- ============================================================================
-- FirstNinety — Onboarding completion state
-- Build Prompt 1.2. Users mid-onboarding bounce back to their last incomplete
-- step until onboarding_completed_at is set on step 4 submission.
-- ============================================================================

alter table public.users
  add column onboarding_completed_at timestamptz;

comment on column public.users.onboarding_completed_at is
  'Set when the user finishes onboarding step 4. Null = still in onboarding.';

create index users_onboarding_incomplete
  on public.users (id)
  where onboarding_completed_at is null;
