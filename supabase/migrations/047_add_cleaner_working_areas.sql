-- Add working_areas field to cleaners table
-- Stores array of suburb names where the cleaner provides service
-- Created: 2025-01-XX

ALTER TABLE cleaners
ADD COLUMN IF NOT EXISTS working_areas JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN cleaners.working_areas IS 'Array of suburb names where the cleaner provides service (e.g., ["Sea Point", "Camps Bay", "Claremont"])';

