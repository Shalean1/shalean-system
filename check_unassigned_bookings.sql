-- Check unassigned bookings with their cleaner preferences
-- This helps identify which bookings need cleaner assignments

-- ============================================================================
-- UNASSIGNED BOOKINGS WITH CLEANER PREFERENCES
-- ============================================================================
SELECT 
  CASE 
    WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 'PAST'
    WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 'TODAY'
    WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 'UPCOMING'
  END as booking_period,
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.service_type,
  b.contact_first_name || ' ' || b.contact_last_name as customer_name,
  b.contact_email,
  b.contact_phone,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  b.status,
  b.payment_status,
  b.total_amount,
  b.created_at
FROM bookings b
WHERE b.assigned_cleaner_id IS NULL
ORDER BY 
  CASE 
    WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 1
    WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 2
    WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 3
  END,
  b.scheduled_date ASC,
  b.scheduled_time ASC;

-- ============================================================================
-- SUMMARY: Unassigned bookings by preference
-- ============================================================================
SELECT 
  b.cleaner_preference,
  COUNT(*) as unassigned_count,
  STRING_AGG(b.booking_reference, ', ' ORDER BY b.scheduled_date, b.scheduled_time) as booking_references
FROM bookings b
WHERE b.assigned_cleaner_id IS NULL
GROUP BY b.cleaner_preference
ORDER BY unassigned_count DESC;

-- ============================================================================
-- CHECK: Bookings where preference doesn't match assignment
-- ============================================================================
SELECT 
  b.booking_reference,
  b.scheduled_date,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  CASE 
    WHEN b.cleaner_preference != 'no-preference' AND b.assigned_cleaner_id IS NULL THEN 'PREFERENCE NOT ASSIGNED'
    WHEN b.cleaner_preference != 'no-preference' AND b.assigned_cleaner_id != b.cleaner_preference THEN 'PREFERENCE MISMATCH'
    WHEN b.cleaner_preference = 'no-preference' AND b.assigned_cleaner_id IS NULL THEN 'NO PREFERENCE, NO ASSIGNMENT'
    ELSE 'OK'
  END as assignment_status
FROM bookings b
WHERE 
  (b.cleaner_preference != 'no-preference' AND (b.assigned_cleaner_id IS NULL OR b.assigned_cleaner_id != b.cleaner_preference))
  OR (b.cleaner_preference = 'no-preference' AND b.assigned_cleaner_id IS NULL)
ORDER BY b.scheduled_date ASC;
