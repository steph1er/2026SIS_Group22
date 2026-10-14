create extension if not exists vector with schema extensions;

alter table catalogue_items
    add column if not exists embedding extensions.vector(512);

-- Embeddings are normalised by ml-service, so cosine distance suits similarity search.
-- Mirrors wardrobe_items_embedding_idx from 20261001000000_add_wardrobe_item_embeddings.sql.
create index if not exists catalogue_items_embedding_idx
    on catalogue_items
    using hnsw (embedding extensions.vector_cosine_ops);