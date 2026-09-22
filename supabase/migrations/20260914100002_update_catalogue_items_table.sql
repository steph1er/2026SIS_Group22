ALTER TABLE catalogue_items
    ALTER COLUMN brand_id TYPE uuid
    USING brand_id::uuid,
    ADD CONSTRAINT fk_brand
        FOREIGN KEY (brand_id) 
        REFERENCES brands(id); 