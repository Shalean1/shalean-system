-- Fix cleaner earnings for specific booking
-- Booking details:
-- - Date: Sunday, December 21, 2025 at 8:00 AM
-- - Location: 39 Harvey Road, 45, Sea Point
-- - Client: Farai Chitekedza
-- - Service: Standard
-- - Status: Confirmed
-- - Amount: R770.00

-- ============================================================================
-- STEP 1: Find the booking
-- ============================================================================
DO $$
DECLARE
  v_booking_id TEXT;
  v_booking_ref TEXT;
  v_cleaner_id TEXT;
BEGIN
  -- Find booking by date, location, and client name
  SELECT 
    id,
    booking_reference,
    assigned_cleaner_id
  INTO v_booking_id, v_booking_ref, v_cleaner_id
  FROM bookings
  WHERE scheduled_date = '2025-12-21'
    AND scheduled_time = '08:00'
    AND street_address ILIKE '%39 Harvey Road%'
    AND suburb ILIKE '%Sea Point%'
    AND contact_first_name ILIKE '%Farai%'
    AND contact_last_name ILIKE '%Chitekedza%'
    AND service_type = 'standard'
  LIMIT 1;

  -- Check if booking was found
  IF v_booking_id IS NULL THEN
    RAISE NOTICE 'Booking not found. Trying alternative search...';
    
    -- Try broader search
    SELECT 
      id,
      booking_reference,
      assigned_cleaner_id
    INTO v_booking_id, v_booking_ref, v_cleaner_id
    FROM bookings
    WHERE scheduled_date = '2025-12-21'
      AND street_address ILIKE '%Harvey Road%'
      AND contact_first_name ILIKE '%Farai%'
      AND service_type = 'standard'
    LIMIT 1;
  END IF;

  IF v_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found. Please check the booking details.';
  END IF;

  RAISE NOTICE 'Found booking: ID=%, Reference=%, Cleaner=%', v_booking_id, v_booking_ref, v_cleaner_id;

  -- Check if cleaner is assigned
  IF v_cleaner_id IS NULL THEN
    RAISE WARNING 'No cleaner assigned to this booking. Cannot calculate earnings.';
    RETURN;
  END IF;

  -- ============================================================================
  -- STEP 2: Recalculate cleaner earnings using the backfill function
  -- ============================================================================
  RAISE NOTICE 'Recalculating cleaner earnings for booking %...', v_booking_ref;
  
  IF backfill_cleaner_earnings_for_booking(v_booking_id) THEN
    RAISE NOTICE 'Successfully recalculated cleaner earnings for booking %', v_booking_ref;
    
    -- Display the updated earnings (will be shown in final SELECT query)
    RAISE NOTICE 'Earnings recalculation completed successfully!';
  ELSE
    RAISE EXCEPTION 'Failed to recalculate cleaner earnings for booking %', v_booking_ref;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Display the updated booking details
-- ============================================================================
SELECT 
  booking_reference,
  service_type,
  scheduled_date,
  scheduled_time,
  street_address,
  suburb,
  contact_first_name || ' ' || contact_last_name AS client_name,
  assigned_cleaner_id,
  total_amount,
  cleaner_earnings,
  cleaner_earnings_percentage,
  subtotal,
  frequency_discount,
  service_fee,
  tip_amount,
  status
FROM bookings
WHERE scheduled_date = '2025-12-21'
  AND scheduled_time = '08:00'
  AND street_address ILIKE '%Harvey Road%'
  AND contact_first_name ILIKE '%Farai%'
  AND service_type = 'standard'
LIMIT 1;














