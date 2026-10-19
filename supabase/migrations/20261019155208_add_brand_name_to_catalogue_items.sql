-- match_catalogue_items previously returned setof catalogue_items, which has brand_id (a uuid)
-- but no brand name, so the personalised recommendations path never had brand info to show
-- (unlike the getFallbackRecommendations path, which already joins brands separately).
-- Switching to an explicit `returns table` lets us left join brands and add brand_name,
-- matching the shape CatalogueService.getFallbackRecommendations already returns.
--
-- create or replace cannot change a function's return type, so the old setof catalogue_items
-- version must be dropped first.
drop function if exists match_catalogue_items(extensions.vector(512), text[], text[], uuid[], int, int);

create function match_catalogue_items(
    query_embedding extensions.vector(512),
    match_categories text[] default null,
    exclude_styles text[] default '{}',
    exclude_ids uuid[] default '{}',
    match_limit int default 20,
    match_offset int default 0
)
returns table (
    id uuid,
    item_name text,
    image_url text,
    category text,
    colour text[],
    style text[],
    price numeric(7,2),
    product_url text,
    available_sizes text[],
    materials text[],
    brand_id uuid,
    created_at timestamptz,
    embedding extensions.vector(512),
    brand_name text
)
language sql
stable
set search_path = public, extensions
as $$
    select
        catalogue_items.id,
        catalogue_items.item_name,
        catalogue_items.image_url,
        catalogue_items.category,
        catalogue_items.colour,
        catalogue_items.style,
        catalogue_items.price,
        catalogue_items.product_url,
        catalogue_items.available_sizes,
        catalogue_items.materials,
        catalogue_items.brand_id,
        catalogue_items.created_at,
        catalogue_items.embedding,
        brands.brand_name
    from catalogue_items
    left join brands on brands.id = catalogue_items.brand_id
    where catalogue_items.embedding is not null
        and (match_categories is null or catalogue_items.category ilike any (match_categories))
        and not (catalogue_items.id = any (exclude_ids))
        and (exclude_styles = '{}' or not (catalogue_items.style && exclude_styles))
    order by catalogue_items.embedding <=> query_embedding
    limit match_limit
    offset match_offset;
$$;
