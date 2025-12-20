-- Assign cleaners to unassigned bookings with "no-preference"
-- This script distributes bookings evenly among available cleaners

-- ============================================================================
-- STEP 1: Preview what will be assigned (DRY RUN)
-- ============================================================================
-- Run this first to see what assignments will be made before actually updating

WITH unassigned_bookings AS (
  SELECT 
    b.booking_reference,
    b.scheduled_date,
    b.scheduled_time,
    b.cleaner_preference,
    ROW_NUMBER() OVER (ORDER BY b.scheduled_date, b.scheduled_time) as booking_num
  FROM bookings b
  WHERE b.assigned_cleaner_id IS NULL
    AND b.cleaner_preference = 'no-preference'
),
available_cleaners AS (
  SELECT 
    cleaner_id,
    name,
    ROW_NUMBER() OVER (ORDER BY display_order) as cleaner_num,
    COUNT(*) OVER () as total_cleaners
  FROM cleaners
  WHERE cleaner_id != 'no-preference'
    AND is_active = true
    AND is_available = true
)
SELECT 
  ub.booking_reference,
  ub.scheduled_date,
  ub.scheduled_time,
  ac.cleaner_id as assigned_cleaner_id,
  ac.name as assigned_cleaner_name,
  'PREVIEW - No changes made yet' as status
FROM unassigned_bookings ub
CROSS JOIN LATERAL (
  SELECT cleaner_id, name
  FROM available_cleaners
  WHERE cleaner_num = ((ub.booking_num - 1) % total_cleaners) + 1
  LIMIT 1
) ac
ORDER BY ub.scheduled_date, ub.scheduled_time;

-- ============================================================================
-- STEP 2: Actually assign cleaners (UNCOMMENT TO RUN)
-- ============================================================================
-- Uncomment the code below and run it to actually update the bookings

/*
WITH unassigned_bookings AS (
  SELECT 
    b.id,
    b.booking_reference,
    ROW_NUMBER() OVER (ORDER BY b.scheduled_date, b.scheduled_time) as booking_num
  FROM bookings b
  WHERE b.assigned_cleaner_id IS NULL
    AND b.cleaner_preference = 'no-preference'
),
available_cleaners AS (
  SELECT 
    cleaner_id,
    ROW_NUMBER() OVER (ORDER BY display_order) as cleaner_num,
    COUNT(*) OVER () as total_cleaners
  FROM cleaners
  WHERE cleaner_id != 'no-preference'
    AND is_active = true
    AND is_available = true
),
assignments AS (
  SELECT 
    ub.id as booking_id,
    ub.booking_reference,
    ac.cleaner_id as assigned_cleaner_id
  FROM unassigned_bookings ub
  CROSS JOIN LATERAL (
    SELECT cleaner_id
    FROM available_cleaners
    WHERE cleaner_num = ((ub.booking_num - 1) % total_cleaners) + 1
    LIMIT 1
  ) ac
)
UPDATE bookings b
SET assigned_cleaner_id = a.assigned_cleaner_id,
    updated_at = NOW()
FROM assignments a
WHERE b.id = a.booking_id
RETURNING 
  b.booking_reference,
  b.assigned_cleaner_id,
  'ASSIGNED' as status;
*/

-- ============================================================================
-- ALTERNATIVE: Assign specific cleaner to all unassigned bookings
-- ============================================================================
-- If you want to assign all unassigned bookings to a specific cleaner (e.g., 'natasha-m')
-- Uncomment and modify the cleaner_id below:

/*
UPDATE bookings
SET assigned_cleaner_id = 'natasha-m',  -- Change this to desired cleaner_id
    updated_at = NOW()
WHERE assigned_cleaner_id IS NULL
  AND cleaner_preference = 'no-preference'
RETURNING 
  booking_reference,
  assigned_cleaner_id,
  'ASSIGNED' as status;
*/

-- ============================================================================
-- VERIFY: Check assignments after running
-- ============================================================================
SELECT 
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  c.name as assigned_cleaner_name,
  CASE 
    WHEN b.assigned_cleaner_id IS NULL THEN 'STILL UNASSIGNED'
    ELSE 'ASSIGNED'
  END as assignment_status
FROM bookings b
LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
WHERE b.assigned_cleaner_id IS NULL
ORDER BY b.scheduled_date, b.scheduled_time;
