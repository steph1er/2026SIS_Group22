create table if not exists outift_items (
    if uuid primary key default gen_random_uuid(),
    outfit_id uuid not null references public.outfits(id) on delete cascade,
    wardrobe_items_id uuid references public.wardrobe_items(id) on delete cascade,
    catalogue_items_id uuid references public.catalogue_items(id) on delete cascade,
    created_at timestamptz default now(),
    --A constraint to ensure each row only has either a wardrobe item or catalogue item, not both
     constraint chk_outfit_item_source check (
        (wardrobe_items_id is null and catalogue_items_id is not null) or
        (wardrobe_items_id is not null and catalogue_items_id is null)
     )
);

alter table outift_items enable row level security;

create policy "Users can only access their own outfit items"
on outift_items for all
to authenticated
using (
    exists (
        select 1
        from outfits
        where outfits.id = outift_items.outfit_id
        and outfits.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from outfits
        where outfits.id = outift_items.outfit_id
        and outfits.user_id = auth.uid()
    )
);
