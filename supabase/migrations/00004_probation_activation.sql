-- ============================================================================
-- FirstNinety — Probation activation infrastructure
-- Build Prompt 1.8. The actual Probation Mode UI surfaces (banner, Brief,
-- fourth Situation entry) ship in Prompt 3.14; this migration is the
-- plumbing the activation cron needs.
-- ============================================================================

alter table public.user_context
  add column probation_activation_prompted_at timestamptz;

comment on column public.user_context.probation_activation_prompted_at is
  'Set by the daily probation-activation cron when we first nudge a user '
  'within the probation_window_days of their review date.';

-- Speed up the cron's nightly scan over candidates.
create index user_context_probation_pending
  on public.user_context (probation_review_date, probation_mode_active)
  where probation_review_date is not null;
