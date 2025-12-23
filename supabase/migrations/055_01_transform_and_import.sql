-- Migration: Transform and Import Bookings from Staging to Main Table
-- Created: 2025-01-XX
-- Description: Transforms data from bookings_staging into the bookings table
--              Handles data normalization, validation, and constraint issues
--              This must run AFTER 055_00_create_bookings_staging.sql and 055_bookings_data_insert.sql

-- ============================================================================
-- PART 1: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Helper Function: Extract first name from full name
CREATE OR REPLACE FUNCTION extract_first_name(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF full_name IS NULL OR trim(full_name) = '' THEN
    RETURN 'Customer';
  ELSIF position(' ' in full_name) > 0 THEN
    RETURN trim(split_part(full_name, ' ', 1));
  ELSE
    RETURN trim(full_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract last name from full name
CREATE OR REPLACE FUNCTION extract_last_name(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF full_name IS NULL OR trim(full_name) = '' THEN
    RETURN '';
  ELSIF position(' ' in full_name) > 0 THEN
    RETURN trim(substring(full_name from position(' ' in full_name) + 1));
  ELSE
    RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Normalize service type
CREATE OR REPLACE FUNCTION normalize_service_type(service_type TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF service_type IS NULL OR trim(service_type) = '' THEN
    RETURN 'standard';
  END IF;
  
  normalized := lower(trim(service_type));
  
  -- Handle variations and map to valid service types
  CASE
    -- Standard cleaning variations
    WHEN normalized LIKE '%standard%' OR normalized LIKE '%home cleaning%' OR normalized = 'standard' THEN
      RETURN 'standard';
    
    -- Deep cleaning variations
    WHEN normalized LIKE '%deep%' OR normalized = 'deep' THEN
      RETURN 'deep';
    
    -- Move in/out variations
    WHEN normalized LIKE '%move%' OR normalized LIKE '%move-in%' OR normalized LIKE '%move-out%' OR normalized = 'move-in-out' THEN
      RETURN 'move-in-out';
    
    -- Airbnb variations
    WHEN normalized LIKE '%airbnb%' OR normalized = 'airbnb' THEN
      RETURN 'airbnb';
    
    -- Carpet cleaning variations
    WHEN normalized LIKE '%carpet%' OR normalized = 'carpet-cleaning' THEN
      RETURN 'carpet-cleaning';
    
    -- Office cleaning variations
    WHEN normalized LIKE '%office%' OR normalized = 'office' THEN
      RETURN 'office';
    
    -- Holiday cleaning variations
    WHEN normalized LIKE '%holiday%' OR normalized = 'holiday' THEN
      RETURN 'holiday';
    
    -- Default to standard if no match
    ELSE
      RETURN 'standard';
  END CASE;
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

-- Helper Function: Normalize status (map old statuses to new ones)
CREATE OR REPLACE FUNCTION normalize_status(old_status TEXT)
RETURNS TEXT AS $$
BEGIN
  IF old_status IS NULL OR trim(old_status) = '' THEN
    RETURN 'pending';
  END IF;
  
  CASE lower(trim(old_status))
    WHEN 'accepted' THEN RETURN 'confirmed';
    WHEN 'completed' THEN RETURN 'completed';
    WHEN 'cancelled' THEN RETURN 'cancelled';
    WHEN 'pending' THEN RETURN 'pending';
    WHEN 'confirmed' THEN RETURN 'confirmed';
    ELSE RETURN 'pending';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract bedrooms from price_snapshot
CREATE OR REPLACE FUNCTION extract_bedrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  IF price_snapshot IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Try multiple possible paths in the JSON
  RETURN COALESCE(
    (price_snapshot->'service'->>'bedrooms')::INTEGER,
    (price_snapshot->>'bedrooms')::INTEGER,
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract bathrooms from price_snapshot
CREATE OR REPLACE FUNCTION extract_bathrooms(price_snapshot JSONB)
RETURNS INTEGER AS $$
BEGIN
  IF price_snapshot IS NULL THEN
    RETURN 1;
  END IF;
  
  -- Try multiple possible paths in the JSON
  RETURN COALESCE(
    (price_snapshot->'service'->>'bathrooms')::INTEGER,
    (price_snapshot->>'bathrooms')::INTEGER,
    1
  );
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Extract extras from price_snapshot
CREATE OR REPLACE FUNCTION extract_extras(price_snapshot JSONB)
RETURNS JSONB AS $$
BEGIN
  IF price_snapshot IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  RETURN COALESCE(price_snapshot->'extras', '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Map cleaner UUID to cleaner_id TEXT (with NULL handling)
CREATE OR REPLACE FUNCTION map_cleaner_uuid_to_id(cleaner_uuid TEXT)
RETURNS TEXT AS $$
BEGIN
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
-- PART 2: TRANSFORM AND INSERT INTO BOOKINGS TABLE
-- ============================================================================
-- This handles all data transformation, validation, and constraint issues

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
  -- Ensure booking_reference is unique and not null
  COALESCE(
    NULLIF(trim(bs.payment_reference), ''),
    NULLIF(trim(bs.id), ''),
    'BK-' || gen_random_uuid()::TEXT
  ) as booking_reference,
  -- Ensure scheduled_date is not null
  COALESCE(NULLIF(trim(bs.booking_date), ''), '1900-01-01') as scheduled_date,
  -- Ensure scheduled_time is not null
  COALESCE(NULLIF(trim(bs.booking_time), ''), '09:00:00') as scheduled_time,
  -- Normalize service_type (lowercase, default to 'standard')
  normalize_service_type(bs.service_type) as service_type,
  -- Normalize frequency (default to 'one-time')
  normalize_frequency(bs.frequency) as frequency,
  -- Extract bedrooms (default to 0)
  extract_bedrooms(bs.price_snapshot) as bedrooms,
  -- Extract bathrooms (default to 1)
  extract_bathrooms(bs.price_snapshot) as bathrooms,
  -- Extract extras (default to empty array)
  extract_extras(bs.price_snapshot) as extras,
  -- Ensure street_address is not null
  COALESCE(NULLIF(trim(bs.address_line1), ''), 'Address not provided') as street_address,
  -- Ensure suburb is not null
  COALESCE(NULLIF(trim(bs.address_suburb), ''), 'Unknown') as suburb,
  -- Ensure city is not null (default to Cape Town)
  COALESCE(NULLIF(trim(bs.address_city), ''), 'Cape Town') as city,
  -- Map cleaner UUID to cleaner_id (can be NULL)
  map_cleaner_uuid_to_id(bs.cleaner_id) as assigned_cleaner_id,
  -- Extract first name (ensure it's not null)
  extract_first_name(bs.customer_name) as contact_first_name,
  -- Extract last name (can be empty)
  extract_last_name(bs.customer_name) as contact_last_name,
  -- Ensure contact_email is not null
  COALESCE(NULLIF(trim(bs.customer_email), ''), 'no-email@example.com') as contact_email,
  -- Ensure contact_phone is not null
  COALESCE(NULLIF(trim(bs.customer_phone), ''), '0000000000') as contact_phone,
  -- Payment reference can be null
  NULLIF(trim(bs.payment_reference), '') as payment_reference,
  -- Normalize status (map 'accepted' to 'confirmed', etc.)
  normalize_status(bs.status) as status,
  -- Set payment_status based on status
  CASE 
    WHEN lower(COALESCE(bs.status, '')) = 'completed' THEN 'completed'
    ELSE 'pending'
  END as payment_status,
  -- Convert total_amount from cents to rands (handle various formats)
  CASE 
    WHEN bs.total_amount IS NULL OR trim(bs.total_amount) = '' THEN 0.00
    WHEN bs.total_amount ~ '^[0-9]+\.?[0-9]*$' THEN 
      CASE 
        WHEN (bs.total_amount::DECIMAL(10, 2)) > 10000 THEN (bs.total_amount::DECIMAL(10, 2) / 100.0)
        ELSE bs.total_amount::DECIMAL(10, 2)
      END
    ELSE 0.00
  END as total_amount,
  -- Convert tip_amount from cents to rands
  CASE 
    WHEN bs.tip_amount IS NULL OR trim(bs.tip_amount) = '' THEN 0.00
    WHEN bs.tip_amount ~ '^[0-9]+\.?[0-9]*$' THEN 
      CASE 
        WHEN (bs.tip_amount::DECIMAL(10, 2)) > 10000 THEN (bs.tip_amount::DECIMAL(10, 2) / 100.0)
        ELSE bs.tip_amount::DECIMAL(10, 2)
      END
    ELSE 0.00
  END as tip_amount,
  -- Ensure created_at is not null
  COALESCE(bs.created_at, NOW()) as created_at,
  -- Ensure updated_at is not null
  COALESCE(bs.updated_at, bs.created_at, NOW()) as updated_at
FROM bookings_staging bs
WHERE bs.id IS NOT NULL
  AND trim(bs.id) != ''
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
-- PART 3: CLEANUP
-- ============================================================================

DROP FUNCTION IF EXISTS extract_first_name(TEXT);
DROP FUNCTION IF EXISTS extract_last_name(TEXT);
DROP FUNCTION IF EXISTS normalize_service_type(TEXT);
DROP FUNCTION IF EXISTS normalize_frequency(TEXT);
DROP FUNCTION IF EXISTS normalize_status(TEXT);
DROP FUNCTION IF EXISTS extract_bedrooms(JSONB);
DROP FUNCTION IF EXISTS extract_bathrooms(JSONB);
DROP FUNCTION IF EXISTS extract_extras(JSONB);
DROP FUNCTION IF EXISTS map_cleaner_uuid_to_id(TEXT);

-- ============================================================================
-- PART 4: VERIFICATION
-- ============================================================================

SELECT 
  'Import completed!' as message,
  COUNT(*) as total_bookings_imported,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
  COUNT(*) FILTER (WHERE assigned_cleaner_id IS NOT NULL) as bookings_with_cleaner
FROM bookings;

