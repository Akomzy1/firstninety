-- 00006_safety_flag.sql
--
-- Prompt 3.12 — wire pre-flight safety checks consistently across AI
-- surfaces.
--
-- Two non-destructive additions:
--
-- 1. `coach_threads.flagged_for_safety` (boolean, default false)
--    Mirrors `situation_sessions.flagged_for_safety` from the initial
--    schema. Set true when the streaming endpoint's `runPreFlightChecks`
--    matches a crisis category for any turn on the thread. The Coach
--    conversation view re-renders the CrisisReferral component on
--    subsequent visits when this flag is set.
--
-- 2. `user_context.disable_real_name_advisory` (boolean, default false)
--    Per PRD §9.6 / SKILL §5 — some sectors use anonymised proper
--    names that look like real names; respect the user's judgement and
--    let them opt out of the soft real-name advisory. PII and crisis
--    checks remain mandatory and are not disableable.
--
-- After applying, regenerate types: `npm run db:types`.

alter table public.coach_threads
  add column if not exists flagged_for_safety boolean not null default false;

alter table public.user_context
  add column if not exists disable_real_name_advisory boolean not null default false;

comment on column public.coach_threads.flagged_for_safety is
  'Set true when pre-flight safety checks fire a crisis category for any turn on the thread. Renders CrisisReferral on thread reload.';

comment on column public.user_context.disable_real_name_advisory is
  'Per-user opt-out of the soft real-name advisory in Coach / Situation Room / Simulator. PII and crisis checks remain mandatory.';
