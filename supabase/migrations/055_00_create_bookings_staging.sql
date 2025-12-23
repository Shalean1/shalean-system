-- Migration: Create bookings_staging table
-- Created: 2025-01-XX
-- Description: Creates the bookings_staging table for importing booking data
--              This table is used as a staging area before transforming data into the bookings table
--              This must run BEFORE 055_bookings_data_insert.sql

-- Drop the table if it exists (in case we need to re-run)
DROP TABLE IF EXISTS bookings_staging;

-- Create staging table (as a regular table, not temp, so it persists across queries)
CREATE TABLE bookings_staging (
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

-- Add comment
COMMENT ON TABLE bookings_staging IS 'Staging table for importing booking data from CSV before transformation into bookings table';

