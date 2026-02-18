-- 1. Create 'follows' table if it doesn't exist
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- 2. Create 'reposts' table if it doesn't exist
create table if not exists public.reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 3. Create 'favorites' table if it doesn't exist
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  podcast_id uuid references public.podcasts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, podcast_id)
);

-- 4. Add user_id to podcasts table (if not exists)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'podcasts' and column_name = 'user_id') then
        alter table public.podcasts 
        add column user_id uuid references public.profiles(id);
    end if;
end $$;

-- 5. Enable RLS
alter table public.follows enable row level security;
alter table public.reposts enable row level security;
alter table public.favorites enable row level security;
alter table public.podcasts enable row level security;

-- 6. RLS Policies (Drop existing to avoid conflicts)

-- Follows
drop policy if exists "Users can view follows" on public.follows;
create policy "Users can view follows" on public.follows for select using (true);

drop policy if exists "Users can insert their own follows" on public.follows;
create policy "Users can insert their own follows" on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "Users can delete their own follows" on public.follows;
create policy "Users can delete their own follows" on public.follows for delete using (auth.uid() = follower_id);

-- Reposts
drop policy if exists "Users can view reposts" on public.reposts;
create policy "Users can view reposts" on public.reposts for select using (true);

drop policy if exists "Users can insert their own reposts" on public.reposts;
create policy "Users can insert their own reposts" on public.reposts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reposts" on public.reposts;
create policy "Users can delete their own reposts" on public.reposts for delete using (auth.uid() = user_id);

-- Favorites
drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Podcasts
drop policy if exists "Users can insert their own podcasts" on public.podcasts;
create policy "Users can insert their own podcasts" on public.podcasts for insert to authenticated with check (true);

drop policy if exists "Everyone can read podcasts" on public.podcasts;
create policy "Everyone can read podcasts" on public.podcasts for select to authenticated, anon using (true);
