-- Script to adjust cleaner earnings based on minimum and maximum thresholds
-- Rules:
--   - Deep cleaning and Move In/Out Cleaning: Always set to R250
--   - For other service types:
--     - If cleaner_earnings < R250, set to R250
--     - If cleaner_earnings > R300, set to R300
--     - If R250 <= cleaner_earnings <= R300, leave unchanged

DO $$
DECLARE
  v_min_earnings DECIMAL(10, 2) := 250.00;
  v_max_earnings DECIMAL(10, 2) := 300.00;
  v_updated_count INTEGER := 0;
  v_below_min_count INTEGER := 0;
  v_above_max_count INTEGER := 0;
  v_deep_movein_count INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Adjusting cleaner earnings...';
  RAISE NOTICE '  Deep/Move-In-Out: R%', v_min_earnings;
  RAISE NOTICE '  Other services minimum: R%', v_min_earnings;
  RAISE NOTICE '  Other services maximum: R%', v_max_earnings;
  RAISE NOTICE '========================================';

  -- Count deep cleaning and move-in-out bookings
  SELECT COUNT(*) INTO v_deep_movein_count
  FROM bookings
  WHERE cleaner_earnings IS NOT NULL
    AND service_type IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  RAISE NOTICE 'Found % deep cleaning/move-in-out bookings', v_deep_movein_count;

  -- Set deep cleaning and move-in-out to R250
  UPDATE bookings
  SET 
    cleaner_earnings = v_min_earnings,
    updated_at = NOW()
  WHERE cleaner_earnings IS NOT NULL
    AND service_type IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % deep/move-in-out bookings to R%', v_updated_count, v_min_earnings;

  -- Count bookings below minimum (for other service types)
  SELECT COUNT(*) INTO v_below_min_count
  FROM bookings
  WHERE cleaner_earnings IS NOT NULL
    AND cleaner_earnings < v_min_earnings
    AND service_type NOT IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  -- Count bookings above maximum (for other service types)
  SELECT COUNT(*) INTO v_above_max_count
  FROM bookings
  WHERE cleaner_earnings IS NOT NULL
    AND cleaner_earnings > v_max_earnings
    AND service_type NOT IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  RAISE NOTICE 'Found % other bookings below R%', v_below_min_count, v_min_earnings;
  RAISE NOTICE 'Found % other bookings above R%', v_above_max_count, v_max_earnings;

  -- Update bookings below minimum (for other service types)
  UPDATE bookings
  SET 
    cleaner_earnings = v_min_earnings,
    updated_at = NOW()
  WHERE cleaner_earnings IS NOT NULL
    AND cleaner_earnings < v_min_earnings
    AND service_type NOT IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % other bookings to minimum (R%)', v_updated_count, v_min_earnings;

  -- Update bookings above maximum (for other service types)
  UPDATE bookings
  SET 
    cleaner_earnings = v_max_earnings,
    updated_at = NOW()
  WHERE cleaner_earnings IS NOT NULL
    AND cleaner_earnings > v_max_earnings
    AND service_type NOT IN ('deep', 'move-in-out')
    AND assigned_cleaner_id IS NOT NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % other bookings to maximum (R%)', v_updated_count, v_max_earnings;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Adjustment completed successfully!';
  RAISE NOTICE '========================================';
END $$;

-- Display summary of updated bookings by service type
WITH earnings_summary AS (
  SELECT 
    service_type,
    cleaner_earnings,
    CASE 
      WHEN service_type IN ('deep', 'move-in-out') THEN 'Fixed at R250'
      WHEN cleaner_earnings < 250.00 THEN 'Below Minimum (< R250)'
      WHEN cleaner_earnings > 300.00 THEN 'Above Maximum (> R300)'
      WHEN cleaner_earnings = 250.00 THEN 'At Minimum (R250)'
      WHEN cleaner_earnings = 300.00 THEN 'At Maximum (R300)'
      ELSE 'Within Range (R250-R300)'
    END AS status_category,
    CASE 
      WHEN service_type IN ('deep', 'move-in-out') THEN 1
      WHEN cleaner_earnings < 250.00 THEN 2
      WHEN cleaner_earnings = 250.00 THEN 3
      WHEN cleaner_earnings > 300.00 THEN 4
      WHEN cleaner_earnings = 300.00 THEN 5
      ELSE 6
    END AS sort_order
  FROM bookings
  WHERE cleaner_earnings IS NOT NULL
    AND assigned_cleaner_id IS NOT NULL
)
SELECT 
  service_type AS "Service Type",
  status_category AS "Status",
  COUNT(*) AS "Count",
  MIN(cleaner_earnings) AS "Min Earnings",
  MAX(cleaner_earnings) AS "Max Earnings",
  ROUND(AVG(cleaner_earnings), 2) AS "Avg Earnings"
FROM earnings_summary
GROUP BY service_type, status_category, sort_order
ORDER BY service_type, sort_order;
