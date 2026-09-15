-- Memora: gestion de son propre compte depuis /profile.
-- Run this once in the Supabase SQL editor, after 010_photo_reactions.sql.
--
-- Le changement de mot de passe passe par l'API Auth de Supabase et ne demande
-- aucune migration. La suppression de compte, elle, doit toucher auth.users :
-- elle est donc exposée via cette fonction `security definer`, qui n'agit que
-- sur l'utilisateur appelant.
--
-- Garde-fou : quelqu'un qui organise encore des albums ne peut pas supprimer
-- son compte. Il doit d'abord supprimer ces albums (ou en confier
-- l'organisation à quelqu'un d'autre), sinon leurs invités perdraient l'accès
-- aux photos sans prévenir.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owned_events int;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select count(*) into v_owned_events
  from public.events e
  where e.created_by = v_uid
    and e.deleted_at is null;

  if v_owned_events > 0 then
    raise exception 'OWNS_EVENTS:%', v_owned_events;
  end if;

  -- Contributions de l'utilisateur dans les albums des autres.
  delete from public.photo_reactions where user_id = v_uid;
  delete from public.photo_comments where user_id = v_uid;
  delete from public.photos where user_id = v_uid;

  -- Références résiduelles vers le profil : aucune n'est en ON DELETE CASCADE,
  -- il faut donc les solder avant de retirer la ligne auth.
  update public.photos set deleted_by = null where deleted_by = v_uid;
  delete from public.event_invites where created_by = v_uid;
  delete from public.event_members where user_id = v_uid;
  delete from public.audit_logs where actor_user_id = v_uid;

  -- public.profiles part en cascade avec auth.users.
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
