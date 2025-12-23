-- Add availability_days column to cleaners table
-- This allows admins to specify which days of the week each cleaner is available

-- ============================================================================
-- ADD AVAILABILITY_DAYS COLUMN
-- ============================================================================
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS availability_days JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN cleaners.availability_days IS 'Array of days of the week the cleaner is available (e.g., ["Monday", "Tuesday", "Wednesday"])';

-- Create index for JSONB queries (optional, but can be useful for filtering)
CREATE INDEX IF NOT EXISTS idx_cleaners_availability_days ON cleaners USING GIN (availability_days);

