-- Add custom_cards column to rooms table
ALTER TABLE rooms ADD COLUMN custom_cards TEXT[] DEFAULT NULL;
