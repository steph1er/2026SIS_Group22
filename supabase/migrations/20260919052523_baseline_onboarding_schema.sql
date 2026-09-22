-- Baseline for the onboarding schema that was first created by hand in the hosted
-- Supabase project, so that migration history matches the database.
--
-- Every statement is idempotent. On the hosted database, where all of this already
-- exists, it changes nothing. On a fresh database it creates the same objects.
-- It never drops, recreates or updates anything, and it contains no data changes.
begin;

-- Onboarding status on each profile. If the columns already exist they are skipped,
-- so existing onboarding_completed values are never reset.
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- One row of onboarding answers per user. user_id is auth.users.id, not profiles.id.
create table if not exists public.onboarding (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,

  primary_aesthetic text,
  style_keywords text[] not null default '{}',
  colour_preferences text[] not null default '{}',
  fit_preferences text[] not null default '{}',
  fashion_outlook text[] not null default '{}',
  style_no_gos text[] not null default '{}',

  height_cm integer,
  prefer_not_say_height boolean not null default false,
  body_type text,
  top_size text,
  bottom_size text,
  dress_size text,
  fabric_sensitivities text[] not null default '{}',

  tops_min_price numeric(10,2),
  tops_max_price numeric(10,2),
  bottoms_min_price numeric(10,2),
  bottoms_max_price numeric(10,2),
  dresses_min_price numeric(10,2),
  dresses_max_price numeric(10,2),
  outerwear_min_price numeric(10,2),
  outerwear_max_price numeric(10,2),
  accessories_min_price numeric(10,2),
  accessories_max_price numeric(10,2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint onboarding_pkey primary key (id),
  constraint onboarding_user_id_key unique (user_id),
  constraint onboarding_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.onboarding enable row level security;

-- Each policy is created only if a policy with that exact name is missing, so the
-- hosted policies are left untouched and are never duplicated or replaced.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'onboarding' and policyname = 'Users can create own onboarding'
  ) then
    create policy "Users can create own onboarding"
    on public.onboarding for insert to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'onboarding' and policyname = 'Users can delete own onboarding'
  ) then
    create policy "Users can delete own onboarding"
    on public.onboarding for delete to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'onboarding' and policyname = 'Users can update own onboarding'
  ) then
    create policy "Users can update own onboarding"
    on public.onboarding for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'onboarding' and policyname = 'Users can view own onboarding'
  ) then
    create policy "Users can view own onboarding"
    on public.onboarding for select to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

grant select, insert, update, delete on public.onboarding to authenticated;

commit;
