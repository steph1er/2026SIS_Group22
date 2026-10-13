-- Ranks catalogue items by embedding similarity to a user's profile vector.
--
-- Hard filters (category, excluded ids, excluded styles) are applied first since they
-- come from reliable structured data (site fields / the user's own wishlist / onboarding
-- no-gos). Embedding similarity only ranks within whatever passes those filters - it never
-- overrides them - because the catalogue photos are not guaranteed to be clean product
-- shots (they may include models, accessories or backgrounds), so the embedding signal
-- is treated as a soft "visual similarity" ranking signal, not a source of truth.
create or replace function match_catalogue_items(
    query_embedding extensions.vector(512),
    match_categories text[] default null,
    exclude_styles text[] default '{}',
    exclude_ids uuid[] default '{}',
    match_limit int default 20,
    match_offset int default 0
)
returns setof catalogue_items
language sql
stable
set search_path = public, extensions
as $$
    select *
    from catalogue_items
    where embedding is not null
        and (match_categories is null or category ilike any (match_categories))
        and not (id = any (exclude_ids))
        and (exclude_styles = '{}' or not (style && exclude_styles))
    order by embedding <=> query_embedding
    limit match_limit
    offset match_offset;
$$;