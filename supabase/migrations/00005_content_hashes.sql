-- ============================================================================
-- FirstNinety — Content hash columns
-- Build Prompt 2.1. scripts/seed-content compares the on-disk content hash
-- against the row's stored hash and only upserts when they diverge. Keeps
-- seed runs idempotent and stops updated_at thrash on every deploy.
-- ============================================================================

alter table public.scenarios add column content_hash text;
alter table public.playbooks add column content_hash text;
alter table public.missions add column content_hash text;
