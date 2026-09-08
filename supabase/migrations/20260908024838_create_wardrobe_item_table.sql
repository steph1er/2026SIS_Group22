create table if not exists wardrobe_items (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    image_url text,
    clothing_category text,
    style text,
    colour text[],
    created_at timestamptz default now(),
    modified_at timestamptz,
    brand text,
    size text,
    material text[],
    tags text[]
);

alter table wardrobe_items enable row level security;

--TODO -> change below to proper authentication once set up

create policy "TEMPORARY OPEN ACCESS FOR TESTING"
on wardrobe_items for all
using (true)
with check (true);