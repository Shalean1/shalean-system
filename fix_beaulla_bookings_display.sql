-- Quick fix to ensure Beaulla's bookings display in cleaner dashboard
-- This script fixes the most common issues preventing bookings from showing

-- ============================================================================
-- STEP 1: Verify 'beaul' cleaner exists in cleaners table
-- ============================================================================
SELECT 
  'CLEANER CHECK' as step,
  cleaner_id,
  name,
  is_active,
  is_available
FROM cleaners
WHERE cleaner_id = 'beaul' OR LOWER(cleaner_id) = 'beaul';

-- If no results, create/update the cleaner:
INSERT INTO cleaners (cleaner_id, name, bio, rating, total_jobs, display_order, is_active, is_available)
VALUES (
  'beaul',
  'Beaul (Beaulla Chemugarira)',
  'Detail-oriented cleaner with excellent customer reviews',
  3.10,
  86,
  3,
  true,
  true
)
ON CONFLICT (cleaner_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = true,
  is_available = true
RETURNING cleaner_id, name, 'CREATED OR UPDATED' as status;

-- ============================================================================
-- STEP 2: Find Beaulla's profile(s) that need fixing
-- ============================================================================
SELECT 
  'PROFILE CHECK' as step,
  p.id as user_id,
  p.cleaner_id as current_cleaner_id,
  p.phone,
  p.email,
  u.email as auth_email,
  u.phone as auth_phone,
  CASE 
    WHEN p.cleaner_id = 'beaul' THEN '✓ CORRECT'
    WHEN p.cleaner_id IS NULL THEN '✗ MISSING CLEANER_ID'
    WHEN LOWER(p.cleaner_id) = 'beaul' THEN '✗ CASE MISMATCH'
    ELSE '✗ WRONG VALUE: ' || p.cleaner_id
  END as status
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE 
  -- Match common patterns for Beaulla
  (p.phone LIKE '%27825%' OR u.phone LIKE '%27825%')
  OR (p.email ILIKE '%beaulla%' OR u.email ILIKE '%beaulla%')
  OR (u.raw_user_meta_data->>'full_name' ILIKE '%beaulla%')
  OR (p.cleaner_id IS NOT NULL AND (LOWER(p.cleaner_id) = 'beaul' OR p.cleaner_id = 'beaulla-chemugarira'))
ORDER BY 
  CASE 
    WHEN p.cleaner_id = 'beaul' THEN 1
    ELSE 2
  END;

-- ============================================================================
-- STEP 3: Fix case mismatches and 'beaulla-chemugarira' -> 'beaul'
-- ============================================================================
-- Fix case mismatches (e.g., 'Beaul' -> 'beaul')
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE LOWER(cleaner_id) = 'beaul'
  AND cleaner_id != 'beaul'
RETURNING 
  id,
  cleaner_id as new_cleaner_id,
  phone,
  email,
  'CASE FIXED' as action;

-- Fix 'beaulla-chemugarira' -> 'beaul' (the main issue!)
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE cleaner_id = 'beaulla-chemugarira'
RETURNING 
  id,
  cleaner_id as new_cleaner_id,
  phone,
  email,
  'FIXED: beaulla-chemugarira -> beaul' as action;

-- ============================================================================
-- STEP 4: Count bookings assigned to 'beaul' (should show bookings)
-- ============================================================================
SELECT 
  'BOOKINGS COUNT' as step,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN scheduled_date::DATE < CURRENT_DATE THEN 1 END) as past_bookings,
  COUNT(CASE WHEN scheduled_date::DATE = CURRENT_DATE THEN 1 END) as today_bookings,
  COUNT(CASE WHEN scheduled_date::DATE > CURRENT_DATE THEN 1 END) as upcoming_bookings,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_bookings,
  COUNT(CASE WHEN status IN ('pending', 'confirmed') AND scheduled_date::DATE >= CURRENT_DATE THEN 1 END) as upcoming_confirmed_bookings
FROM bookings
WHERE assigned_cleaner_id = 'beaul';

-- ============================================================================
-- STEP 5: Show sample bookings to verify
-- ============================================================================
SELECT 
  'SAMPLE BOOKINGS' as step,
  booking_reference,
  scheduled_date,
  scheduled_time,
  service_type,
  status,
  payment_status,
  CASE 
    WHEN scheduled_date::DATE < CURRENT_DATE THEN 'PAST'
    WHEN scheduled_date::DATE = CURRENT_DATE THEN 'TODAY'
    WHEN scheduled_date::DATE > CURRENT_DATE THEN 'UPCOMING'
  END as booking_period,
  CASE 
    WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN true
    ELSE false
  END as is_new
FROM bookings
WHERE assigned_cleaner_id = 'beaul'
ORDER BY scheduled_date DESC, scheduled_time DESC
LIMIT 20;

-- ============================================================================
-- STEP 6: Manual fix - Update profile by user ID
-- ============================================================================
-- If you know Beaulla's user ID from STEP 2, run this:
-- Replace 'USER_ID_HERE' with the actual UUID from STEP 2

-- UPDATE profiles
-- SET cleaner_id = 'beaul',
--     updated_at = NOW()
-- WHERE id = 'USER_ID_HERE'::uuid
-- RETURNING id, cleaner_id, phone, email, 'PROFILE FIXED' as status;

-- ============================================================================
-- STEP 7: Verify the fix worked
-- ============================================================================
-- After updating the profile, verify with this query:
SELECT 
  'VERIFICATION' as step,
  p.id as user_id,
  p.cleaner_id,
  p.phone,
  p.email,
  c.name as cleaner_name,
  COUNT(b.booking_reference) as assigned_bookings_count,
  COUNT(CASE WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 1 END) as past_count,
  COUNT(CASE WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 1 END) as today_count,
  COUNT(CASE WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 1 END) as upcoming_count
FROM profiles p
LEFT JOIN cleaners c ON c.cleaner_id = p.cleaner_id
LEFT JOIN bookings b ON b.assigned_cleaner_id = p.cleaner_id
WHERE p.cleaner_id = 'beaul'
GROUP BY p.id, p.cleaner_id, p.phone, p.email, c.name;
