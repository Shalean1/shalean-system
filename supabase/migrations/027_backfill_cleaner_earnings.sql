-- Migration: Backfill Cleaner Earnings for Existing Bookings
-- Created: 2025-01-XX
-- Description: Recalculate and backfill cleaner earnings for existing bookings
--              This uses current pricing configuration to recalculate earnings

-- ============================================================================
-- 0. ENSURE REQUIRED COLUMNS EXIST (in case migration 026 hasn't run)
-- ============================================================================
-- Add price breakdown columns if they don't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS frequency_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_code_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10, 2) DEFAULT NULL;

-- Add cleaner earnings columns if they don't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cleaner_earnings DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cleaner_earnings_percentage DECIMAL(5, 2) DEFAULT NULL;

-- Create indexes for earnings queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_earnings ON bookings(cleaner_earnings);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_cleaner_earnings ON bookings(assigned_cleaner_id, cleaner_earnings) WHERE assigned_cleaner_id IS NOT NULL;

-- ============================================================================
-- FUNCTION: BACKFILL CLEANER EARNINGS FOR A BOOKING
-- ============================================================================
CREATE OR REPLACE FUNCTION backfill_cleaner_earnings_for_booking(p_booking_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking RECORD;
  v_cleaner RECORD;
  v_base_price DECIMAL(10, 2);
  v_room_price DECIMAL(10, 2);
  v_extras_price DECIMAL(10, 2);
  v_subtotal DECIMAL(10, 2);
  v_frequency_discount_rate DECIMAL(5, 4);
  v_frequency_discount DECIMAL(10, 2);
  v_discount_code_discount DECIMAL(10, 2);
  v_discounted_subtotal DECIMAL(10, 2);
  v_service_fee_percentage DECIMAL(5, 4);
  v_service_fee DECIMAL(10, 2);
  v_earnings_base DECIMAL(10, 2);
  v_old_cleaner_threshold INTEGER;
  v_is_old_cleaner BOOLEAN;
  v_earnings_percentage DECIMAL(5, 2);
  v_cleaner_earnings DECIMAL(10, 2);
  v_tip DECIMAL(10, 2);
  v_total_earnings DECIMAL(10, 2);
BEGIN
  -- Get booking data
  SELECT 
    b.*,
    c.total_jobs
  INTO v_booking
  FROM bookings b
  LEFT JOIN cleaners c ON c.cleaner_id = b.assigned_cleaner_id
  WHERE b.id = p_booking_id;

  -- Skip if booking not found or no cleaner assigned
  IF NOT FOUND OR v_booking.assigned_cleaner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Skip if earnings already calculated
  IF v_booking.cleaner_earnings IS NOT NULL THEN
    RETURN true;
  END IF;

  -- Get current pricing configuration
  -- Base price from service_type_pricing
  SELECT base_price INTO v_base_price
  FROM service_type_pricing
  WHERE service_type = v_booking.service_type
  AND is_active = true
  LIMIT 1;

  -- Fallback base price if not found
  IF v_base_price IS NULL THEN
    CASE v_booking.service_type
      WHEN 'standard' THEN v_base_price := 250.00;
      WHEN 'deep' THEN v_base_price := 400.00;
      WHEN 'move-in-out' THEN v_base_price := 500.00;
      WHEN 'airbnb' THEN v_base_price := 350.00;
      ELSE v_base_price := 250.00;
    END CASE;
  END IF;

  -- Calculate room price (using current room_pricing or fallback)
  SELECT 
    COALESCE(
      SUM(CASE WHEN room_type = 'bedroom' THEN price_per_room * v_booking.bedrooms ELSE 0 END) +
      SUM(CASE WHEN room_type = 'bathroom' THEN price_per_room * v_booking.bathrooms ELSE 0 END),
      v_booking.bedrooms * 30 + v_booking.bathrooms * 40
    )
  INTO v_room_price
  FROM room_pricing
  WHERE service_type = v_booking.service_type
  AND is_active = true;

  -- Fallback room price
  IF v_room_price IS NULL THEN
    v_room_price := v_booking.bedrooms * 30 + v_booking.bathrooms * 40;
  END IF;

  -- Calculate extras price
  SELECT COALESCE(SUM(price_modifier), 0)
  INTO v_extras_price
  FROM additional_services
  WHERE service_id = ANY(
    SELECT jsonb_array_elements_text(v_booking.extras)
  )
  AND is_active = true;

  -- Calculate subtotal
  v_subtotal := v_base_price + v_room_price + v_extras_price;

  -- Get frequency discount rate
  SELECT discount_percentage / 100.0 INTO v_frequency_discount_rate
  FROM frequency_options
  WHERE frequency_id = v_booking.frequency
  AND is_active = true
  LIMIT 1;

  IF v_frequency_discount_rate IS NULL THEN
    CASE v_booking.frequency
      WHEN 'weekly' THEN v_frequency_discount_rate := 0.15;
      WHEN 'bi-weekly' THEN v_frequency_discount_rate := 0.10;
      WHEN 'monthly' THEN v_frequency_discount_rate := 0.05;
      ELSE v_frequency_discount_rate := 0;
    END CASE;
  END IF;

  -- Calculate frequency discount
  v_frequency_discount := v_subtotal * v_frequency_discount_rate;

  -- Discount code discount (we can't recalculate exactly, so use stored value or 0)
  v_discount_code_discount := COALESCE(v_booking.discount_code_discount, 0);

  -- Calculate discounted subtotal
  v_discounted_subtotal := v_subtotal - v_frequency_discount - v_discount_code_discount;

  -- Get service fee percentage
  SELECT setting_value::DECIMAL / 100.0 INTO v_service_fee_percentage
  FROM system_settings
  WHERE setting_key = 'service_fee_percentage'
  LIMIT 1;

  IF v_service_fee_percentage IS NULL THEN
    v_service_fee_percentage := 0.10; -- 10% default
  END IF;

  -- Calculate service fee
  v_service_fee := ROUND(v_discounted_subtotal * v_service_fee_percentage);

  -- Calculate earnings base (subtotal - frequency discount - service fee)
  v_earnings_base := v_subtotal - v_frequency_discount - v_service_fee;
  v_earnings_base := GREATEST(0, v_earnings_base); -- Ensure non-negative

  -- Get old cleaner threshold
  SELECT setting_value::INTEGER INTO v_old_cleaner_threshold
  FROM system_settings
  WHERE setting_key = 'old_cleaner_job_threshold'
  LIMIT 1;

  IF v_old_cleaner_threshold IS NULL THEN
    v_old_cleaner_threshold := 50; -- Default threshold
  END IF;

  -- Determine if cleaner is old or new
  v_is_old_cleaner := COALESCE(v_booking.total_jobs, 0) >= v_old_cleaner_threshold;
  v_earnings_percentage := CASE WHEN v_is_old_cleaner THEN 0.70 ELSE 0.60 END;

  -- Calculate cleaner earnings (before tip)
  v_cleaner_earnings := ROUND(v_earnings_base * v_earnings_percentage, 2);

  -- Get tip amount
  v_tip := COALESCE(v_booking.tip_amount, 0);

  -- Total earnings = earnings + tip
  v_total_earnings := v_cleaner_earnings + v_tip;

  -- Update booking with calculated values
  UPDATE bookings
  SET
    subtotal = v_subtotal,
    frequency_discount = ROUND(v_frequency_discount, 2),
    discount_code_discount = v_discount_code_discount,
    service_fee = v_service_fee,
    cleaner_earnings = v_total_earnings,
    cleaner_earnings_percentage = v_earnings_percentage,
    updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error backfilling earnings for booking %: %', p_booking_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- BACKFILL ALL EXISTING BOOKINGS
-- ============================================================================
-- This will backfill earnings for all bookings that:
-- 1. Have an assigned cleaner
-- 2. Don't already have cleaner_earnings calculated
DO $$
DECLARE
  v_booking_id TEXT;
  v_count INTEGER := 0;
  v_total INTEGER := 0;
BEGIN
  -- Count total bookings to process
  SELECT COUNT(*) INTO v_total
  FROM bookings
  WHERE assigned_cleaner_id IS NOT NULL
  AND cleaner_earnings IS NULL;

  RAISE NOTICE 'Starting backfill for % bookings', v_total;

  -- Process each booking
  FOR v_booking_id IN
    SELECT id
    FROM bookings
    WHERE assigned_cleaner_id IS NOT NULL
    AND cleaner_earnings IS NULL
    ORDER BY created_at ASC
  LOOP
    IF backfill_cleaner_earnings_for_booking(v_booking_id) THEN
      v_count := v_count + 1;
    END IF;

    -- Log progress every 100 bookings
    IF v_count % 100 = 0 THEN
      RAISE NOTICE 'Processed % of % bookings', v_count, v_total;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill completed: % bookings processed', v_count;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION backfill_cleaner_earnings_for_booking IS 'Recalculates and backfills cleaner earnings for a single booking using current pricing configuration';
