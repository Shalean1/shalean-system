-- Migration: Cleaner Accept/Decline Booking Feature
-- Created: 2025-01-XX
-- Description: Add cleaner_response field to allow cleaners to accept or decline bookings

-- ============================================================================
-- 1. ADD CLEANER_RESPONSE COLUMN TO BOOKINGS
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cleaner_response TEXT CHECK (cleaner_response IN ('accepted', 'declined')) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_response ON bookings(cleaner_response);

-- ============================================================================
-- 2. UPDATE RLS POLICY TO ALLOW CLEANERS TO UPDATE CLEANER_RESPONSE
-- ============================================================================
-- The existing policy "Cleaners can update assigned booking status" already covers this
-- as it allows cleaners to update bookings assigned to them

-- ============================================================================
-- 3. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN bookings.cleaner_response IS 'Cleaner response to booking assignment: accepted, declined, or null (pending response)';
