-- ============================================================================
-- FirstNinety — Initial schema
-- Source of truth: MVP Spec v1.2 §2 (Database Schema)
-- ============================================================================
-- Order:
--   1. Extensions
--   2. Enums (11)
--   3. Tables (16) with indexes
--   4. Triggers: set_updated_at + usage increment functions
--   5. RLS enabled on every table
--   6. Policies: standard user CRUD, read-only content, service-role-only writes
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Enums  (§2.2 – §2.6)
-- ----------------------------------------------------------------------------

create type role_enum as enum ('ba', 'pm', 'sm', 'po', 'da', 'aie');

create type subscription_status_enum as enum (
  'free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

create type tier_enum as enum ('free', 'pro');

create type memory_source_enum as enum (
  'onboarding', 'sunday_prompt', 'coach_inferred', 'user_manual'
);

create type work_setup_enum as enum ('remote', 'hybrid', 'office');

create type mission_status_enum as enum ('in_progress', 'completed', 'skipped');

create type scenario_run_status_enum as enum ('active', 'completed', 'abandoned');

create type situation_entry_type_enum as enum ('prep', 'is_this_normal', 'debrief');

create type coach_message_role_enum as enum ('user', 'assistant', 'tool', 'system');

create type probation_outcome_enum as enum (
  'continued', 'extended', 'ended', 'prefer_not_to_say'
);

create type probation_artefact_type_enum as enum (
  'brief', 'self_assessment', 'evidence_portfolio', 'pre_review_agenda'
);

-- ----------------------------------------------------------------------------
-- 2. Tables — Core  (§2.2)
-- ----------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  primary_role role_enum not null,
  secondary_role role_enum,
  signup_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create unique index subscriptions_user_id_unique on public.subscriptions(user_id);

-- ----------------------------------------------------------------------------
-- 3. Tables — User context  (§2.3)
-- ----------------------------------------------------------------------------

create table public.user_responsibilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  description text not null,
  source memory_source_enum not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_responsibilities_user_current
  on public.user_responsibilities(user_id, is_current);

create table public.user_context (
  user_id uuid primary key references public.users(id) on delete cascade,
  start_date date,
  sector text,
  work_setup work_setup_enum,
  current_week integer not null default 1,
  current_day integer not null default 1,
  focus_areas text[],
  last_sunday_prompt_at timestamptz,
  probation_review_date date,
  probation_mode_active boolean not null default false,
  probation_window_days integer not null default 21,
  probation_brief_generated_at timestamptz,
  probation_outcome probation_outcome_enum,
  probation_outcome_captured_at timestamptz,
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint probation_window_in_range check (probation_window_days between 7 and 90)
);

-- ----------------------------------------------------------------------------
-- 4. Tables — Content (shared, not user-owned)  (§2.4)
-- ----------------------------------------------------------------------------

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  role role_enum not null,
  title text not null,
  one_liner text not null,
  brief text not null,
  objective text not null,
  curveball text not null,
  personas jsonb not null,
  rubric jsonb not null,
  estimated_minutes integer not null default 12,
  difficulty integer not null default 2,
  career_stage text not null default 'first_90_days',
  is_published boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenarios_role_published on public.scenarios(role, is_published);

create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  role role_enum not null,
  artefact_type text not null,
  title text not null,
  variant text,
  description text not null,
  empty_template_md text not null,
  worked_examples jsonb not null,
  common_mistakes text[] not null,
  variant_patterns text[],
  related_scenarios text[],
  career_stage text not null default 'first_90_days',
  is_published boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index playbooks_role_published on public.playbooks(role, is_published);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  role role_enum not null,
  week integer not null,
  sequence_in_week integer not null,
  title text not null,
  why_matters text not null,
  steps text[] not null,
  resource_refs jsonb,
  success_criteria text not null,
  reflection_prompt text not null,
  estimated_minutes integer not null,
  prerequisites text[],
  career_stage text not null default 'first_90_days',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index missions_role_week_seq
  on public.missions(role, week, sequence_in_week);

-- ----------------------------------------------------------------------------
-- 5. Tables — User activity  (§2.5)
-- ----------------------------------------------------------------------------

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

create unique index mission_completions_user_mission
  on public.mission_completions(user_id, mission_id);

create table public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id),
  transcript jsonb not null default '[]',
  status scenario_run_status_enum not null default 'active',
  debrief jsonb,
  outcome text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenario_runs_user_status on public.scenario_runs(user_id, status);

