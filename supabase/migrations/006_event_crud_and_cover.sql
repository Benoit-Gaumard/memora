-- Memora: full CRUD for events from /admin (edit, delete, change cover photo)
-- Run this once in the Supabase SQL editor, after 005_fix_event_members_recursion.sql.

-- Allow a super_admin to update any event (previously: creator only).
drop policy if exists "events_update_owner" on public.events;
create policy "events_update_owner_or_admin" on public.events
  for update using (created_by = auth.uid() or public.is_super_admin());

-- Allow the creator or a super_admin to delete an event. Deleting cascades to
-- event_members, photos and event_invites rows (declared ON DELETE CASCADE
-- in 001_initial_schema.sql) but NOT to the underlying storage files, which
-- must be removed separately by the app before/after this delete.
drop policy if exists "events_delete_owner_or_admin" on public.events;
create policy "events_delete_owner_or_admin" on public.events
  for delete using (created_by = auth.uid() or public.is_super_admin());

-- Let a super_admin upload/replace/delete storage objects (photos, cover
-- images) even for events they are not personally a member of.
drop policy if exists "event_photos_insert_members" on storage.objects;
create policy "event_photos_insert_members" on storage.objects
  for insert with check (
    bucket_id = 'event-photos'
    and (
      public.is_super_admin()
      or public.is_active_event_member(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "event_photos_update_owner_or_admin" on storage.objects;
create policy "event_photos_update_owner_or_admin" on storage.objects
  for update using (
    bucket_id = 'event-photos'
    and (
      public.is_super_admin()
      or public.is_active_event_member(((storage.foldername(name))[1])::uuid)
    )
  );
