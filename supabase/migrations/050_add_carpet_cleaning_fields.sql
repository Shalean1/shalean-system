-- Migration: Add Carpet Cleaning Specific Fields
-- Created: 2025-01-XX
-- Description: Add fields to store carpet cleaning specific information (fitted rooms, loose carpets, furniture status)

-- ============================================================================
-- ADD CARPET CLEANING FIELDS TO BOOKINGS TABLE
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS fitted_rooms_count INTEGER,
ADD COLUMN IF NOT EXISTS loose_carpets_count INTEGER,
ADD COLUMN IF NOT EXISTS rooms_furniture_status TEXT CHECK (rooms_furniture_status IN ('furnished', 'empty') OR rooms_furniture_status IS NULL);

-- Add comments for documentation
COMMENT ON COLUMN bookings.fitted_rooms_count IS 'Number of rooms with fitted carpets (for carpet-cleaning service)';
COMMENT ON COLUMN bookings.loose_carpets_count IS 'Number of loose carpets (for carpet-cleaning service)';
COMMENT ON COLUMN bookings.rooms_furniture_status IS 'Whether rooms have furniture (furnished) or are empty (for carpet-cleaning service)';

