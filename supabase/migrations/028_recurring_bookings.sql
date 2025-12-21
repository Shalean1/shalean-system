-- Migration: Add Recurring Bookings Support
-- Created: 2025-01-XX
-- Description: Add support for recurring bookings (weekly, bi-weekly, monthly)
--              Adds fields to track recurring booking series and relationships

-- ============================================================================
-- ADD RECURRING BOOKING COLUMNS
-- ============================================================================

-- Add recurring_group_id to link bookings in the same recurring series
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS recurring_group_id TEXT;

-- Add recurring_sequence to track order within the series (0 = first booking)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS recurring_sequence INTEGER DEFAULT NULL;

-- Add parent_booking_id to reference the original booking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS parent_booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL;

-- Add is_recurring flag for quick filtering
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- ============================================================================
-- CREATE INDEXES FOR EFFICIENT QUERIES
-- ============================================================================

-- Index for querying all bookings in a recurring series
CREATE INDEX IF NOT EXISTS idx_bookings_recurring_group ON bookings(recurring_group_id) 
WHERE recurring_group_id IS NOT NULL;

-- Index for finding child bookings by parent
CREATE INDEX IF NOT EXISTS idx_bookings_parent_booking ON bookings(parent_booking_id) 
WHERE parent_booking_id IS NOT NULL;

-- Index for filtering recurring bookings
CREATE INDEX IF NOT EXISTS idx_bookings_is_recurring ON bookings(is_recurring) 
WHERE is_recurring = true;

-- Composite index for recurring series queries with sequence ordering
CREATE INDEX IF NOT EXISTS idx_bookings_recurring_group_sequence ON bookings(recurring_group_id, recurring_sequence) 
WHERE recurring_group_id IS NOT NULL;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN bookings.recurring_group_id IS 'Unique identifier linking all bookings in a recurring series. Generated when first recurring booking is created.';
COMMENT ON COLUMN bookings.recurring_sequence IS 'Order of this booking within the recurring series. 0 = first booking (charged upfront), 1+ = subsequent bookings (pending payment).';
COMMENT ON COLUMN bookings.parent_booking_id IS 'Reference to the original booking that started this recurring series. NULL for the first booking.';
COMMENT ON COLUMN bookings.is_recurring IS 'Flag indicating if this booking is part of a recurring series. True for all bookings in a recurring series.';


