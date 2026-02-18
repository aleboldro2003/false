-- Create a table for follows
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Create a table for reposts
create table if not exists public.reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Enable RLS
alter table public.follows enable row level security;
alter table public.reposts enable row level security;

-- Follows Policies
create policy "Users can view follows"
  on public.follows for select
  using (true);

create policy "Users can insert their own follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can delete their own follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- Reposts Policies
create policy "Users can view reposts"
  on public.reposts for select
  using (true);

create policy "Users can insert their own reposts"
  on public.reposts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reposts"
  on public.reposts for delete
  using (auth.uid() = user_id);
