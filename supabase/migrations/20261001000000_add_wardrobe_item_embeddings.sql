create extension if not exists vector with schema extensions;

alter table wardrobe_items
    add column if not exists embedding extensions.vector(512);

-- Embeddings are normalised by ml-service, so cosine distance suits similarity search.
create index if not exists wardrobe_items_embedding_idx
    on wardrobe_items
    using hnsw (embedding extensions.vector_cosine_ops);
