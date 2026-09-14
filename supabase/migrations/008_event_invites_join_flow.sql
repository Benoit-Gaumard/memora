-- Memora: wire up real, shareable invitation links + QR codes per event
-- Run this once in the Supabase SQL editor, after 007_photo_author_visibility.sql.
--
-- This replaces the old mock-data /join/[code] flow with real data: an event
-- organizer/creator can generate an invite code from /admin, and anyone who
-- opens the resulting link can see the event (without needing to already be
-- a member) and join it with one click once logged in.

-- ---------------------------------------------------------------------------
-- Let an event's creator, an organizer, or a super_admin create invite codes.
-- (No update/delete policy is added: codes are meant to be simple and
-- disposable; deactivating one is just a matter of not sharing it further.)
-- ---------------------------------------------------------------------------
drop policy if exists "event_invites_insert_owner_or_admin" on public.event_invites;
create policy "event_invites_insert_owner_or_admin" on public.event_invites
  for insert with check (
    created_by = auth.uid()
    and (
      exists (select 1 from public.events e where e.id = event_invites.event_id and e.created_by = auth.uid())
      or public.is_event_organizer(event_invites.event_id)
      or public.is_super_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- Look up an invite (and its event's public info) by code, for anyone -
-- including logged-out visitors who just scanned a QR code. security definer
-- so it bypasses the members-only RLS on events/event_invites; only a small,
-- non-sensitive set of columns is exposed.
-- ---------------------------------------------------------------------------
create or replace function public.get_invite_details(p_code text)
returns table (
  invite_id uuid,
  event_id uuid,
  event_name text,
  event_slug text,
  event_description text,
  event_date timestamptz,
  cover_image_path text,
  is_active boolean,
  expires_at timestamptz,
  max_uses int,
  current_uses int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    i.id, e.id, e.name, e.slug, e.description, e.event_date, e.cover_image_path,
    i.is_active, i.expires_at, i.max_uses, i.current_uses
  from public.event_invites i
  join public.events e on e.id = i.event_id
  where lower(i.code) = lower(p_code)
  limit 1;
$$;

grant execute on function public.get_invite_details(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Redeem an invite for the currently authenticated user: validates the code
-- (active, not expired, under its usage limit), adds the membership (or does
-- nothing if already a member), bumps the usage counter, and returns the
-- event's slug so the client can redirect straight to the gallery.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_event_invite(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.event_invites%rowtype;
  v_event_slug text;
  v_already_member boolean;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté pour rejoindre un événement.';
  end if;

  select * into v_invite from public.event_invites where lower(code) = lower(p_code) limit 1;

  if v_invite.id is null or not v_invite.is_active then
    raise exception 'Ce lien d''invitation n''est plus valide.';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'Ce lien d''invitation a expiré.';
  end if;

  if v_invite.max_uses is not null and v_invite.current_uses >= v_invite.max_uses then
    raise exception 'Ce lien d''invitation a atteint son nombre maximum d''utilisations.';
  end if;

  select exists (
    select 1 from public.event_members
    where event_id = v_invite.event_id and user_id = auth.uid()
  ) into v_already_member;

  if not v_already_member then
    insert into public.event_members (event_id, user_id, role, status, joined_via, invite_id)
    values (
      v_invite.event_id,
      auth.uid(),
      'participant',
      case when v_invite.approval_required then 'pending' else 'active' end,
      'invite',
      v_invite.id
    );

    update public.event_invites
    set current_uses = current_uses + 1
    where id = v_invite.id;
  end if;

  select slug into v_event_slug from public.events where id = v_invite.event_id;
  return v_event_slug;
end;
$$;

grant execute on function public.redeem_event_invite(text) to authenticated;
