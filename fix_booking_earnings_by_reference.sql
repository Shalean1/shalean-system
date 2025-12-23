-- Alternative: Fix cleaner earnings by booking reference
-- Usage: Replace 'BOOKING_REFERENCE_HERE' with the actual booking reference
-- You can find the booking reference from the booking details page

-- ============================================================================
-- OPTION 1: Fix by booking reference (recommended if you know it)
-- ============================================================================
DO $$
DECLARE
  v_booking_id TEXT;
  v_booking_ref TEXT := 'BOOKING_REFERENCE_HERE'; -- Replace with actual booking reference
  v_cleaner_id TEXT;
BEGIN
  -- Find booking by reference
  SELECT 
    id,
    assigned_cleaner_id
  INTO v_booking_id, v_cleaner_id
  FROM bookings
  WHERE booking_reference = v_booking_ref;

  IF v_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking with reference % not found', v_booking_ref;
  END IF;

  IF v_cleaner_id IS NULL THEN
    RAISE EXCEPTION 'No cleaner assigned to booking %. Cannot calculate earnings.', v_booking_ref;
  END IF;

  RAISE NOTICE 'Found booking: ID=%, Reference=%, Cleaner=%', v_booking_id, v_booking_ref, v_cleaner_id;
  RAISE NOTICE 'Recalculating cleaner earnings...';
  
  IF backfill_cleaner_earnings_for_booking(v_booking_id) THEN
    RAISE NOTICE 'Successfully recalculated cleaner earnings for booking %', v_booking_ref;
  ELSE
    RAISE EXCEPTION 'Failed to recalculate cleaner earnings for booking %', v_booking_ref;
  END IF;
END $$;

-- Display updated booking
SELECT 
  booking_reference,
  service_type,
  scheduled_date,
  scheduled_time,
  street_address || ', ' || COALESCE(apt_unit || ', ', '') || suburb AS address,
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
WHERE booking_reference = 'BOOKING_REFERENCE_HERE'; -- Replace with actual booking reference





