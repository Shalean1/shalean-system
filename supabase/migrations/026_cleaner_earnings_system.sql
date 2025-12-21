-- Migration: Cleaner Earnings System
-- Created: 2025-01-XX
-- Description: Add price breakdown and cleaner earnings columns to bookings table
--              Add system setting for old cleaner job threshold
--              Old cleaners (based on job count) earn 70%, new cleaners earn 60%

-- ============================================================================
-- 1. ADD PRICE BREAKDOWN COLUMNS TO BOOKINGS TABLE
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS frequency_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_code_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10, 2) DEFAULT NULL;

-- ============================================================================
-- 2. ADD CLEANER EARNINGS COLUMNS TO BOOKINGS TABLE
-- ============================================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cleaner_earnings DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cleaner_earnings_percentage DECIMAL(5, 2) DEFAULT NULL;

-- Create indexes for earnings queries
CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_earnings ON bookings(cleaner_earnings);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_cleaner_earnings ON bookings(assigned_cleaner_id, cleaner_earnings) WHERE assigned_cleaner_id IS NOT NULL;

-- ============================================================================
-- 3. ADD SYSTEM SETTING FOR OLD CLEANER THRESHOLD
-- ============================================================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES ('old_cleaner_job_threshold', '50', 'number', 'Minimum number of completed jobs for a cleaner to be considered "old" and earn 70% instead of 60%', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- ============================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN bookings.subtotal IS 'Subtotal before any discounts (basePrice + roomPrice + extrasPrice)';
COMMENT ON COLUMN bookings.frequency_discount IS 'Discount amount from frequency (weekly/bi-weekly/monthly). This affects cleaner earnings.';
COMMENT ON COLUMN bookings.discount_code_discount IS 'Discount amount from discount code. This does NOT affect cleaner earnings.';
COMMENT ON COLUMN bookings.service_fee IS 'Service fee amount calculated on discounted subtotal';
COMMENT ON COLUMN bookings.cleaner_earnings IS 'Calculated cleaner earnings: (subtotal - frequency_discount - service_fee) * cleaner_earnings_percentage + tip_amount';
COMMENT ON COLUMN bookings.cleaner_earnings_percentage IS 'Percentage used for earnings calculation: 0.70 for old cleaners, 0.60 for new cleaners';
