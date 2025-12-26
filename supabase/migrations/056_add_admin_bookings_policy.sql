-- Migration: Add Admin Policy for Bookings
-- Created: 2025-01-XX
-- Description: Allows admins to view and manage all bookings

-- Policy: Admins can view all bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update all bookings
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
CREATE POLICY "Admins can update all bookings" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can delete all bookings
DROP POLICY IF EXISTS "Admins can delete all bookings" ON bookings;
CREATE POLICY "Admins can delete all bookings" ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );











