update catalogue_items
  set style = lower(style::text)::text[]
  where id = '47a4298f-8ae8-427a-b42c-aeca9c2ca3f3';

update catalogue_items
  set materials = lower(materials::text)::text[]
  where id = '39756081-5ae9-4516-806d-160a18698d33';