-- Memora initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE guards where possible.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users, created automatically on sign up
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  email text,
  global_role text not null default 'user' check (global_role in ('user', 'super_admin')),
  account_status text not null default 'active' check (account_status in ('active', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- events: one row per event, one private storage bucket per event
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  event_type text not null default 'Autre',
  description text not null default '',
  event_date timestamptz not null,
  timezone text not null default 'Europe/Paris',
  cover_image_path text,
  bucket_name text unique not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  registration_enabled boolean not null default true,
  upload_enabled boolean not null default true,
  download_enabled boolean not null default true,
  storage_limit_bytes bigint not null default 1000000000,
  max_file_size_bytes bigint not null default 25000000,
  max_files_per_upload int not null default 50,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- event_invites: QR / code based join links, always server-validated
-- ---------------------------------------------------------------------------
create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  code text unique not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  max_uses int,
  current_uses int not null default 0,
  approval_required boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id),
  disabled_at timestamptz
);

-- ---------------------------------------------------------------------------
-- event_members: membership + role per event
-- ---------------------------------------------------------------------------
create table if not exists public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'participant' check (role in ('participant', 'organizer')),
  status text not null default 'active' check (status in ('pending', 'active', 'blocked', 'removed')),
  joined_at timestamptz not null default now(),
  joined_via text not null default 'invite' check (joined_via in ('invite', 'admin')),
  invite_id uuid references public.event_invites (id),
  unique (event_id, user_id)
);

-- ---------------------------------------------------------------------------
-- photos: metadata only; binary files live in the per-event storage bucket
-- ---------------------------------------------------------------------------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  original_filename text not null,
  stored_filename text not null,
  storage_original_path text not null,
  storage_display_path text not null,
  storage_thumbnail_path text not null,
  mime_type text not null,
  file_size bigint not null,
  width int,
  height int,
  checksum text not null,
  captured_at timestamptz,
  uploaded_at timestamptz default now(),
  status text not null default 'processing' check (status in ('uploading', 'processing', 'ready', 'failed', 'deleted')),
  error_code text,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audit_logs: append-only trail for sensitive actions
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id),
  event_id uuid references public.events (id),
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_events_created_by on public.events (created_by);
create index if not exists idx_event_invites_event_id on public.event_invites (event_id);
create index if not exists idx_event_members_event_id on public.event_members (event_id);
create index if not exists idx_event_members_user_id on public.event_members (user_id);
create index if not exists idx_photos_event_id on public.photos (event_id);
create index if not exists idx_photos_user_id on public.photos (user_id);
create index if not exists idx_audit_logs_event_id on public.audit_logs (event_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists trg_photos_updated_at on public.photos;
create trigger trg_photos_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- This is what makes "create account" visible in the database.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_invites enable row level security;
alter table public.event_members enable row level security;
alter table public.photos enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: users can read/update their own profile; super_admins read all
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- events: visible to members of the event or its creator
drop policy if exists "events_select_members" on public.events;
create policy "events_select_members" on public.events
  for select using (
    created_by = auth.uid()
    or exists (
      select 1 from public.event_members m
      where m.event_id = events.id and m.user_id = auth.uid() and m.status = 'active'
    )
  );

drop policy if exists "events_insert_owner" on public.events;
create policy "events_insert_owner" on public.events
  for insert with check (created_by = auth.uid());

drop policy if exists "events_update_owner" on public.events;
create policy "events_update_owner" on public.events
  for update using (created_by = auth.uid());

-- event_members: a member can see other members of the same event
drop policy if exists "event_members_select_same_event" on public.event_members;
create policy "event_members_select_same_event" on public.event_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.event_members m2
      where m2.event_id = event_members.event_id and m2.user_id = auth.uid() and m2.status = 'active'
    )
  );

-- photos: visible only to members of the related event
drop policy if exists "photos_select_members" on public.photos;
create policy "photos_select_members" on public.photos
  for select using (
    exists (
      select 1 from public.event_members m
      where m.event_id = photos.event_id and m.user_id = auth.uid() and m.status = 'active'
    )
  );

drop policy if exists "photos_insert_members" on public.photos;
create policy "photos_insert_members" on public.photos
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.event_members m
      where m.event_id = photos.event_id and m.user_id = auth.uid() and m.status = 'active'
    )
  );

-- event_invites: only organizers/creators can read invite codes they issued
drop policy if exists "event_invites_select_organizer" on public.event_invites;
create policy "event_invites_select_organizer" on public.event_invites
  for select using (
    created_by = auth.uid()
    or exists (
      select 1 from public.event_members m
      where m.event_id = event_invites.event_id and m.user_id = auth.uid() and m.role = 'organizer'
    )
  );

-- audit_logs: only the acting user (and, in the future, admins) can read their own entries
drop policy if exists "audit_logs_select_self" on public.audit_logs;
create policy "audit_logs_select_self" on public.audit_logs
  for select using (actor_user_id = auth.uid());