create table public.situation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_type situation_entry_type_enum not null,
  situation_summary text not null,
  transcript jsonb not null default '[]',
  related_playbook_ids uuid[],
  related_scenario_id uuid references public.scenarios(id),
  flagged_for_safety boolean not null default false,
  safety_referral_shown boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index situation_sessions_user_created
  on public.situation_sessions(user_id, created_at desc);

create table public.coach_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_title text not null,
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
  tool_calls jsonb,
  cost_usd numeric(10,6),
  input_tokens integer,
  output_tokens integer,
  model text,
  created_at timestamptz not null default now()
);

create index coach_messages_thread on public.coach_messages(thread_id, created_at);

-- ----------------------------------------------------------------------------
-- 6. Tables — Tracking & operational  (§2.6)
-- ----------------------------------------------------------------------------

create table public.ai_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  surface text not null,
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  cost_usd numeric(10,6) not null,
  latency_ms integer,
  tool_calls_count integer default 0,
  error text,
  created_at timestamptz not null default now()
);

create index ai_calls_user_surface_created
  on public.ai_calls(user_id, surface, created_at desc);

create table public.usage_limits (
  user_id uuid primary key references public.users(id) on delete cascade,
  simulator_runs_lifetime integer not null default 0,
  situation_sessions_week integer not null default 0,
  coach_messages_week integer not null default 0,
  week_reset_at timestamptz not null default date_trunc('week', now() + interval '1 week'),
  updated_at timestamptz not null default now()
);

create table public.probation_artefacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  artefact_type probation_artefact_type_enum not null,
  content jsonb not null,
  is_current boolean not null default true,
  generated_at timestamptz not null default now(),
  exported_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index probation_artefacts_user_type_current
  on public.probation_artefacts(user_id, artefact_type, is_current);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index push_subscriptions_user_endpoint
  on public.push_subscriptions(user_id, endpoint);

-- ----------------------------------------------------------------------------
-- 7. Trigger functions  (§2.7)
-- ----------------------------------------------------------------------------

-- set_updated_at — generic timestamp keeper, applied to every table that has
-- an updated_at column. ai_calls / push_subscriptions are excluded because
-- their rows are append-only.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at_users
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger set_updated_at_subscriptions
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger set_updated_at_user_responsibilities
  before update on public.user_responsibilities
  for each row execute function public.set_updated_at();

create trigger set_updated_at_user_context
  before update on public.user_context
  for each row execute function public.set_updated_at();

create trigger set_updated_at_scenarios
  before update on public.scenarios
  for each row execute function public.set_updated_at();

create trigger set_updated_at_playbooks
  before update on public.playbooks
  for each row execute function public.set_updated_at();

create trigger set_updated_at_missions
  before update on public.missions
  for each row execute function public.set_updated_at();

create trigger set_updated_at_mission_completions
  before update on public.mission_completions
  for each row execute function public.set_updated_at();

create trigger set_updated_at_scenario_runs
  before update on public.scenario_runs
  for each row execute function public.set_updated_at();

create trigger set_updated_at_situation_sessions
  before update on public.situation_sessions
  for each row execute function public.set_updated_at();

create trigger set_updated_at_coach_threads
  before update on public.coach_threads
  for each row execute function public.set_updated_at();

create trigger set_updated_at_usage_limits
  before update on public.usage_limits
  for each row execute function public.set_updated_at();

create trigger set_updated_at_probation_artefacts
  before update on public.probation_artefacts
  for each row execute function public.set_updated_at();

-- increment_usage_simulator — fires on scenario_runs insert.
-- Lifetime counter, so always increments.

create or replace function public.increment_usage_simulator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_limits (user_id, simulator_runs_lifetime)
    values (new.user_id, 1)
  on conflict (user_id) do update
    set simulator_runs_lifetime = public.usage_limits.simulator_runs_lifetime + 1,
        updated_at = now();
  return new;
end;
$$;

create trigger increment_usage_simulator
  after insert on public.scenario_runs
  for each row execute function public.increment_usage_simulator();

-- increment_usage_situation — fires on situation_sessions insert.

