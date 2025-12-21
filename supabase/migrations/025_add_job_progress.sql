-- Migration: Add Job Progress Tracking for Cleaner Workflow
-- Created: 2025-01-XX
-- Description: Add job_progress field to track sequential workflow states (on-my-way, arrived, started)
--              This allows cleaners to update their progress through the job workflow
--              Also adds 'in-progress' status to the status enum

-- ============================================================================
-- 1. UPDATE STATUS CONSTRAINT TO INCLUDE 'in-progress'
-- ============================================================================
-- Drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new constraint with 'in-progress' status
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'));

-- ============================================================================
-- 2. ADD JOB_PROGRESS COLUMN TO BOOKINGS
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS job_progress TEXT CHECK (job_progress IN ('on-my-way', 'arrived', 'started')) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_job_progress ON bookings(job_progress);

-- ============================================================================
-- 3. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN bookings.job_progress IS 'Tracks cleaner job progress: on-my-way (cleaner is heading to location), arrived (cleaner has arrived), started (cleaner has started the job). NULL means not started yet.';
