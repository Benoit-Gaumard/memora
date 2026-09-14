-- Memora: allow removing event members (admin / event creator)
-- Run this once in the Supabase SQL editor, after 003_login_by_username.sql.

drop policy if exists "event_members_delete_owner_or_admin" on public.event_members;
create policy "event_members_delete_owner_or_admin" on public.event_members
  for delete using (
    public.is_super_admin()
    or exists (
      select 1 from public.events e
      where e.id = event_members.event_id and e.created_by = auth.uid()
    )
  );
