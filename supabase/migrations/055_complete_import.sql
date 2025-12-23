-- ============================================================================
-- COMPLETE BOOKINGS IMPORT SCRIPT
-- ============================================================================
-- This script imports booking data from the old schema to the new schema
-- 
-- IMPORTANT: Before running, make sure you have run the prepare script:
--   powershell -ExecutionPolicy Bypass -File scripts\prepare_bookings_import.ps1
-- 
-- This will create: supabase/migrations/055_bookings_data_insert.sql
-- 
-- Then run this file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: SETUP - Create Functions and Staging Table
-- ============================================================================

-- Helper Function: Split customer name into first and last name
CREATE OR REPLACE FUNCTION split_customer_name(full_name TEXT)
RETURNS TABLE(first_name TEXT, last_name TEXT) AS $$
BEGIN
  IF position(' ' in full_name) > 0 THEN
    RETURN QUERY SELECT 
      trim(split_part(full_name, ' ', 1)) as first_name,
      trim(substring(full_name from position(' ' in full_name) + 1)) as last_name;
  ELSE
    RETURN QUERY SELECT full_name as first_name, '' as last_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Normalize service type
CREATE OR REPLACE FUNCTION normalize_service_type(service_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(service_type));
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Normalize frequency
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

-- Helper Function: Extract bedrooms from price_snapshot
CREATE OR REPLACE FUNCTION extract_bedrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((price_snapshot->'service'->>'bedrooms')::INTEGER, 0);
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract bathrooms from price_snapshot
CREATE OR REPLACE FUNCTION extract_bathrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((price_snapshot->'service'->>'bathrooms')::INTEGER, 1);
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract extras from price_snapshot
CREATE OR REPLACE FUNCTION extract_extras(price_snapshot JSONB)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(price_snapshot->'extras', '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Map cleaner UUID to cleaner_id TEXT
CREATE OR REPLACE FUNCTION map_cleaner_uuid_to_id(cleaner_uuid TEXT)
RETURNS TEXT AS $$
BEGIN
  IF cleaner_uuid IS NULL OR trim(cleaner_uuid) = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT cleaner_id 
    FROM cleaners 
    WHERE id::TEXT = trim(cleaner_uuid)
       OR id = cleaner_uuid::UUID
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Create temporary staging table
CREATE TEMP TABLE IF NOT EXISTS bookings_staging (
  id TEXT,
  cleaner_id TEXT,
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
-- PART 2: INSERT DATA INTO STAGING TABLE
-- ============================================================================
-- IMPORTANT: You need to run the INSERT statement separately!
-- 
-- In Supabase SQL Editor, open: supabase/migrations/055_bookings_data_insert.sql
-- Copy the entire contents and run it here (or in a separate query)
-- 
-- The INSERT statement should start with: INSERT INTO bookings_staging (...)
-- ============================================================================

-- PASTE THE CONTENTS OF 055_bookings_data_insert.sql HERE
-- OR run it in a separate query before continuing to PART 3

-- ============================================================================
-- PART 3: TRANSFORM AND INSERT INTO BOOKINGS TABLE
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
  COALESCE(bs.payment_reference, bs.id) as booking_reference,
  bs.booking_date as scheduled_date,
  bs.booking_time as scheduled_time,
  normalize_service_type(bs.service_type) as service_type,
  normalize_frequency(bs.frequency) as frequency,
  extract_bedrooms(bs.price_snapshot) as bedrooms,
  extract_bathrooms(bs.price_snapshot) as bathrooms,
  extract_extras(bs.price_snapshot) as extras,
  COALESCE(bs.address_line1, '') as street_address,
  COALESCE(bs.address_suburb, '') as suburb,
  COALESCE(trim(bs.address_city), 'Cape Town') as city,
  map_cleaner_uuid_to_id(bs.cleaner_id) as assigned_cleaner_id,
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
  CASE 
    WHEN bs.total_amount ~ '^[0-9]+\.?[0-9]*$' THEN (bs.total_amount::DECIMAL(10, 2) / 100.0)
    ELSE 0.00
  END as total_amount,
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
-- PART 4: CLEANUP
-- ============================================================================

DROP FUNCTION IF EXISTS split_customer_name(TEXT);
DROP FUNCTION IF EXISTS normalize_service_type(TEXT);
DROP FUNCTION IF EXISTS normalize_frequency(TEXT);
DROP FUNCTION IF EXISTS extract_bedrooms(JSONB);
DROP FUNCTION IF EXISTS extract_bathrooms(JSONB);
DROP FUNCTION IF EXISTS extract_extras(JSONB);
DROP FUNCTION IF EXISTS map_cleaner_uuid_to_id(TEXT);

-- Note: The temporary table bookings_staging will be automatically dropped when the session ends

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Import completed!' as message,
  COUNT(*) as total_bookings_imported
FROM bookings;

