-- Memora: deux statuts d'album seulement, et un album clôturé n'accepte plus
-- de photos.
-- Run this once in the Supabase SQL editor, after 011_account_self_service.sql.
--
-- Le produit ne connaît que deux états : l'album est ouvert (ACTIVE) et se
-- remplit, ou il est clôturé (CLOSED) et devient une archive consultable et
-- téléchargeable. DRAFT et ARCHIVED n'ont jamais servi : ils sont ramenés sur
-- les deux états utiles avant de resserrer la contrainte.

update public.events set status = 'ACTIVE' where status = 'DRAFT';
update public.events set status = 'CLOSED' where status = 'ARCHIVED';

alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status in ('ACTIVE', 'CLOSED'));

alter table public.events alter column status set default 'ACTIVE';

-- ---------------------------------------------------------------------------
-- Un album clôturé (ou dont les envois sont coupés) refuse les nouvelles
-- photos, quelle que soit l'interface utilisée.
--
-- Note : la policy storage.objects reste inchangée, car elle couvre aussi les
-- images de couverture, qu'un organisateur doit pouvoir remplacer sur un album
-- clôturé. Un fichier envoyé sans sa ligne `photos` n'apparaît nulle part et
-- le client le supprime lui-même.
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
  );
$$;

drop policy if exists "photos_insert_members" on public.photos;
create policy "photos_insert_members" on public.photos
  for insert with check (
    user_id = auth.uid()
    and public.is_active_event_member(event_id)
    and public.is_event_open(event_id)
  );
