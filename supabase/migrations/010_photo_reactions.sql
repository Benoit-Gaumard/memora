-- Memora: réactions (cœur / pouce) sur les photos d'un événement.
-- Run this once in the Supabase SQL editor, after 009_photo_comments.sql.
--
-- Les invités actifs d'un événement peuvent réagir aux photos de cet événement.
-- Une seule réaction par invité et par photo : cliquer sur l'autre réaction
-- remplace la précédente, recliquer sur la même la retire.

create table if not exists public.photo_reactions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  kind text not null check (kind in ('heart', 'thumb')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (photo_id, user_id)
);

create index if not exists idx_photo_reactions_photo_id on public.photo_reactions (photo_id);
create index if not exists idx_photo_reactions_event_id on public.photo_reactions (event_id);
create index if not exists idx_photo_reactions_user_id on public.photo_reactions (user_id);

drop trigger if exists set_photo_reactions_updated_at on public.photo_reactions;
create trigger set_photo_reactions_updated_at
  before update on public.photo_reactions
  for each row execute function public.set_updated_at();

alter table public.photo_reactions enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
drop policy if exists "photo_reactions_select_members" on public.photo_reactions;
create policy "photo_reactions_select_members" on public.photo_reactions
  for select using (
    public.is_active_event_member(event_id)
    or public.is_super_admin()
  );

drop policy if exists "photo_reactions_insert_members" on public.photo_reactions;
create policy "photo_reactions_insert_members" on public.photo_reactions
  for insert with check (
    user_id = auth.uid()
    and public.is_active_event_member(event_id)
    and exists (
      select 1 from public.photos p
      where p.id = photo_id and p.event_id = photo_reactions.event_id
    )
  );

drop policy if exists "photo_reactions_update_author" on public.photo_reactions;
create policy "photo_reactions_update_author" on public.photo_reactions
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "photo_reactions_delete_author_or_admin" on public.photo_reactions;
create policy "photo_reactions_delete_author_or_admin" on public.photo_reactions
  for delete using (
    user_id = auth.uid()
    or public.is_event_organizer(event_id)
    or public.is_super_admin()
  );
