update catalogue_items
  set style = lower(style::text)::text[];

update catalogue_items
  set materials = lower(materials::text)::text[];