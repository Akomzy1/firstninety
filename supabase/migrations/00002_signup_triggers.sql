-- ============================================================================
-- FirstNinety — Signup triggers
-- Build Prompt 1.1. On Supabase auth.users insert, create the matching app
-- rows in public.users + subscriptions + user_context + usage_limits so the
-- post-signup flow has somewhere to write to. The role is set later in
-- onboarding step 2, so this migration also relaxes users.primary_role to
-- allow NULL on insert.
-- ============================================================================

alter table public.users
  alter column primary_role drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, signup_source)
    values (new.id, new.email, new.raw_user_meta_data->>'signup_source');

  insert into public.subscriptions (user_id, tier, status)
    values (new.id, 'free', 'free');

  insert into public.user_context (user_id)
    values (new.id);

  insert into public.usage_limits (user_id)
    values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow the trigger function to run; auth.users belongs to the supabase_auth
-- role so we grant minimal exposure.
grant usage on schema public to supabase_auth_admin;
