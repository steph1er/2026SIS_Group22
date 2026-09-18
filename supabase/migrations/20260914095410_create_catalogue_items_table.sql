create table if not exists catalogue_items (
    id uuid primary key default gen_random_uuid(),
    item_name text,
    image_url text,
    category text,
    colour text[],
    style text[],
    price numeric(7,2),
    product_url text,
    available_sizes text[],
    materials text[],
    brand_id text,
    created_at timestamptz default now()
);

alter table catalogue_items enable row level security;

create policy "Users can view all records"
on catalogue_items for select
using (true);