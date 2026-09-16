create table if not exists brands (
    id uuid primary key default gen_random_uuid(),
    brand_name text,
    created_at timestamptz default now()
);

alter table brands enable row level security;

create policy "Users can view all records"
on brands for select
using (true);