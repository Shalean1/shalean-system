-- Migration: Add Office Size Column
-- Created: 2025-01-XX
-- Description: Add office_size column to bookings table for office cleaning service

-- ============================================================================
-- ADD OFFICE_SIZE COLUMN
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS office_size TEXT CHECK (office_size IN ('small', 'medium', 'large') OR office_size IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN bookings.office_size IS 'Office size for office cleaning service: small (1-3 rooms), medium (4-10 rooms), or large (10+ rooms)';











