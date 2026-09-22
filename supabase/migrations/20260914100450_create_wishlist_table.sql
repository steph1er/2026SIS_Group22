create table if not exists wishlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    catalogue_item_id uuid,
    created_at timestamptz default now()
);

alter table wishlist enable row level security;

ALTER TABLE wishlist
    ADD CONSTRAINT fk_user_id
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id),
    ADD CONSTRAINT fk_catalogue_item_id
        FOREIGN KEY (catalogue_item_id) 
        REFERENCES catalogue_items(id);

create policy "Users can only access their own wishlist"
on wishlist for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);