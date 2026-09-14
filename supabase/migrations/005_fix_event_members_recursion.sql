-- Memora: fix "infinite recursion detected in policy for relation event_members"
-- Run this once in the Supabase SQL editor, after 004_event_members_delete.sql.
--
-- Root cause: the "event_members_select_same_event" policy queried the
-- event_members table from within its own policy definition. Postgres has to
-- re-apply that same RLS policy to evaluate the inner subquery, which
-- contains the same subquery again, looping forever.
--
-- Fix: move the membership check into a `security definer` helper function
-- (same pattern as `is_super_admin`). Functions like this run with the
-- privileges of their owner, which bypasses row-level security entirely, so
-- the inner lookup no longer re-triggers the policy that calls it.

create or replace function public.is_active_event_member(p_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.event_members
    where event_id = p_event_id and user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_event_organizer(p_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.event_members
    where event_id = p_event_id and user_id = auth.uid() and role = 'organizer'
  );
$$;

-- ---------------------------------------------------------------------------
-- Re-create every policy that used to subquery event_members directly, using
-- the bypassing functions above instead.
-- ---------------------------------------------------------------------------
drop policy if exists "event_members_select_same_event" on public.event_members;
create policy "event_members_select_same_event" on public.event_members
  for select using (
    user_id = auth.uid()
    or public.is_active_event_member(event_id)
  );

drop policy if exists "events_select_members" on public.events;
create policy "events_select_members" on public.events
  for select using (
    created_by = auth.uid()
    or public.is_active_event_member(id)
  );

drop policy if exists "photos_select_members" on public.photos;
create policy "photos_select_members" on public.photos
  for select using (public.is_active_event_member(event_id));

drop policy if exists "photos_insert_members" on public.photos;
create policy "photos_insert_members" on public.photos
  for insert with check (
    user_id = auth.uid()
    and public.is_active_event_member(event_id)
  );

drop policy if exists "event_invites_select_organizer" on public.event_invites;
create policy "event_invites_select_organizer" on public.event_invites
  for select using (
    created_by = auth.uid()
    or public.is_event_organizer(event_id)
  );

-- Storage: same fix for the private event-photos bucket.
drop policy if exists "event_photos_select_members" on storage.objects;
create policy "event_photos_select_members" on storage.objects
  for select using (
    bucket_id = 'event-photos'
    and (
      public.is_super_admin()
      or public.is_active_event_member(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "event_photos_insert_members" on storage.objects;
create policy "event_photos_insert_members" on storage.objects
  for insert with check (
    bucket_id = 'event-photos'
    and public.is_active_event_member(((storage.foldername(name))[1])::uuid)
  );
