create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pass_percentage int not null default 80,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists habits_user_name_unique
on public.habits (user_id, lower(name))
where archived = false;

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  day date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, day)
);

create trigger set_habit_completions_updated_at
before update on public.habit_completions
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

drop policy if exists user_settings_select on public.user_settings;
drop policy if exists user_settings_insert on public.user_settings;
drop policy if exists user_settings_update on public.user_settings;
create policy user_settings_select on public.user_settings
for select using (auth.uid() = user_id);
create policy user_settings_insert on public.user_settings
for insert with check (auth.uid() = user_id);
create policy user_settings_update on public.user_settings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists habits_select on public.habits;
drop policy if exists habits_insert on public.habits;
drop policy if exists habits_update on public.habits;
drop policy if exists habits_delete on public.habits;
create policy habits_select on public.habits
for select using (auth.uid() = user_id);
create policy habits_insert on public.habits
for insert with check (auth.uid() = user_id);
create policy habits_update on public.habits
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy habits_delete on public.habits
for delete using (auth.uid() = user_id);

drop policy if exists habit_completions_select on public.habit_completions;
drop policy if exists habit_completions_insert on public.habit_completions;
drop policy if exists habit_completions_update on public.habit_completions;
drop policy if exists habit_completions_delete on public.habit_completions;
create policy habit_completions_select on public.habit_completions
for select using (auth.uid() = user_id);
create policy habit_completions_insert on public.habit_completions
for insert with check (auth.uid() = user_id);
create policy habit_completions_update on public.habit_completions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy habit_completions_delete on public.habit_completions
for delete using (auth.uid() = user_id);
