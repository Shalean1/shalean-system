-- Migration: Update Holiday Cleaning to Express Cleaning
-- Description: Update service_type from 'holiday' to 'express' in service_type_pricing table
--              This aligns with the frontend code changes

-- Update service_type_pricing table
UPDATE service_type_pricing 
SET 
  service_type = 'express',
  service_name = 'Express Cleaning',
  updated_at = NOW()
WHERE service_type = 'holiday';

-- Update room_pricing table if it has holiday entries
UPDATE room_pricing 
SET 
  service_type = 'express',
  updated_at = NOW()
WHERE service_type = 'holiday';

-- Note: If there are existing bookings with service_type = 'holiday', 
-- those will need to be handled separately if needed.
-- For now, we're only updating the service configuration tables.
