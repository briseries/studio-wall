-- user_data table: one row per user with JSONB columns for app state
create table if not exists public.user_data (
  id         uuid        primary key references auth.users(id) on delete cascade,
  notes      jsonb       default '{}'::jsonb,
  deadlines  jsonb       default '{}'::jsonb,
  inbox      jsonb       default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_data enable row level security;

-- Users can only read their own row
create policy "Users can read own data"
  on public.user_data
  for select
  using (auth.uid() = id);

-- Users can insert their own row
create policy "Users can insert own data"
  on public.user_data
  for insert
  with check (auth.uid() = id);

-- Users can update their own row
create policy "Users can update own data"
  on public.user_data
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
