-- Migration: Cleaner Dashboard Support
-- Created: 2025-01-XX
-- Description: Add cleaner assignment tracking and authentication support

-- ============================================================================
-- 1. ADD ASSIGNED_CLEANER_ID TO BOOKINGS
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS assigned_cleaner_id TEXT REFERENCES cleaners(cleaner_id);

CREATE INDEX IF NOT EXISTS idx_bookings_assigned_cleaner ON bookings(assigned_cleaner_id);

-- ============================================================================
-- 2. ADD CLEANER_ID TO PROFILES
-- ============================================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cleaner_id TEXT REFERENCES cleaners(cleaner_id);

CREATE INDEX IF NOT EXISTS idx_profiles_cleaner_id ON profiles(cleaner_id);

-- Add unique constraint on phone for cleaner accounts (where cleaner_id is not null)
-- Note: This allows multiple regular users with same phone, but cleaners must have unique phones
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cleaner_phone_unique 
ON profiles(phone) 
WHERE cleaner_id IS NOT NULL AND phone IS NOT NULL;

-- ============================================================================
-- 3. RLS POLICIES FOR CLEANER BOOKINGS
-- ============================================================================

-- Policy: Cleaners can view bookings assigned to them
DROP POLICY IF EXISTS "Cleaners can view assigned bookings" ON bookings;
CREATE POLICY "Cleaners can view assigned bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  );

-- Policy: Cleaners can update status of bookings assigned to them
DROP POLICY IF EXISTS "Cleaners can update assigned booking status" ON bookings;
CREATE POLICY "Cleaners can update assigned booking status" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  );

-- Policy: Cleaners can view their own profile
DROP POLICY IF EXISTS "Cleaners can view own profile" ON profiles;
CREATE POLICY "Cleaners can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Cleaners can update their own profile
DROP POLICY IF EXISTS "Cleaners can update own profile" ON profiles;
CREATE POLICY "Cleaners can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 4. HELPER FUNCTION: Get cleaner_id from user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_cleaner_id_from_user()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT cleaner_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND cleaner_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN bookings.assigned_cleaner_id IS 'The cleaner_id assigned to complete this booking (may differ from cleaner_preference)';
COMMENT ON COLUMN profiles.cleaner_id IS 'Links user account to cleaner record if this is a cleaner account';
