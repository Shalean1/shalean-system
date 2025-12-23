-- Migration: Import Bookings Data
-- Created: 2025-01-XX
-- Description: Imports historical booking records from the old schema format
--              Maps old schema columns to new schema structure
--
-- IMPORTANT: Before running this migration, you need to:
-- 1. Copy the INSERT statement from bookings_rows.sql
-- 2. Replace "INSERT INTO "public"."bookings"" with "INSERT INTO bookings_staging"
-- 3. Then run this entire migration file

-- ============================================================================
-- HELPER FUNCTION: Split customer name into first and last name
-- ============================================================================
CREATE OR REPLACE FUNCTION split_customer_name(full_name TEXT)
RETURNS TABLE(first_name TEXT, last_name TEXT) AS $$
BEGIN
  -- If name contains a space, split it; otherwise use full name as first name
  IF position(' ' in full_name) > 0 THEN
    RETURN QUERY SELECT 
      trim(split_part(full_name, ' ', 1)) as first_name,
      trim(substring(full_name from position(' ' in full_name) + 1)) as last_name;
  ELSE
    RETURN QUERY SELECT full_name as first_name, '' as last_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Normalize service type
-- ============================================================================
CREATE OR REPLACE FUNCTION normalize_service_type(service_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(service_type));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Normalize frequency
-- ============================================================================
CREATE OR REPLACE FUNCTION normalize_frequency(frequency TEXT)
RETURNS TEXT AS $$
BEGIN
  IF frequency IS NULL OR trim(frequency) = '' THEN
    RETURN 'one-time';
  ELSIF lower(trim(frequency)) = 'custom-weekly' THEN
    RETURN 'weekly';
  ELSE
    RETURN lower(trim(frequency));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Extract bedrooms from price_snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION extract_bedrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((price_snapshot->'service'->>'bedrooms')::INTEGER, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Extract bathrooms from price_snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION extract_bathrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((price_snapshot->'service'->>'bathrooms')::INTEGER, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Extract extras from price_snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION extract_extras(price_snapshot JSONB)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(price_snapshot->'extras', '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Map cleaner UUID to cleaner_id TEXT
-- ============================================================================
CREATE OR REPLACE FUNCTION map_cleaner_uuid_to_id(cleaner_uuid TEXT)
RETURNS TEXT AS $$
BEGIN
  -- If cleaner_uuid is NULL or empty, return NULL
  IF cleaner_uuid IS NULL OR trim(cleaner_uuid) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Try to find cleaner by UUID matching the id column
  -- Handle both UUID format and TEXT format
  RETURN (
    SELECT cleaner_id 
    FROM cleaners 
    WHERE id::TEXT = trim(cleaner_uuid)
       OR id = cleaner_uuid::UUID
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TEMPORARY STAGING TABLE
-- ============================================================================
CREATE TEMP TABLE IF NOT EXISTS bookings_staging (
  id TEXT,
  cleaner_id TEXT,  -- Changed from UUID to TEXT to handle the string values
  booking_date TEXT,
  booking_time TEXT,
  service_type TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address_line1 TEXT,
  address_suburb TEXT,
  address_city TEXT,
  payment_reference TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  customer_id TEXT,
  total_amount TEXT,
  service_fee TEXT,
  frequency TEXT,
  frequency_discount TEXT,
  price_snapshot JSONB,
  cleaner_claimed_at TIMESTAMPTZ,
  cleaner_started_at TIMESTAMPTZ,
  cleaner_completed_at TIMESTAMPTZ,
  customer_rating_id TEXT,
  cleaner_earnings TEXT,
  cleaner_accepted_at TIMESTAMPTZ,
  cleaner_on_my_way_at TIMESTAMPTZ,
  customer_reviewed TEXT,
  customer_review_id TEXT,
  recurring_schedule_id TEXT,
  requires_team TEXT,
  updated_at TIMESTAMPTZ,
  tip_amount TEXT,
  cleaner_start_reminder_sent TEXT,
  unread_messages_count TEXT,
  notes TEXT
);

-- ============================================================================
-- IMPORT INSTRUCTIONS
-- ============================================================================
-- STEP 1: Copy the INSERT statement from bookings_rows.sql
-- STEP 2: Replace the first line:
--   FROM: INSERT INTO "public"."bookings" (...)
--   TO:   INSERT INTO bookings_staging (...)
-- STEP 3: Run the modified INSERT statement here (before the transformation)
-- STEP 4: Then run the transformation query below

-- Example of what the INSERT should look like:
-- INSERT INTO bookings_staging ("id", "cleaner_id", "booking_date", ...) VALUES
--   ('BK-...', '914b3acf-...', '2025-10-16', ...),
--   ...

-- ============================================================================
-- TRANSFORM AND INSERT INTO BOOKINGS TABLE
-- ============================================================================
INSERT INTO bookings (
  id,
  booking_reference,
  scheduled_date,
  scheduled_time,
  service_type,
  frequency,
  bedrooms,
  bathrooms,
  extras,
  street_address,
  suburb,
  city,
  assigned_cleaner_id,
  contact_first_name,
  contact_last_name,
  contact_email,
  contact_phone,
  payment_reference,
  status,
  payment_status,
  total_amount,
  tip_amount,
  created_at,
  updated_at
)
SELECT
  bs.id,
  COALESCE(bs.payment_reference, bs.id) as booking_reference, -- Use payment_reference or fallback to id
  bs.booking_date as scheduled_date,
  bs.booking_time as scheduled_time,
  normalize_service_type(bs.service_type) as service_type,
  normalize_frequency(bs.frequency) as frequency,
  extract_bedrooms(bs.price_snapshot) as bedrooms,
  extract_bathrooms(bs.price_snapshot) as bathrooms,
  extract_extras(bs.price_snapshot) as extras,
  COALESCE(bs.address_line1, '') as street_address,
  COALESCE(bs.address_suburb, '') as suburb,
  COALESCE(trim(bs.address_city), 'Cape Town') as city, -- Default to Cape Town if empty
  map_cleaner_uuid_to_id(bs.cleaner_id) as assigned_cleaner_id, -- Map UUID to cleaner_id TEXT
  (split_customer_name(bs.customer_name)).first_name as contact_first_name,
  (split_customer_name(bs.customer_name)).last_name as contact_last_name,
  bs.customer_email as contact_email,
  trim(bs.customer_phone) as contact_phone,
  bs.payment_reference,
  lower(COALESCE(bs.status, 'pending')) as status,
  CASE 
    WHEN lower(bs.status) = 'completed' THEN 'completed'
    ELSE 'pending'
  END as payment_status,
  -- Convert from cents (stored as string) to rands (decimal)
  CASE 
    WHEN bs.total_amount ~ '^[0-9]+\.?[0-9]*$' THEN (bs.total_amount::DECIMAL(10, 2) / 100.0)
    ELSE 0.00
  END as total_amount,
  -- Convert tip from cents to rands
  CASE 
    WHEN bs.tip_amount IS NOT NULL AND bs.tip_amount ~ '^[0-9]+\.?[0-9]*$' THEN (bs.tip_amount::DECIMAL(10, 2) / 100.0)
    ELSE 0.00
  END as tip_amount,
  bs.created_at,
  COALESCE(bs.updated_at, bs.created_at) as updated_at
FROM bookings_staging bs
WHERE bs.id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  booking_reference = EXCLUDED.booking_reference,
  scheduled_date = EXCLUDED.scheduled_date,
  scheduled_time = EXCLUDED.scheduled_time,
  service_type = EXCLUDED.service_type,
  frequency = EXCLUDED.frequency,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  extras = EXCLUDED.extras,
  street_address = EXCLUDED.street_address,
  suburb = EXCLUDED.suburb,
  city = EXCLUDED.city,
  assigned_cleaner_id = EXCLUDED.assigned_cleaner_id,
  contact_first_name = EXCLUDED.contact_first_name,
  contact_last_name = EXCLUDED.contact_last_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  payment_reference = EXCLUDED.payment_reference,
  status = EXCLUDED.status,
  payment_status = EXCLUDED.payment_status,
  total_amount = EXCLUDED.total_amount,
  tip_amount = EXCLUDED.tip_amount,
  updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- CLEANUP
-- ============================================================================
-- Clean up temporary functions
DROP FUNCTION IF EXISTS split_customer_name(TEXT);
DROP FUNCTION IF EXISTS normalize_service_type(TEXT);
DROP FUNCTION IF EXISTS normalize_frequency(TEXT);
DROP FUNCTION IF EXISTS extract_bedrooms(JSONB);
DROP FUNCTION IF EXISTS extract_bathrooms(JSONB);
DROP FUNCTION IF EXISTS extract_extras(JSONB);
DROP FUNCTION IF EXISTS map_cleaner_uuid_to_id(TEXT);

-- Note: The temporary table bookings_staging will be automatically dropped when the session ends
