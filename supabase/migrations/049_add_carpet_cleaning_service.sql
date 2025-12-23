-- Migration: Add Carpet Cleaning as Main Service
-- Created: 2025-01-XX
-- Description: Add carpet-cleaning as a main service type while keeping it available as an extra

-- ============================================================================
-- 1. UPDATE BOOKINGS TABLE CONSTRAINT
-- ============================================================================
-- Add 'carpet-cleaning' to the service_type CHECK constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_service_type_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_service_type_check 
CHECK (service_type IN ('standard', 'deep', 'move-in-out', 'airbnb', 'carpet-cleaning'));

-- ============================================================================
-- 2. ADD SERVICE TYPE PRICING
-- ============================================================================
INSERT INTO service_type_pricing (service_type, service_name, base_price, description, display_order) VALUES
  ('carpet-cleaning', 'Carpet Cleaning', 350.00, 'Professional carpet cleaning service', 7)
ON CONFLICT (service_type) DO UPDATE SET
  service_name = EXCLUDED.service_name,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- 3. ADD ROOM PRICING (Flat rate - zero per room since carpet cleaning is area-based)
-- ============================================================================
INSERT INTO room_pricing (service_type, room_type, price_per_room) VALUES
  ('carpet-cleaning', 'bedroom', 0.00),
  ('carpet-cleaning', 'bathroom', 0.00)
ON CONFLICT (service_type, room_type) DO UPDATE SET
  price_per_room = EXCLUDED.price_per_room,
  updated_at = NOW();

