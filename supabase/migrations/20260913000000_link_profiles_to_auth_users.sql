begin;

-- Keep existing profile IDs. Legacy rows remain unowned until explicitly mapped.
alter table public.profiles
  add column user_id uuid unique references auth.users(id) on delete cascade;

drop policy "TEMPORARY OPEN ACCESS FOR TESTING" on public.profiles;
create policy "Users manage their own profile"
on public.profiles for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profiles to authenticated;

create function public.create_auth_user_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.create_auth_user_profile() from public, anon, authenticated;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.create_auth_user_profile();

-- Existing auth accounts also need a linked profile. Do not guess ownership of
-- legacy profiles using names; those rows have no reliable identity information.
insert into public.profiles (user_id, display_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (user_id) do nothing;

commit;
