-- QUICK FIX: Change Beaulla's cleaner_id from 'beaulla-chemugarira' to 'beaul'
-- This will immediately fix the bookings display issue

-- ============================================================================
-- STEP 1: Check current state
-- ============================================================================
SELECT 
  p.id,
  p.cleaner_id as current_cleaner_id,
  p.phone,
  p.email,
  COUNT(b.booking_reference) as bookings_with_current_id
FROM profiles p
LEFT JOIN bookings b ON b.assigned_cleaner_id = p.cleaner_id
WHERE p.cleaner_id = 'beaulla-chemugarira'
GROUP BY p.id, p.cleaner_id, p.phone, p.email;

-- Check bookings assigned to 'beaul'
SELECT 
  COUNT(*) as bookings_assigned_to_beaul
FROM bookings
WHERE assigned_cleaner_id = 'beaul';

-- ============================================================================
-- STEP 2: FIX IT - Update profile to use 'beaul'
-- ============================================================================
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE cleaner_id = 'beaulla-chemugarira'
RETURNING 
  id,
  cleaner_id as new_cleaner_id,
  phone,
  email,
  'SUCCESS: Updated to beaul' as status;

-- ============================================================================
-- STEP 3: Verify the fix
-- ============================================================================
SELECT 
  p.id,
  p.cleaner_id,
  p.phone,
  p.email,
  COUNT(b.booking_reference) as total_bookings,
  COUNT(CASE WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 1 END) as past_bookings,
  COUNT(CASE WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 1 END) as today_bookings,
  COUNT(CASE WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 1 END) as upcoming_bookings,
  COUNT(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_bookings
FROM profiles p
LEFT JOIN bookings b ON b.assigned_cleaner_id = p.cleaner_id
WHERE p.cleaner_id = 'beaul'
GROUP BY p.id, p.cleaner_id, p.phone, p.email;
