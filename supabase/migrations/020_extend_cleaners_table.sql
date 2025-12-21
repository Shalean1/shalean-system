-- Migration: Extend Cleaners Table
-- Created: 2025-01-XX
-- Description: Add additional columns to cleaners table to support extended cleaner data
--              including service areas, specialties, contact info, location tracking, 
--              OTP fields, availability days, and authentication fields

-- ============================================================================
-- ADD NEW COLUMNS TO CLEANERS TABLE
-- ============================================================================

-- Service areas and specialties
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS areas TEXT[],
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Contact information
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Authentication fields (for cleaner accounts)
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT;

-- Location tracking
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS last_location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS last_location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS last_location_updated TIMESTAMPTZ;

-- OTP (One-Time Password) fields for phone authentication
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS otp_code TEXT,
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS otp_last_sent TIMESTAMPTZ;

-- Weekly availability schedule
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS available_monday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_tuesday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_wednesday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_thursday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_friday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_saturday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_sunday BOOLEAN DEFAULT false;

-- Employment information
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS hire_date DATE;

-- Note: photo_url from SQL file will be mapped to existing avatar_url column
-- No need to add photo_url as separate column

-- ============================================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Indexes for contact information lookups
CREATE INDEX IF NOT EXISTS idx_cleaners_phone ON cleaners(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cleaners_email ON cleaners(email) WHERE email IS NOT NULL;

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_cleaners_location ON cleaners(last_location_lat, last_location_lng) 
WHERE last_location_lat IS NOT NULL AND last_location_lng IS NOT NULL;

-- Index for OTP lookups
CREATE INDEX IF NOT EXISTS idx_cleaners_otp_code ON cleaners(otp_code) WHERE otp_code IS NOT NULL;

-- Index for availability queries
CREATE INDEX IF NOT EXISTS idx_cleaners_available_days ON cleaners(
  available_monday, available_tuesday, available_wednesday, 
  available_thursday, available_friday, available_saturday, available_sunday
) WHERE is_active = true AND is_available = true;

-- Index for hire date queries
CREATE INDEX IF NOT EXISTS idx_cleaners_hire_date ON cleaners(hire_date) WHERE hire_date IS NOT NULL;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN cleaners.areas IS 'Array of service areas/locations where cleaner operates';
COMMENT ON COLUMN cleaners.specialties IS 'Array of cleaning specialties (e.g., "Deep cleaning", "Eco-friendly")';
COMMENT ON COLUMN cleaners.years_experience IS 'Years of professional cleaning experience';
COMMENT ON COLUMN cleaners.phone IS 'Cleaner contact phone number';
COMMENT ON COLUMN cleaners.email IS 'Cleaner contact email address';
COMMENT ON COLUMN cleaners.password_hash IS 'Hashed password for cleaner authentication (if not using Supabase Auth)';
COMMENT ON COLUMN cleaners.auth_provider IS 'Authentication provider (e.g., "phone", "email", "both")';
COMMENT ON COLUMN cleaners.last_location_lat IS 'Last known latitude coordinate';
COMMENT ON COLUMN cleaners.last_location_lng IS 'Last known longitude coordinate';
COMMENT ON COLUMN cleaners.last_location_updated IS 'Timestamp when location was last updated';
COMMENT ON COLUMN cleaners.otp_code IS 'One-time password code for phone authentication';
COMMENT ON COLUMN cleaners.otp_expires_at IS 'Expiration timestamp for OTP code';
COMMENT ON COLUMN cleaners.otp_attempts IS 'Number of OTP verification attempts';
COMMENT ON COLUMN cleaners.otp_last_sent IS 'Timestamp when OTP was last sent';
COMMENT ON COLUMN cleaners.available_monday IS 'Available for bookings on Monday';
COMMENT ON COLUMN cleaners.available_tuesday IS 'Available for bookings on Tuesday';
COMMENT ON COLUMN cleaners.available_wednesday IS 'Available for bookings on Wednesday';
COMMENT ON COLUMN cleaners.available_thursday IS 'Available for bookings on Thursday';
COMMENT ON COLUMN cleaners.available_friday IS 'Available for bookings on Friday';
COMMENT ON COLUMN cleaners.available_saturday IS 'Available for bookings on Saturday';
COMMENT ON COLUMN cleaners.available_sunday IS 'Available for bookings on Sunday';
COMMENT ON COLUMN cleaners.hire_date IS 'Date when cleaner was hired';








