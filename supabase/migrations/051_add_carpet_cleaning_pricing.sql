-- Migration: Add carpet cleaning pricing settings
-- Created: 2025-01-XX
-- Description: Adds pricing configuration for carpet cleaning service
--              - Price per fitted room: R180
--              - Price per loose carpet: R150
--              - Furniture fee: R200

-- Insert carpet cleaning pricing settings into system_settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
  ('carpet_cleaning_price_per_fitted_room', '180.00', 'number', 'Price per room with fitted carpets', true),
  ('carpet_cleaning_price_per_loose_carpet', '150.00', 'number', 'Price per loose carpet', true),
  ('carpet_cleaning_furniture_fee', '200.00', 'number', 'Additional fee when rooms have furniture (requires extra person to move furniture)', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

