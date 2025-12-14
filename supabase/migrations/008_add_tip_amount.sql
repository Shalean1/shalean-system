-- Migration: Add tip_amount column to bookings table
-- Created: 2025-01-XX
-- Description: Allow users to add an upfront tip for cleaners when booking

-- Add tip_amount column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comment to column
COMMENT ON COLUMN bookings.tip_amount IS 'Optional upfront tip amount for the cleaner';
