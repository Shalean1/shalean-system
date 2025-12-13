-- Migration: Create booking dynamic data tables
-- Created: 2025-12-13
-- Description: Tables for service locations, extras, time slots, cleaners, frequencies, and settings

-- ============================================================================
-- 1. SERVICE AREAS / LOCATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL DEFAULT 'Cape Town',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_locations_order ON service_locations(display_order);
CREATE INDEX IF NOT EXISTS idx_service_locations_active ON service_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_service_locations_city ON service_locations(city);

-- ============================================================================
-- 2. ADDITIONAL SERVICES / EXTRAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL UNIQUE, -- e.g., "inside-fridge"
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- Lucide icon name e.g., "Refrigerator"
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Additional price
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_additional_services_order ON additional_services(display_order);
CREATE INDEX IF NOT EXISTS idx_additional_services_active ON additional_services(is_active);

-- ============================================================================
-- 3. TIME SLOTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_value TEXT NOT NULL UNIQUE, -- e.g., "08:00"
  display_label TEXT NOT NULL, -- e.g., "08:00 AM"
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_slots_order ON time_slots(display_order);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots(is_active);

-- ============================================================================
-- 4. CLEANERS / STAFF
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaner_id TEXT NOT NULL UNIQUE, -- e.g., "natasha-m"
  name TEXT NOT NULL,
  bio TEXT,
  rating DECIMAL(3, 2), -- e.g., 4.70
  total_jobs INTEGER DEFAULT 0,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cleaners_order ON cleaners(display_order);
CREATE INDEX IF NOT EXISTS idx_cleaners_active ON cleaners(is_active);
CREATE INDEX IF NOT EXISTS idx_cleaners_available ON cleaners(is_available);

-- ============================================================================
-- 5. FREQUENCY OPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS frequency_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  frequency_id TEXT NOT NULL UNIQUE, -- e.g., "weekly"
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2) DEFAULT 0, -- e.g., 15.00 for 15%
  display_label TEXT, -- e.g., "Save 15%"
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frequency_options_order ON frequency_options(display_order);
CREATE INDEX IF NOT EXISTS idx_frequency_options_active ON frequency_options(is_active);

-- ============================================================================
-- 6. SYSTEM SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT true, -- Can be accessed by non-authenticated users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequency_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Service Locations
DROP POLICY IF EXISTS "Anyone can view active service locations" ON service_locations;
CREATE POLICY "Anyone can view active service locations" ON service_locations
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage service locations" ON service_locations;
CREATE POLICY "Authenticated users can manage service locations" ON service_locations
  FOR ALL USING (auth.role() = 'authenticated');

-- Additional Services
DROP POLICY IF EXISTS "Anyone can view active additional services" ON additional_services;
CREATE POLICY "Anyone can view active additional services" ON additional_services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage additional services" ON additional_services;
CREATE POLICY "Authenticated users can manage additional services" ON additional_services
  FOR ALL USING (auth.role() = 'authenticated');

-- Time Slots
DROP POLICY IF EXISTS "Anyone can view active time slots" ON time_slots;
CREATE POLICY "Anyone can view active time slots" ON time_slots
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage time slots" ON time_slots;
CREATE POLICY "Authenticated users can manage time slots" ON time_slots
  FOR ALL USING (auth.role() = 'authenticated');

-- Cleaners
DROP POLICY IF EXISTS "Anyone can view active cleaners" ON cleaners;
CREATE POLICY "Anyone can view active cleaners" ON cleaners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage cleaners" ON cleaners;
CREATE POLICY "Authenticated users can manage cleaners" ON cleaners
  FOR ALL USING (auth.role() = 'authenticated');

-- Frequency Options
DROP POLICY IF EXISTS "Anyone can view active frequency options" ON frequency_options;
CREATE POLICY "Anyone can view active frequency options" ON frequency_options
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage frequency options" ON frequency_options;
CREATE POLICY "Authenticated users can manage frequency options" ON frequency_options
  FOR ALL USING (auth.role() = 'authenticated');

-- System Settings
DROP POLICY IF EXISTS "Anyone can view public settings" ON system_settings;
CREATE POLICY "Anyone can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON system_settings;
CREATE POLICY "Authenticated users can manage settings" ON system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_service_locations_updated_at ON service_locations;
CREATE TRIGGER update_service_locations_updated_at
  BEFORE UPDATE ON service_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_additional_services_updated_at ON additional_services;
CREATE TRIGGER update_additional_services_updated_at
  BEFORE UPDATE ON additional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_slots_updated_at ON time_slots;
CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cleaners_updated_at ON cleaners;
CREATE TRIGGER update_cleaners_updated_at
  BEFORE UPDATE ON cleaners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_frequency_options_updated_at ON frequency_options;
CREATE TRIGGER update_frequency_options_updated_at
  BEFORE UPDATE ON frequency_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Service Locations (Cape Town areas)
