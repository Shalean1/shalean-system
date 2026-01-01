-- Migration: Add base_price column to popular_services table
-- Created: 2025-01-XX
-- Description: Adds pricing support to popular services

-- Add base_price column to popular_services table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'popular_services' 
    AND column_name = 'base_price'
  ) THEN
    ALTER TABLE popular_services ADD COLUMN base_price DECIMAL(10, 2);
  END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN popular_services.base_price IS 'Base price for the service in ZAR (optional)';

