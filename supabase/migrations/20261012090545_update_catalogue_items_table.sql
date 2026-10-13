ALTER TABLE catalogue_items
ADD CONSTRAINT check_style_lowercase CHECK (style::text = LOWER(style::text)),
ADD CONSTRAINT check_materials_lowercase CHECK (materials::text = LOWER(materials::text));