-- Memora: admin visibility + real photo uploads
-- Run this once in the Supabase SQL editor, after 001_initial_schema.sql.

-- ---------------------------------------------------------------------------
-- Helper: is the current user a super_admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and global_role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Let super_admins read (and manage) everything, on top of the existing
-- self-scoped policies from 001_initial_schema.sql.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_super_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_super_admin());

drop policy if exists "events_select_admin" on public.events;
create policy "events_select_admin" on public.events
  for select using (public.is_super_admin());

drop policy if exists "event_members_select_admin" on public.event_members;
create policy "event_members_select_admin" on public.event_members
  for select using (public.is_super_admin());

drop policy if exists "photos_select_admin" on public.photos;
create policy "photos_select_admin" on public.photos
  for select using (public.is_super_admin());

drop policy if exists "event_invites_select_admin" on public.event_invites;
create policy "event_invites_select_admin" on public.event_invites
  for select using (public.is_super_admin());

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- event_members: allow an event's creator (or a super_admin) to add members,
-- e.g. auto-adding themselves as organizer right after creating an event.
-- ---------------------------------------------------------------------------
drop policy if exists "event_members_insert_owner_or_admin" on public.event_members;
create policy "event_members_insert_owner_or_admin" on public.event_members
  for insert with check (
    user_id = auth.uid()
    or public.is_super_admin()
    or exists (
      select 1 from public.events e
      where e.id = event_members.event_id and e.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: a single private bucket holding photos for every event, organised
-- as event_id/filename. Access is controlled by RLS below, scoped to active
-- members of that event (or super_admins).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', false)
on conflict (id) do update
set public = false;

drop policy if exists "event_photos_select_members" on storage.objects;
create policy "event_photos_select_members" on storage.objects
  for select using (
    bucket_id = 'event-photos'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.event_members m
        where m.event_id::text = (storage.foldername(name))[1]
          and m.user_id = auth.uid()
          and m.status = 'active'
      )
    )
  );

drop policy if exists "event_photos_insert_members" on storage.objects;
create policy "event_photos_insert_members" on storage.objects
  for insert with check (
    bucket_id = 'event-photos'
    and exists (
      select 1 from public.event_members m
      where m.event_id::text = (storage.foldername(name))[1]
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

drop policy if exists "event_photos_delete_owner_or_admin" on storage.objects;
create policy "event_photos_delete_owner_or_admin" on storage.objects
  for delete using (
    bucket_id = 'event-photos'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.photos p
        where p.storage_original_path = storage.objects.name and p.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- photos: the uploader (or a super_admin) can delete their own photo row.
-- ---------------------------------------------------------------------------
drop policy if exists "photos_delete_owner_or_admin" on public.photos;
create policy "photos_delete_owner_or_admin" on public.photos
  for delete using (user_id = auth.uid() or public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Bootstrap: promote yourself to super_admin so you can access /admin.
-- Replace the email below with your own account's email, then run this
-- statement once in the SQL editor.
-- ---------------------------------------------------------------------------
-- update public.profiles set global_role = 'super_admin' where email = 'you@example.com';
