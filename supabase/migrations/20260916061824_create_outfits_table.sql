create table if not exists outfits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(user_id) on delete cascade,
    name text,
    occasion text,
    style text,
    season text,
    created_at timestamptz default now(),
    modified_at timestamptz default now()
);

--Trigger function to automatically update modified_at whenever a row is modified; can also bind this to other tables
create or replace function set_modified_at() returns trigger as $$
begin
new.modified_at = now();
return new;
end;
$$ language plpgsql;

create trigger trg_outfits_modified_at
before update on outfits
for each row
execute function set_modified_at();

alter table outfits enable row level security;

create policy "Users can only access their own outfits"
on outfits for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
