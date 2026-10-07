update catalogue_items
  set colour = lower(colour::text)::text[]
  where id = '1cfd314a-5a77-4ab2-a36b-0d73df11232b';