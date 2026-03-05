-- Add metadata column to promotions for flexible custom data
ALTER TABLE promotions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
