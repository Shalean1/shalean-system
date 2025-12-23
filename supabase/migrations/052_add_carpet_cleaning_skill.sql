-- Migration: Add carpet cleaning skill to cleaners
-- Created: 2025-01-XX
-- Description: Adds carpet_cleaning_skill boolean field to cleaners table
--              to track which cleaners have the skill to clean carpets

-- Add carpet_cleaning_skill column to cleaners table
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS carpet_cleaning_skill BOOLEAN DEFAULT false;

-- Add comment to column
COMMENT ON COLUMN cleaners.carpet_cleaning_skill IS 'Indicates if the cleaner has the skill to clean carpets';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_cleaners_carpet_cleaning_skill ON cleaners(carpet_cleaning_skill) WHERE carpet_cleaning_skill = true;

