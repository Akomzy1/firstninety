-- 00007_probation_entry_type.sql
--
-- Prompt 3.14 — add `probation` to situation_entry_type_enum so the
-- Situation Room can route a fourth intake type ("This is about my
-- probation") with its own system prompt overlay.
--
-- Postgres enum additions are non-destructive but require `alter type
-- ... add value`, which must run outside a transaction. The Supabase
-- migration runner handles that for us.
--
-- After applying, regenerate types: `npm run db:types`.

alter type public.situation_entry_type_enum add value if not exists 'probation';

comment on type public.situation_entry_type_enum is
  'Situation Room intake category. Per PRD §6.6 / SKILL §5.4 the fourth value `probation` is only surfaced in the UI when user_context.probation_mode_active is true.';
