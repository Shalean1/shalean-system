-- Migration: Add Airbnb Cleaning to popular_services table
-- Created: 2025-01-XX
-- Description: Add Airbnb Cleaning service to the popular_services table

-- Insert Airbnb Cleaning service
INSERT INTO popular_services (name, slug, description, display_order, is_active) VALUES
  ('Airbnb Cleaning', 'airbnb-cleaning', 'Professional Airbnb turnover cleaning service for rental properties', 5, true)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
