-- Memora: changer son nom d'utilisateur et son nom affiché depuis /profile.
-- Run this once in the Supabase SQL editor, after 012_event_status.sql.
--
-- L'identifiant unique du compte reste l'adresse e-mail (côté auth.users).
-- Le nom d'utilisateur, lui, n'est qu'une commodité de connexion et
-- d'affichage : il doit donc pouvoir changer, à condition de rester unique.
--
-- Deux problèmes empêchent de laisser le client faire un simple update :
--   1. la RLS `profiles_select_self` interdit de lire les autres profils, donc
--      impossible de vérifier la disponibilité d'un nom depuis le navigateur ;
--   2. la contrainte `unique` sur username est sensible à la casse, alors que
--      `get_login_email` résout le nom en minuscules : « Marie » et « marie »
--      passeraient la contrainte tout en rendant la connexion ambiguë.
-- La fonction ci-dessous fait les deux vérifications côté serveur.

create or replace function public.update_my_profile(
  p_username text,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_username text := trim(coalesce(p_username, ''));
  v_display_name text := trim(coalesce(p_display_name, ''));
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if v_username !~ '^[A-Za-z0-9._-]{3,30}$' then
    raise exception 'INVALID_USERNAME';
  end if;

  if char_length(v_display_name) < 1 or char_length(v_display_name) > 60 then
    raise exception 'INVALID_DISPLAY_NAME';
  end if;

  if exists (
    select 1
    from public.profiles p
    where lower(p.username) = lower(v_username)
      and p.id <> v_uid
  ) then
    raise exception 'USERNAME_TAKEN';
  end if;

  update public.profiles
  set username = v_username,
      display_name = v_display_name
  where id = v_uid;
end;
$$;

revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Garde-fou sur les colonnes sensibles de profiles
-- ---------------------------------------------------------------------------
-- `profiles_update_self` (001) autorise un utilisateur à mettre à jour sa
-- propre ligne sans restreindre les colonnes : avec la clé anon, n'importe qui
-- pouvait donc se donner `global_role = 'super_admin'` ou lever son
-- `account_status = 'blocked'`. Ce trigger remet ces colonnes à leur valeur
-- précédente, sauf pour un super admin (back-office) ou une fonction
-- `security definer` exécutée hors session authentifiée.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_super_admin() then
    return new;
  end if;

  new.id := old.id;
  new.email := old.email;
  new.global_role := old.global_role;
  new.account_status := old.account_status;
  new.created_at := old.created_at;

  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_columns on public.profiles;
create trigger trg_profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();
