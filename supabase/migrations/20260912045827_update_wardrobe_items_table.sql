ALTER TABLE wardrobe_items
    ADD price NUMERIC(7,2),
    ALTER COLUMN style TYPE text[]
    USING ARRAY[style],
    ALTER COLUMN user_id TYPE uuid
    USING user_id::uuid,
    ADD CONSTRAINT fk_item_owner
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id); 