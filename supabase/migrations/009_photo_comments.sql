-- Memora: commentaires sur les photos d'un événement.
-- Run this once in the Supabase SQL editor, after 008_event_invites_join_flow.sql.
--
-- Les invités actifs d'un événement peuvent lire et écrire des commentaires sur
-- les photos de cet événement. Un commentaire ne peut être modifié que par son
-- auteur, et supprimé par son auteur, un organisateur de l'événement ou un
-- super admin.

create table if not exists public.photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_photo_comments_photo_id on public.photo_comments (photo_id, created_at);
create index if not exists idx_photo_comments_event_id on public.photo_comments (event_id);
create index if not exists idx_photo_comments_user_id on public.photo_comments (user_id);

drop trigger if exists set_photo_comments_updated_at on public.photo_comments;
create trigger set_photo_comments_updated_at
  before update on public.photo_comments
  for each row execute function public.set_updated_at();

alter table public.photo_comments enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
drop policy if exists "photo_comments_select_members" on public.photo_comments;
create policy "photo_comments_select_members" on public.photo_comments
  for select using (
    public.is_active_event_member(event_id)
    or public.is_super_admin()
  );

drop policy if exists "photo_comments_insert_members" on public.photo_comments;
create policy "photo_comments_insert_members" on public.photo_comments
  for insert with check (
    user_id = auth.uid()
    and public.is_active_event_member(event_id)
    and exists (
      select 1 from public.photos p
      where p.id = photo_id and p.event_id = photo_comments.event_id
    )
  );

drop policy if exists "photo_comments_update_author" on public.photo_comments;
create policy "photo_comments_update_author" on public.photo_comments
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "photo_comments_delete_author_or_admin" on public.photo_comments;
create policy "photo_comments_delete_author_or_admin" on public.photo_comments
  for delete using (
    user_id = auth.uid()
    or public.is_event_organizer(event_id)
    or public.is_super_admin()
  );
