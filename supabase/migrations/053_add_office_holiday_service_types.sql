-- Migration: Add Office and Holiday Service Types
-- Created: 2025-01-XX
-- Description: Add 'office' and 'holiday' to the bookings service_type CHECK constraint
--              to allow office cleaning and holiday cleaning bookings

-- ============================================================================
-- UPDATE BOOKINGS TABLE CONSTRAINT
-- ============================================================================
-- Drop existing constraint and add new one that includes 'office' and 'holiday'
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_service_type_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_service_type_check 
CHECK (service_type IN ('standard', 'deep', 'move-in-out', 'airbnb', 'carpet-cleaning', 'office', 'holiday'));

