-- Fix Beaulla Chemugarira's cleaner profile and verify bookings
-- This script ensures the profile has the correct cleaner_id to match bookings

-- ============================================================================
-- STEP 1: Check Beaulla's current profile status
-- ============================================================================
SELECT 
  'PROFILE CHECK' as check_type,
  p.id as user_id,
  p.cleaner_id as profile_cleaner_id,
  p.phone,
  p.email,
  c.cleaner_id as cleaners_table_id,
  c.name as cleaner_name,
  c.is_active,
  c.is_available,
  CASE 
    WHEN p.cleaner_id IS NULL THEN 'MISSING CLEANER_ID IN PROFILE'
    WHEN p.cleaner_id != 'beaul' THEN 'WRONG CLEANER_ID IN PROFILE'
    WHEN c.cleaner_id IS NULL THEN 'CLEANER NOT FOUND IN CLEANERS TABLE'
    ELSE 'OK'
  END as status
FROM profiles p
LEFT JOIN cleaners c ON p.cleaner_id = c.cleaner_id
WHERE p.phone LIKE '%27825%' OR p.email LIKE '%beaulla%' OR p.cleaner_id = 'beaul'
ORDER BY p.cleaner_id;

-- ============================================================================
-- STEP 2: Check bookings assigned to 'beaul'
-- ============================================================================
SELECT 
  'BOOKINGS CHECK' as check_type,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN scheduled_date::DATE < CURRENT_DATE THEN 1 END) as past_bookings,
  COUNT(CASE WHEN scheduled_date::DATE = CURRENT_DATE THEN 1 END) as today_bookings,
  COUNT(CASE WHEN scheduled_date::DATE > CURRENT_DATE THEN 1 END) as upcoming_bookings,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_bookings
FROM bookings
WHERE assigned_cleaner_id = 'beaul';

-- ============================================================================
-- STEP 3: Show sample bookings for beaul
-- ============================================================================
SELECT 
  'SAMPLE BOOKINGS' as check_type,
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
LIMIT 10;

-- ============================================================================
-- STEP 4: Find profiles that might be Beaulla (by name or phone pattern)
-- ============================================================================
-- This helps identify which profile belongs to Beaulla
SELECT 
  'FINDING BEAULLA PROFILE' as step,
  p.id as user_id,
  p.cleaner_id as current_cleaner_id,
  p.phone,
  p.email,
  u.phone as auth_phone,
  u.email as auth_email,
  u.raw_user_meta_data->>'full_name' as auth_name,
  CASE 
    WHEN p.cleaner_id = 'beaul' THEN 'ALREADY CORRECT'
    WHEN p.cleaner_id IS NULL THEN 'NEEDS CLEANER_ID'
    WHEN LOWER(p.cleaner_id) = 'beaul' THEN 'CASE MISMATCH'
    ELSE 'WRONG CLEANER_ID'
  END as status
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE 
  -- Match by phone pattern (adjust as needed)
  (p.phone LIKE '%27825%' OR u.phone LIKE '%27825%')
  -- Or match by email/name
  OR (p.email ILIKE '%beaulla%' OR u.email ILIKE '%beaulla%')
  OR (u.raw_user_meta_data->>'full_name' ILIKE '%beaulla%')
  -- Or match by cleaner_id variations
  OR LOWER(p.cleaner_id) = 'beaul'
ORDER BY 
  CASE 
    WHEN p.cleaner_id = 'beaul' THEN 1
    WHEN LOWER(p.cleaner_id) = 'beaul' THEN 2
    WHEN p.cleaner_id IS NULL THEN 3
    ELSE 4
  END;

-- ============================================================================
-- STEP 5: Fix Beaulla's profile - Update cleaner_id to 'beaul'
-- ============================================================================
-- IMPORTANT: Review the results from STEP 4 before running this!
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from STEP 4

-- Option A: Update by specific user ID (SAFEST - Recommended)
-- UPDATE profiles
-- SET cleaner_id = 'beaul',
--     updated_at = NOW()
-- WHERE id = 'YOUR_USER_ID_HERE'::uuid
--   AND (cleaner_id IS NULL OR LOWER(cleaner_id) != 'beaul')
-- RETURNING id, cleaner_id, phone, email;

-- Option B: Update by phone pattern (if you're sure about the phone)
-- UPDATE profiles p
-- SET cleaner_id = 'beaul',
--     updated_at = NOW()
-- WHERE (p.phone LIKE '%27825%' OR EXISTS (
--   SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.phone LIKE '%27825%'
-- ))
--   AND (p.cleaner_id IS NULL OR LOWER(p.cleaner_id) != 'beaul')
-- RETURNING id, cleaner_id, phone, email;

-- Option C: Update all profiles with case-insensitive match to 'beaul'
-- This fixes case mismatches (e.g., 'Beaul' -> 'beaul')
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE LOWER(cleaner_id) = 'beaul'
  AND cleaner_id != 'beaul'
RETURNING id, cleaner_id, phone, email;

-- ============================================================================
-- STEP 5: Verify the fix
-- ============================================================================
-- After running the UPDATE, verify with this query:
SELECT 
  'VERIFICATION' as check_type,
  p.id as user_id,
  p.cleaner_id,
  p.phone,
  p.email,
  c.name as cleaner_name,
  COUNT(b.booking_reference) as assigned_bookings_count
FROM profiles p
LEFT JOIN cleaners c ON p.cleaner_id = c.cleaner_id
LEFT JOIN bookings b ON b.assigned_cleaner_id = p.cleaner_id
WHERE p.cleaner_id = 'beaul'
GROUP BY p.id, p.cleaner_id, p.phone, p.email, c.name;
