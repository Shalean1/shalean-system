-- Check assigned cleaners for bookings (past, today, upcoming)
-- This query shows bookings grouped by date status with cleaner assignments

-- ============================================================================
-- PAST BOOKINGS (before today)
-- ============================================================================
SELECT 
  'PAST' as booking_status,
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.service_type,
  b.contact_first_name || ' ' || b.contact_last_name as customer_name,
  b.contact_email,
  b.contact_phone,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  c.name as assigned_cleaner_name,
  b.status,
  b.payment_status,
  b.total_amount,
  b.created_at
FROM bookings b
LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
WHERE b.scheduled_date::DATE < CURRENT_DATE
ORDER BY b.scheduled_date DESC, b.scheduled_time DESC;

-- ============================================================================
-- TODAY'S BOOKINGS
-- ============================================================================
SELECT 
  'TODAY' as booking_status,
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.service_type,
  b.contact_first_name || ' ' || b.contact_last_name as customer_name,
  b.contact_email,
  b.contact_phone,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  c.name as assigned_cleaner_name,
  b.status,
  b.payment_status,
  b.total_amount,
  b.created_at
FROM bookings b
LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
WHERE b.scheduled_date::DATE = CURRENT_DATE
ORDER BY b.scheduled_time ASC;

-- ============================================================================
-- UPCOMING BOOKINGS (after today)
-- ============================================================================
SELECT 
  'UPCOMING' as booking_status,
  b.booking_reference,
  b.scheduled_date,
  b.scheduled_time,
  b.service_type,
  b.contact_first_name || ' ' || b.contact_last_name as customer_name,
  b.contact_email,
  b.contact_phone,
  b.cleaner_preference,
  b.assigned_cleaner_id,
  c.name as assigned_cleaner_name,
  b.status,
  b.payment_status,
  b.total_amount,
  b.created_at
FROM bookings b
LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
WHERE b.scheduled_date::DATE > CURRENT_DATE
ORDER BY b.scheduled_date ASC, b.scheduled_time ASC;

-- ============================================================================
-- SUMMARY: Count of bookings by status and cleaner assignment
-- ============================================================================
WITH booking_periods AS (
  SELECT 
    CASE 
      WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 'PAST'
      WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 'TODAY'
      WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 'UPCOMING'
    END as booking_period,
    b.assigned_cleaner_id
  FROM bookings b
)
SELECT 
  booking_period,
  COUNT(*) as total_bookings,
  COUNT(assigned_cleaner_id) as bookings_with_assigned_cleaner,
  COUNT(*) - COUNT(assigned_cleaner_id) as bookings_without_assigned_cleaner,
  COUNT(DISTINCT assigned_cleaner_id) as unique_cleaners_assigned
FROM booking_periods
GROUP BY booking_period
ORDER BY 
  CASE 
    WHEN booking_period = 'PAST' THEN 1
    WHEN booking_period = 'TODAY' THEN 2
    WHEN booking_period = 'UPCOMING' THEN 3
  END;

-- ============================================================================
-- DETAILED BREAKDOWN: Bookings by cleaner assignment status
-- ============================================================================
WITH booking_details AS (
  SELECT 
    CASE 
      WHEN b.scheduled_date::DATE < CURRENT_DATE THEN 'PAST'
      WHEN b.scheduled_date::DATE = CURRENT_DATE THEN 'TODAY'
      WHEN b.scheduled_date::DATE > CURRENT_DATE THEN 'UPCOMING'
    END as booking_period,
    b.assigned_cleaner_id,
    b.booking_reference,
    b.scheduled_date,
    b.scheduled_time,
    c.name as cleaner_name
  FROM bookings b
  LEFT JOIN cleaners c ON b.assigned_cleaner_id = c.cleaner_id
)
SELECT 
  booking_period,
  COALESCE(cleaner_name, 'NO CLEANER ASSIGNED') as cleaner_name,
  COALESCE(assigned_cleaner_id, 'NULL') as cleaner_id,
  COUNT(*) as booking_count,
  STRING_AGG(booking_reference, ', ' ORDER BY scheduled_date, scheduled_time) as booking_references
FROM booking_details
GROUP BY 
  booking_period,
  cleaner_name,
  assigned_cleaner_id
ORDER BY 
  CASE 
    WHEN booking_period = 'PAST' THEN 1
    WHEN booking_period = 'TODAY' THEN 2
    WHEN booking_period = 'UPCOMING' THEN 3
  END,
  COALESCE(cleaner_name, 'NO CLEANER ASSIGNED');
