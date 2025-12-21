-- Migration: Add foreign key constraint for recurring_schedules.customer_id
-- Created: 2025-01-XX
-- Description: Adds foreign key constraint to link recurring_schedules to customers table

-- Step 1: Create missing customer records for any customer_ids referenced in recurring_schedules
-- that don't exist in the customers table
INSERT INTO "public"."customers" (
  "id", 
  "first_name", 
  "last_name", 
  "address_line1",
  "address_suburb",
  "address_city",
  "created_at",
  "updated_at",
  "role"
)
SELECT DISTINCT
  rs.customer_id,
  'Unknown' as first_name,
  'Customer' as last_name,
  rs.address_line1,
  rs.address_suburb,
  rs.address_city,
  COALESCE(rs.created_at, NOW()) as created_at,
  COALESCE(rs.updated_at, NOW()) as updated_at,
  'customer' as role
FROM "public"."recurring_schedules" rs
WHERE rs.customer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM "public"."customers" c 
    WHERE c.id = rs.customer_id
  )
ON CONFLICT ("id") DO NOTHING;

-- Step 2: Add foreign key constraint from recurring_schedules.customer_id to customers.id
-- This enables Supabase PostgREST to automatically detect the relationship for joins
-- Drop constraint if it exists first (for idempotency)
ALTER TABLE "public"."recurring_schedules"
  DROP CONSTRAINT IF EXISTS recurring_schedules_customer_id_fkey;

ALTER TABLE "public"."recurring_schedules"
  ADD CONSTRAINT recurring_schedules_customer_id_fkey
  FOREIGN KEY ("customer_id") 
  REFERENCES "public"."customers"("id") 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

-- Add index if it doesn't already exist (should already exist from migration 029, but being safe)
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_customer_id ON "public"."recurring_schedules"("customer_id");
