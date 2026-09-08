create table profiles (
    id uuid primary key default gen_random_uuid(),
    display_name text,
    body_type text,
    size text,
    created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "TEMPORARY OPEN ACCESS FOR TESTING"
on profiles for all
using (true)
with check (true);
