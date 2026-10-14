insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wardrobe-items', 'wardrobe-items', false, 10485760, array['image/png', 'image/jpeg', 'image/webp']);

create policy "Users can access their own images"
on storage.objects for all
to authenticated
using (
    bucket_id = 'wardrobe-items'
    and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
    bucket_id = 'wardrobe-items'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);
