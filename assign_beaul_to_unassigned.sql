-- Assign all unassigned bookings to Beaul (Beaulla Chemugarira)
-- Cleaner ID: 'beaul'

-- ============================================================================
-- STEP 0: Check existing cleaners and create Beaul if needed
-- ============================================================================
-- First, check what cleaners exist in the database
SELECT 
  cleaner_id,
  name,
  is_active,
  is_available
FROM cleaners
ORDER BY display_order;

-- Create Beaul cleaner if it doesn't exist
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

-- Verify Beaul cleaner exists
SELECT 
  cleaner_id,
  name,
  is_active,
  is_available,
  'READY FOR ASSIGNMENT' as status
FROM cleaners
WHERE cleaner_id = 'beaul';

-- ============================================================================
-- STEP 1: Preview what will be assigned (DRY RUN)
-- ============================================================================
-- Run this first to see which bookings will be assigned to Beaul

SELECT 
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.service_type,
  b.contact_first_name || ' ' || b.contact_last_name as customer_name,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  'beaul' as will_be_assigned_to,
  'Beaul (Beaulla Chemugarira)' as cleaner_name,
  'PREVIEW - No changes made yet' as status
FROM bookings b
WHERE b.assigned_cleaner_id IS NULL
ORDER BY b.scheduled_date, b.scheduled_time;

-- ============================================================================
-- STEP 2: Actually assign Beaul to all unassigned bookings
-- ============================================================================
-- Run this to update all unassigned bookings with Beaul's cleaner_id

UPDATE bookings
SET assigned_cleaner_id = 'beaul',
    updated_at = NOW()
WHERE assigned_cleaner_id IS NULL
RETURNING 
  booking_reference,
  scheduled_date,
  scheduled_time,
  assigned_cleaner_id,
  'ASSIGNED TO BEAUL' as status;

-- ============================================================================
-- VERIFY: Check assignments after running
-- ============================================================================
-- Run this to verify all bookings are now assigned

SELECT 
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  c.name as assigned_cleaner_name,
  CASE 
    WHEN b.assigned_cleaner_id IS NULL THEN 'STILL UNASSIGNED'
    WHEN b.assigned_cleaner_id = 'beaul' THEN 'ASSIGNED TO BEAUL ✓'
    ELSE 'ASSIGNED TO OTHER CLEANER'
  END as assignment_status
FROM bookings b
LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
WHERE b.assigned_cleaner_id IS NULL OR b.assigned_cleaner_id = 'beaul'
ORDER BY b.scheduled_date, b.scheduled_time;
