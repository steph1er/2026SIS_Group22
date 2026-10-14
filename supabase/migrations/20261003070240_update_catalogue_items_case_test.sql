update catalogue_items
  set colour = lower(colour::text)::text[]
  where id = '05a196c8-e244-4f1d-a89d-a9130edd4406';