INSERT INTO service_locations (name, slug, city, display_order) VALUES
  ('Sea Point', 'sea-point', 'Cape Town', 1),
  ('Camps Bay', 'camps-bay', 'Cape Town', 2),
  ('Claremont', 'claremont', 'Cape Town', 3),
  ('Green Point', 'green-point', 'Cape Town', 4),
  ('V&A Waterfront', 'va-waterfront', 'Cape Town', 5),
  ('Constantia', 'constantia', 'Cape Town', 6),
  ('Newlands', 'newlands', 'Cape Town', 7),
  ('Rondebosch', 'rondebosch', 'Cape Town', 8),
  ('Observatory', 'observatory', 'Cape Town', 9),
  ('Woodstock', 'woodstock', 'Cape Town', 10),
  ('City Bowl', 'city-bowl', 'Cape Town', 11),
  ('Gardens', 'gardens', 'Cape Town', 12),
  ('Tamboerskloof', 'tamboerskloof', 'Cape Town', 13),
  ('Oranjezicht', 'oranjezicht', 'Cape Town', 14),
  ('Vredehoek', 'vredehoek', 'Cape Town', 15),
  ('Devils Peak', 'devils-peak', 'Cape Town', 16),
  ('Mouille Point', 'mouille-point', 'Cape Town', 17),
  ('Three Anchor Bay', 'three-anchor-bay', 'Cape Town', 18),
  ('Bantry Bay', 'bantry-bay', 'Cape Town', 19),
  ('Fresnaye', 'fresnaye', 'Cape Town', 20),
  ('Bakoven', 'bakoven', 'Cape Town', 21),
  ('Llandudno', 'llandudno', 'Cape Town', 22),
  ('Hout Bay', 'hout-bay', 'Cape Town', 23),
  ('Wynberg', 'wynberg', 'Cape Town', 24),
  ('Kenilworth', 'kenilworth', 'Cape Town', 25),
  ('Plumstead', 'plumstead', 'Cape Town', 26),
  ('Diep River', 'diep-river', 'Cape Town', 27),
  ('Bergvliet', 'bergvliet', 'Cape Town', 28),
  ('Tokai', 'tokai', 'Cape Town', 29),
  ('Steenberg', 'steenberg', 'Cape Town', 30),
  ('Muizenberg', 'muizenberg', 'Cape Town', 31),
  ('Kalk Bay', 'kalk-bay', 'Cape Town', 32),
  ('Fish Hoek', 'fish-hoek', 'Cape Town', 33),
  ('Simons Town', 'simons-town', 'Cape Town', 34)
ON CONFLICT (name) DO NOTHING;

-- Additional Services / Extras
INSERT INTO additional_services (service_id, name, description, icon_name, price_modifier, display_order) VALUES
  ('inside-fridge', 'Inside Fridge', 'Deep cleaning inside your refrigerator', 'Refrigerator', 50.00, 1),
  ('inside-oven', 'Inside Oven', 'Deep cleaning inside your oven', 'ChefHat', 50.00, 2),
  ('inside-cabinets', 'Inside Cabinets', 'Cleaning inside kitchen and bathroom cabinets', 'Boxes', 75.00, 3),
  ('interior-windows', 'Interior Windows', 'Cleaning interior windows', 'Grid', 100.00, 4),
  ('interior-walls', 'Interior Walls', 'Spot cleaning walls and removing marks', 'Paintbrush', 100.00, 5),
  ('ironing', 'Ironing', 'Professional ironing service', 'Shirt', 75.00, 6),
  ('laundry', 'Laundry & Ironing', 'Complete laundry and ironing service', 'Shirt', 150.00, 7)
ON CONFLICT (service_id) DO NOTHING;

-- Time Slots
INSERT INTO time_slots (time_value, display_label, display_order) VALUES
  ('08:00', '08:00 AM', 1),
  ('08:30', '08:30 AM', 2),
  ('09:00', '09:00 AM', 3),
  ('09:30', '09:30 AM', 4),
  ('10:00', '10:00 AM', 5),
  ('10:30', '10:30 AM', 6),
  ('11:00', '11:00 AM', 7),
  ('11:30', '11:30 AM', 8),
  ('12:00', '12:00 PM', 9),
  ('12:30', '12:30 PM', 10),
  ('13:00', '01:00 PM', 11),
  ('13:30', '01:30 PM', 12),
  ('14:00', '02:00 PM', 13),
  ('14:30', '02:30 PM', 14),
  ('15:00', '03:00 PM', 15),
  ('15:30', '03:30 PM', 16),
  ('16:00', '04:00 PM', 17),
  ('16:30', '04:30 PM', 18)
ON CONFLICT (time_value) DO NOTHING;

-- Cleaners
INSERT INTO cleaners (cleaner_id, name, bio, rating, total_jobs, display_order) VALUES
  ('no-preference', 'No preference', 'Any available cleaner will be assigned', NULL, 0, 0),
  ('natasha-m', 'Natasha M.', 'Experienced cleaner with 5+ years in professional cleaning', 4.70, 247, 1),
  ('estery-p', 'Estery P.', 'Specialized in deep cleaning and move-in/out services', 4.60, 198, 2),
  ('beaul', 'Beaul', 'Detail-oriented cleaner with excellent customer reviews', 3.10, 86, 3)
ON CONFLICT (cleaner_id) DO NOTHING;

-- Frequency Options
INSERT INTO frequency_options (frequency_id, name, description, discount_percentage, display_label, display_order) VALUES
  ('one-time', 'One-time', 'One-time cleaning service', 0, '', 1),
  ('weekly', 'Weekly', 'Weekly recurring cleaning service', 15.00, 'Save 15%', 2),
  ('bi-weekly', 'Bi-weekly', 'Cleaning service every two weeks', 10.00, 'Save 10%', 3),
  ('monthly', 'Monthly', 'Monthly recurring cleaning service', 5.00, 'Save 5%', 4)
ON CONFLICT (frequency_id) DO NOTHING;

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('default_city', 'Cape Town', 'string', 'Default city for service locations', true),
  ('enable_location_other_option', 'true', 'boolean', 'Allow users to enter custom location', true),
  ('min_booking_hours_notice', '24', 'number', 'Minimum hours notice required for booking', true),
  ('max_bedrooms', '11', 'number', 'Maximum number of bedrooms to display', true),
  ('max_bathrooms', '11', 'number', 'Maximum number of bathrooms to display', true),
  ('service_fee_percentage', '10', 'number', 'Service fee percentage', true)
ON CONFLICT (setting_key) DO NOTHING;
