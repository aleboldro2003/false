-- False App - Supabase schema
-- Safe to run on a fresh project and mostly safe to rerun on an existing project.

create extension if not exists pgcrypto;

-- Profiles are created automatically when a Supabase auth user signs up.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  content text,
  type text not null default 'post',
  media_url text,
  media_type text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  content text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, post_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.reposts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, post_id)
);

create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  artist text,
  description text,
  cover_url text,
  media_url text,
  image_url text,
  video_url text,
  duration integer not null default 0,
  views text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, podcast_id)
);

-- Columns added during earlier iterations. Keeping them here makes old projects converge.
alter table public.profiles add column if not exists banner_url text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists media_url text;
alter table public.posts add column if not exists media_type text;
alter table public.comments add column if not exists content text;
alter table public.comments add column if not exists text text;
alter table public.podcasts add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.podcasts add column if not exists cover_url text;
alter table public.podcasts add column if not exists media_url text;
alter table public.podcasts add column if not exists image_url text;
alter table public.podcasts add column if not exists video_url text;
alter table public.podcasts add column if not exists duration integer not null default 0;
alter table public.podcasts add column if not exists views text;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.reposts enable row level security;
alter table public.podcasts enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles
for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Posts are public" on public.posts;
create policy "Posts are public" on public.posts
for select using (true);

drop policy if exists "Users can insert own posts" on public.posts;
create policy "Users can insert own posts" on public.posts
for insert with check (auth.uid() = author_id);

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts" on public.posts
for delete using (auth.uid() = author_id);

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments
for select using (true);

drop policy if exists "Users can insert own comments" on public.comments;
create policy "Users can insert own comments" on public.comments
for insert with check (auth.uid() = author_id);

drop policy if exists "Likes are public" on public.likes;
create policy "Likes are public" on public.likes
for select using (true);

drop policy if exists "Users can insert own likes" on public.likes;
create policy "Users can insert own likes" on public.likes
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on public.likes;
create policy "Users can delete own likes" on public.likes
for delete using (auth.uid() = user_id);

drop policy if exists "Follows are public" on public.follows;
create policy "Follows are public" on public.follows
for select using (true);

drop policy if exists "Users can insert own follows" on public.follows;
create policy "Users can insert own follows" on public.follows
for insert with check (auth.uid() = follower_id);

drop policy if exists "Users can delete own follows" on public.follows;
create policy "Users can delete own follows" on public.follows
for delete using (auth.uid() = follower_id);

drop policy if exists "Reposts are public" on public.reposts;
create policy "Reposts are public" on public.reposts
for select using (true);

drop policy if exists "Users can insert own reposts" on public.reposts;
create policy "Users can insert own reposts" on public.reposts
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reposts" on public.reposts;
create policy "Users can delete own reposts" on public.reposts
for delete using (auth.uid() = user_id);

drop policy if exists "Podcasts are public" on public.podcasts;
create policy "Podcasts are public" on public.podcasts
for select using (true);

drop policy if exists "Users can insert podcasts" on public.podcasts;
create policy "Users can insert podcasts" on public.podcasts
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own podcasts" on public.podcasts;
create policy "Users can update own podcasts" on public.podcasts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Favorites are visible to owner" on public.favorites;
create policy "Favorites are visible to owner" on public.favorites
for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites" on public.favorites
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites" on public.favorites
for delete using (auth.uid() = user_id);

create index if not exists idx_posts_author_created on public.posts(author_id, created_at desc);
create index if not exists idx_posts_created on public.posts(created_at desc);
create index if not exists idx_comments_post_created on public.comments(post_id, created_at);
create index if not exists idx_likes_post on public.likes(post_id);
create index if not exists idx_likes_user on public.likes(user_id);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_reposts_user_created on public.reposts(user_id, created_at desc);
create index if not exists idx_podcasts_user_created on public.podcasts(user_id, created_at desc);
create index if not exists idx_favorites_user on public.favorites(user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/*']),
  ('banners', 'banners', true, 10485760, array['image/*']),
  ('post-media', 'post-media', true, 52428800, array['image/*', 'video/*']),
  ('podcast-covers', 'podcast-covers', true, 10485760, array['image/*']),
  ('podcast-videos', 'podcast-videos', true, 524288000, array['video/*'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "False public storage read" on storage.objects;
create policy "False public storage read" on storage.objects
for select using (bucket_id in ('avatars', 'banners', 'post-media', 'podcast-covers', 'podcast-videos'));

drop policy if exists "False authenticated storage upload" on storage.objects;
create policy "False authenticated storage upload" on storage.objects
for insert with check (
  auth.role() = 'authenticated'
  and bucket_id in ('avatars', 'banners', 'post-media', 'podcast-covers', 'podcast-videos')
);

drop policy if exists "False authenticated storage update" on storage.objects;
create policy "False authenticated storage update" on storage.objects
for update using (
  auth.role() = 'authenticated'
  and bucket_id in ('avatars', 'banners', 'post-media', 'podcast-covers', 'podcast-videos')
);

drop policy if exists "False authenticated storage delete" on storage.objects;
create policy "False authenticated storage delete" on storage.objects
for delete using (
  auth.role() = 'authenticated'
  and bucket_id in ('avatars', 'banners', 'post-media', 'podcast-covers', 'podcast-videos')
);
