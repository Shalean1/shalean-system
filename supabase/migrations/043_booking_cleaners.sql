-- Booking Cleaners Migration
-- This migration creates a table to track which cleaners are assigned to specific bookings
-- This is used when a team booking needs specific cleaners assigned by admin

-- ============================================================================
-- BOOKING_CLEANERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS booking_cleaners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  cleaner_id TEXT NOT NULL REFERENCES cleaners(cleaner_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, cleaner_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_cleaners_booking_id ON booking_cleaners(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_cleaners_cleaner_id ON booking_cleaners(cleaner_id);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_booking_cleaners_updated_at ON booking_cleaners;
CREATE TRIGGER update_booking_cleaners_updated_at
  BEFORE UPDATE ON booking_cleaners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE booking_cleaners IS 'Tracks which cleaners are assigned to work on specific bookings';
COMMENT ON COLUMN booking_cleaners.booking_id IS 'The booking these cleaners are assigned to';
COMMENT ON COLUMN booking_cleaners.cleaner_id IS 'The cleaner assigned to this booking';