create or replace function public.increment_usage_situation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_limits (user_id, situation_sessions_week)
    values (new.user_id, 1)
  on conflict (user_id) do update
    set situation_sessions_week = public.usage_limits.situation_sessions_week + 1,
        updated_at = now();
  return new;
end;
$$;

create trigger increment_usage_situation
  after insert on public.situation_sessions
  for each row execute function public.increment_usage_situation();

-- increment_usage_coach — fires on coach_messages insert.
-- Only counts user-role messages (the assistant's replies don't count toward
-- the user's weekly limit). MVP Spec §2.7 specifies "ad-hoc Coach threads
-- only" — in MVP, coach_threads are ad-hoc by construction (Situation Room
-- and Simulator have their own session tables), so role='user' is sufficient.

create or replace function public.increment_usage_coach()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> 'user' then
    return new;
  end if;
  insert into public.usage_limits (user_id, coach_messages_week)
    values (new.user_id, 1)
  on conflict (user_id) do update
    set coach_messages_week = public.usage_limits.coach_messages_week + 1,
        updated_at = now();
  return new;
end;
$$;

create trigger increment_usage_coach
  after insert on public.coach_messages
  for each row execute function public.increment_usage_coach();

-- ----------------------------------------------------------------------------
-- 8. Row-Level Security  (§2.8)
-- ----------------------------------------------------------------------------
-- RLS is enabled on every public table. Default-deny: anything not granted
-- by a policy is rejected. service_role bypasses RLS entirely; this is the
-- mechanism for server-side writes to subscriptions / ai_calls / usage_limits.

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_responsibilities enable row level security;
alter table public.user_context enable row level security;
alter table public.scenarios enable row level security;
alter table public.playbooks enable row level security;
alter table public.missions enable row level security;
alter table public.mission_completions enable row level security;
alter table public.scenario_runs enable row level security;
alter table public.situation_sessions enable row level security;
alter table public.coach_threads enable row level security;
alter table public.coach_messages enable row level security;
alter table public.ai_calls enable row level security;
alter table public.usage_limits enable row level security;
alter table public.probation_artefacts enable row level security;
alter table public.push_subscriptions enable row level security;

-- users — owners can see and update their own row. Inserts happen via the
-- signup trigger (added in 00002); deletes cascade from auth.users.
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- subscriptions — read-only for the owner. Writes are service-role only.
create policy "users_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- user_responsibilities — full CRUD by owner.
create policy "users_select_own" on public.user_responsibilities
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.user_responsibilities
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.user_responsibilities
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.user_responsibilities
  for delete using (auth.uid() = user_id);

-- user_context — full CRUD by owner.
create policy "users_select_own" on public.user_context
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.user_context
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.user_context
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.user_context
  for delete using (auth.uid() = user_id);

-- Content tables — published rows readable by any authenticated user. No
-- user-side writes.
create policy "content_select_published" on public.scenarios
  for select using (auth.role() = 'authenticated' and is_published = true);

create policy "content_select_published" on public.playbooks
  for select using (auth.role() = 'authenticated' and is_published = true);

create policy "content_select_published" on public.missions
  for select using (auth.role() = 'authenticated' and is_published = true);

-- mission_completions, scenario_runs, situation_sessions, coach_threads,
-- coach_messages, probation_artefacts, push_subscriptions — full owner CRUD.
create policy "users_select_own" on public.mission_completions
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.mission_completions
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.mission_completions
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.mission_completions
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.scenario_runs
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.scenario_runs
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.scenario_runs
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.scenario_runs
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.situation_sessions
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.situation_sessions
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.situation_sessions
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.situation_sessions
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.coach_threads
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.coach_threads
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.coach_threads
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.coach_threads
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.coach_messages
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.coach_messages
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.coach_messages
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.coach_messages
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.probation_artefacts
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.probation_artefacts
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.probation_artefacts
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.probation_artefacts
  for delete using (auth.uid() = user_id);

create policy "users_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "users_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "users_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id);
create policy "users_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- ai_calls, usage_limits — owner can SELECT only. service_role writes.
create policy "users_select_own" on public.ai_calls
  for select using (auth.uid() = user_id);

create policy "users_select_own" on public.usage_limits
  for select using (auth.uid() = user_id);
