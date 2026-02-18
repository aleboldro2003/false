-- 1. Create missing 'reposts' table
create table if not exists public.reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 2. Enable RLS on tables (if not already enabled)
alter table public.reposts enable row level security;
alter table public.podcasts enable row level security;
alter table public.follows enable row level security;
alter table public.favorites enable row level security;

-- 3. PODCASTS Policies (Fixes "Podcasts section shows nothing")
-- Drop existing policies to avoid conflicts
drop policy if exists "Everyone can read podcasts" on public.podcasts;
drop policy if exists "Users can insert their own podcasts" on public.podcasts;

-- Allow everyone to see podcasts
create policy "Everyone can read podcasts"
on public.podcasts for select
to authenticated, anon
using (true);

-- Allow users to upload podcasts
create policy "Users can insert their own podcasts"
on public.podcasts for insert
to authenticated
with check (true);

-- 4. REPOSTS Policies (Fixes "reposts table missing" and access)
drop policy if exists "Users can view reposts" on public.reposts;
drop policy if exists "Users can insert their own reposts" on public.reposts;
drop policy if exists "Users can delete their own reposts" on public.reposts;

create policy "Users can view reposts"
on public.reposts for select
using (true);

create policy "Users can insert their own reposts"
on public.reposts for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own reposts"
on public.reposts for delete
using (auth.uid() = user_id);

-- 5. FOLLOWS Policies (Ensure these exist for profile stats)
drop policy if exists "Users can view follows" on public.follows;
drop policy if exists "Users can insert their own follows" on public.follows;
drop policy if exists "Users can delete their own follows" on public.follows;

create policy "Users can view follows"
on public.follows for select
using (true);

create policy "Users can insert their own follows"
on public.follows for insert
with check (auth.uid() = follower_id);

create policy "Users can delete their own follows"
on public.follows for delete
using (auth.uid() = follower_id);
