DROP POLICY "TEMPORARY OPEN ACCESS FOR TESTING" ON wardrobe_items;

create policy "Users can only access their own items"
on wardrobe_items for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);