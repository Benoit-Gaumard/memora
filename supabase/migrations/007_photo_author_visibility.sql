-- Memora: let members of an event see each other's basic profile info,
-- so a photo's "posted by" author name can be displayed (instead of the
-- profile row being silently hidden by RLS and falling back to "Membre").
-- Run this once in the Supabase SQL editor, after 006_event_crud_and_cover.sql.

-- ---------------------------------------------------------------------------
-- Helper: does the current user share at least one active event membership
-- with the given profile? security definer so it can read event_members
-- without re-triggering RLS recursion.
-- ---------------------------------------------------------------------------
create or replace function public.shares_active_event_with(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.event_members mine
    join public.event_members theirs
      on theirs.event_id = mine.event_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = p_user_id
      and theirs.status = 'active'
  );
$$;

drop policy if exists "profiles_select_event_members" on public.profiles;
create policy "profiles_select_event_members" on public.profiles
  for select using (public.shares_active_event_with(id));
