-- public bucket for background-removed wardrobe item images
-- (uploads go through the backend service role, so no insert policies are needed)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wardrobe-images', 'wardrobe-images', true, 10485760, array['image/png'])
on conflict (id) do nothing;
