-- Migration: Backfill assigned_cleaner_id for existing bookings
-- Created: 2025-01-XX
-- Description: Set assigned_cleaner_id based on cleaner_preference for existing bookings
--              that don't have assigned_cleaner_id set

-- Update bookings where cleaner_preference is set but assigned_cleaner_id is NULL
-- Only assign if cleaner_preference is not 'no-preference'
UPDATE bookings
SET assigned_cleaner_id = cleaner_preference
WHERE cleaner_preference IS NOT NULL
  AND cleaner_preference != 'no-preference'
  AND assigned_cleaner_id IS NULL
  AND cleaner_preference IN ('natasha-m', 'estery-p', 'beaul');

-- Verify the cleaner_id exists in the cleaners table
-- This ensures referential integrity
UPDATE bookings b
SET assigned_cleaner_id = NULL
WHERE b.assigned_cleaner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM cleaners c 
    WHERE c.cleaner_id = b.assigned_cleaner_id
  );
