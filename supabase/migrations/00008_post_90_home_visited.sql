-- 00008_post_90_home_visited.sql
--
-- Prompt 3.16 — Post-Day-90 Daily Home state.
--
-- Track when the user first lands on the post-Day-90 Daily Home so we
-- can show the one-time "What changed?" callout per PRD v1.8 §7.4 and
-- Design Prompts v2.0 C16. After this timestamp is stamped, subsequent
-- visits show the standard post-90 state without the callout.
--
-- After applying, regenerate types: `npm run db:types`.

alter table public.user_context
  add column if not exists viewed_post_90_home_at timestamptz;

comment on column public.user_context.viewed_post_90_home_at is
  'Set the first time the user lands on the post-Day-90 Daily Home (current_day > 90). Used to gate the one-time "What changed?" callout. Null = not yet seen.';
