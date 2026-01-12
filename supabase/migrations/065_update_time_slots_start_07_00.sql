-- Migration: Update time slots to start from 07:00
-- Created: 2025-01-XX
-- Description: Adds 07:00 and 07:30 time slots and shifts existing slots' display_order

-- First, shift all existing time slots' display_order by 2 to make room for 07:00 and 07:30
UPDATE time_slots
SET display_order = display_order + 2
WHERE display_order >= 1;

-- Insert the new early morning time slots
INSERT INTO time_slots (time_value, display_label, display_order) VALUES
  ('07:00', '07:00 AM', 1),
  ('07:30', '07:30 AM', 2)
ON CONFLICT (time_value) DO UPDATE
SET display_label = EXCLUDED.display_label,
    display_order = EXCLUDED.display_order;
