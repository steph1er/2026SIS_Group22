begin;

-- One current colour analysis per authenticated account. user_id is auth.users.id,
-- matching profiles.user_id and onboarding.user_id.
create table public.colour_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season text not null,
  undertone text not null check (undertone in ('Warm', 'Cool', 'Neutral')),
  skin_colour text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  palette jsonb not null default '[]'::jsonb check (jsonb_typeof(palette) = 'array'),
  avoid_colours jsonb not null default '[]'::jsonb check (jsonb_typeof(avoid_colours) = 'array'),
  characteristics jsonb not null default '{}'::jsonb check (jsonb_typeof(characteristics) = 'object'),
  explanation text not null,
  disclaimer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint colour_analysis_user_id_key unique (user_id)
);

create function public.set_colour_analysis_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_colour_analysis_updated_at
before update on public.colour_analysis
for each row execute function public.set_colour_analysis_updated_at();

alter table public.colour_analysis enable row level security;

create policy "Users can view own colour analysis"
on public.colour_analysis for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own colour analysis"
on public.colour_analysis for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own colour analysis"
on public.colour_analysis for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.colour_analysis from anon;
grant select, insert, update on table public.colour_analysis to authenticated;

commit;
