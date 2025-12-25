-- Verification Query: Check if bookings were imported correctly
-- Run this in Supabase SQL Editor to verify the import

-- 1. Check total count of bookings
SELECT COUNT(*) as total_bookings FROM bookings;

-- 2. Check bookings by status
SELECT 
  status,
  COUNT(*) as count
FROM bookings
GROUP BY status
ORDER BY count DESC;

-- 3. Check bookings by service type
SELECT 
  service_type,
  COUNT(*) as count
FROM bookings
GROUP BY service_type
ORDER BY count DESC;

-- 4. Check a few sample records
SELECT 
  id,
  booking_reference,
  service_type,
  frequency,
  contact_first_name,
  contact_last_name,
  contact_email,
  total_amount,
  status,
  payment_status,
  created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check for any NULL required fields
SELECT 
  COUNT(*) as bookings_with_null_first_name
FROM bookings 
WHERE contact_first_name IS NULL;

SELECT 
  COUNT(*) as bookings_with_null_email
FROM bookings 
WHERE contact_email IS NULL;

SELECT 
  COUNT(*) as bookings_with_null_street_address
FROM bookings 
WHERE street_address IS NULL;

-- 6. Check bookings with assigned cleaners
SELECT 
  COUNT(*) as bookings_with_cleaner,
  COUNT(*) FILTER (WHERE assigned_cleaner_id IS NULL) as bookings_without_cleaner
FROM bookings;

-- 7. Check date range of imported bookings
SELECT 
  MIN(created_at) as earliest_booking,
  MAX(created_at) as latest_booking,
  COUNT(*) as total_count
FROM bookings;







