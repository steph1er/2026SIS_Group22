-- Track how far an unfinished onboarding got, so it can be resumed after the app
-- restarts. current_step is the zero-based index of the furthest screen reached (0-4).
--
-- Existing rows, including completed ones, simply read as 0. Only a column and a
-- constraint are added: no rows are updated and no existing data is changed.
begin;

alter table public.onboarding
  add column if not exists current_step integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.onboarding'::regclass and conname = 'onboarding_current_step_check'
  ) then
    alter table public.onboarding
      add constraint onboarding_current_step_check check (current_step between 0 and 4);
  end if;
end
$$;

comment on column public.onboarding.current_step is
  'Furthest onboarding screen reached (0-4), used to resume an unfinished quiz. Ignored once profiles.onboarding_completed is true.';

commit;
