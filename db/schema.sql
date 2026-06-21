-- Marks — Supabase schema v2 (workspaces + collections + bookmarks)
-- Paste this whole block into Supabase SQL Editor → Run.
-- Safe to re-run: every CREATE uses IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------------

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text,
  color text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  emoji text,
  color text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  url text not null,
  title text not null,
  description text,
  favicon text,
  preview text,
  tags text[] not null default '{}',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------------

create index if not exists workspaces_user_idx     on public.workspaces(user_id);
create index if not exists collections_workspace_idx on public.collections(workspace_id);
create index if not exists collections_user_idx    on public.collections(user_id);
create index if not exists bookmarks_workspace_idx on public.bookmarks(workspace_id);
create index if not exists bookmarks_collection_idx on public.bookmarks(collection_id);
create index if not exists bookmarks_user_idx      on public.bookmarks(user_id);

-- ------------------------------------------------------------------
-- Row-Level Security: every user only sees their own rows
-- ------------------------------------------------------------------

alter table public.workspaces  enable row level security;
alter table public.collections enable row level security;
alter table public.bookmarks   enable row level security;

drop policy if exists "own workspaces"  on public.workspaces;
drop policy if exists "own collections" on public.collections;
drop policy if exists "own bookmarks"   on public.bookmarks;

create policy "own workspaces"
  on public.workspaces for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own collections"
  on public.collections for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own bookmarks"
  on public.bookmarks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------
-- updated_at trigger for bookmarks
-- ------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists bookmarks_updated_at on public.bookmarks;
create trigger bookmarks_updated_at
  before update on public.bookmarks
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Realtime: emit changes so other devices update live
-- ------------------------------------------------------------------

alter publication supabase_realtime add table public.workspaces;
alter publication supabase_realtime add table public.collections;
alter publication supabase_realtime add table public.bookmarks;
