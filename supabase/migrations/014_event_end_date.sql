-- Memora: un album peut se clôturer tout seul à une date de fin.
-- Run this once in the Supabase SQL editor, after 013_profile_identity.sql.
--
-- `event_date` devient la date de début de l'événement. `end_date` est le
-- dernier jour où l'album accepte des photos : passé ce jour, il bascule en
-- lecture seule sans que personne ait à toucher au statut.
--
-- La clôture est calculée, pas écrite : pas de tâche planifiée à surveiller,
-- et l'album se rouvre proprement si l'organisateur repousse la date. Le
-- statut `CLOSED` reste la clôture manuelle, immédiate et prioritaire.
--
-- `end_date is null` = pas de clôture automatique (cas des albums existants).

alter table public.events add column if not exists end_date date;

comment on column public.events.event_date is
  'Date de début de l''événement.';
comment on column public.events.end_date is
  'Dernier jour où l''album accepte des photos. Null = pas de clôture automatique.';

-- ---------------------------------------------------------------------------
-- La RLS d'insertion des photos tient compte de la date de fin.
--
-- Le jour de référence est celui d'Europe/Paris et non l'UTC : sinon un album
-- qui se termine « ce soir » resterait ouvert jusqu'à 1 ou 2 heures du matin.
-- ---------------------------------------------------------------------------
create or replace function public.is_event_open(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id
      and e.status = 'ACTIVE'
      and e.upload_enabled
      and e.deleted_at is null
      and (
        e.end_date is null
        or e.end_date >= (now() at time zone 'Europe/Paris')::date
      )
  );
$$;
