ALTER TABLE catalogue_items
ADD CONSTRAINT check_colour_lowercase CHECK (colour::text = LOWER(colour::text));