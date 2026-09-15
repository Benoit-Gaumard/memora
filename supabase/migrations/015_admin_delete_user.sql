-- Memora: un administrateur peut supprimer définitivement un compte.
-- Run this once in the Supabase SQL editor, after 014_event_end_date.sql.
--
-- Bloquer un compte est réversible et suffit dans la plupart des cas. La
-- suppression, elle, touche auth.users : elle passe donc par une fonction
-- `security definer`, seul endroit où les garde-fous peuvent être garantis
-- quelle que soit l'interface appelante.
--
-- La séquence de nettoyage est désormais partagée avec `delete_own_account`
-- (migration 011) : une seule définition, donc aucun risque que les deux
-- chemins divergent et laissent des lignes orphelines derrière eux.

-- ---------------------------------------------------------------------------
-- Purge des données d'un compte. Interne : aucun grant, elle n'est atteignable
-- que depuis les fonctions `security definer` ci-dessous.
-- ---------------------------------------------------------------------------
create or replace function public.purge_user_rows(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Contributions de l'utilisateur dans les albums des autres.
  delete from public.photo_reactions where user_id = p_user_id;
  delete from public.photo_comments where user_id = p_user_id;
  delete from public.photos where user_id = p_user_id;

  -- Références résiduelles vers le profil : aucune n'est en ON DELETE CASCADE,
  -- il faut donc les solder avant de retirer la ligne auth.
  update public.photos set deleted_by = null where deleted_by = p_user_id;
  delete from public.event_invites where created_by = p_user_id;
  delete from public.event_members where user_id = p_user_id;
  delete from public.audit_logs where actor_user_id = p_user_id;

  -- public.profiles part en cascade avec auth.users.
  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.purge_user_rows(uuid) from public;

-- ---------------------------------------------------------------------------
-- Suppression de son propre compte : mêmes règles qu'en 011, purge factorisée.
-- ---------------------------------------------------------------------------
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

  perform public.purge_user_rows(v_uid);
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Suppression d'un compte par un administrateur.
--
-- Trois refus, tous délibérés :
--   * son propre compte, parce que l'opération se termine par une déconnexion
--     et mérite le chemin explicite de /profile ;
--   * un autre administrateur, pour qu'aucun compte d'administration ne parte
--     d'un clic depuis une liste ;
--   * un organisateur d'albums vivants, sinon les invités perdraient leurs
--     photos sans prévenir. L'administrateur supprime d'abord les albums.
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owned_events int;
  v_target_role text;
begin
  if not public.is_super_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'SELF_DELETE';
  end if;

  select global_role into v_target_role
  from public.profiles
  where id = p_user_id;

  if v_target_role is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  if v_target_role = 'super_admin' then
    raise exception 'SUPER_ADMIN_PROTECTED';
  end if;

  select count(*) into v_owned_events
  from public.events e
  where e.created_by = p_user_id
    and e.deleted_at is null;

  if v_owned_events > 0 then
    raise exception 'OWNS_EVENTS:%', v_owned_events;
  end if;

  perform public.purge_user_rows(p_user_id);
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
