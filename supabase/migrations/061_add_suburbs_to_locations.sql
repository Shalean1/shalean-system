-- ============================================================================
-- ADD SUBURBS TO LOCATIONS
-- ============================================================================
-- Migration: Add suburb column and group locations into suburbs
-- Created: 2025-01-XX
-- Description: Adds suburb column to service_locations and groups all locations into logical suburbs

-- Add suburb column to service_locations table
ALTER TABLE service_locations 
ADD COLUMN IF NOT EXISTS suburb TEXT;

-- Create index for suburb column
CREATE INDEX IF NOT EXISTS idx_service_locations_suburb ON service_locations(suburb);

-- Update all locations with their suburb assignments
-- Grouped by Cape Town geographic regions

-- Atlantic Seaboard
UPDATE service_locations SET suburb = 'Atlantic Seaboard' 
WHERE name IN (
  'Sea Point', 'Green Point', 'Mouille Point', 'Three Anchor Bay',
  'Camps Bay', 'Bantry Bay', 'Fresnaye', 'Bakoven', 'Llandudno', 'Clifton'
);

-- City Bowl
UPDATE service_locations SET suburb = 'City Bowl' 
WHERE name IN (
  'City Bowl', 'Gardens', 'Tamboerskloof', 'Oranjezicht', 'Vredehoek',
  'Devils Peak', 'Devil''s Peak Estate', 'Bo-Kaap', 'De Waterkant', 'Schotse Kloof',
  'Higgovale', 'Groote Schuur', 'University Estate'
);

-- Southern Suburbs
UPDATE service_locations SET suburb = 'Southern Suburbs' 
WHERE name IN (
  'Claremont', 'Newlands', 'Rondebosch', 'Rondebosch East', 'Observatory',
  'Woodstock', 'Wynberg', 'Kenilworth', 'Plumstead', 'Diep River', 'Bergvliet',
  'Tokai', 'Steenberg', 'Harfield Village', 'Heathfield', 'Kirstenhof',
  'Constantia', 'Meadowridge', 'Mowbray', 'Wetton', 'Wittebome', 'Rhodes',
  'Lower Vrede', 'Kreupelbosch', 'Glosderry', 'Old Oak', 'Sunnyside'
);

-- Northern Suburbs
UPDATE service_locations SET suburb = 'Northern Suburbs' 
WHERE name IN (
  'Bellville', 'Bellville South', 'Brackenfell', 'Durbanville', 'Goodwood',
  'Parow', 'Parow East', 'Bothasig', 'Edgemead', 'Monte Vista', 'Panorama',
  'Plattekloof', 'Welgemoed', 'Tyger Valley', 'Tygerberg', 'Kraaifontein',
  'Kuils River', 'Stellenbosch', 'Paarl', 'Thornton', 'Ravensmead',
  'Van Riebeeckshof', 'Amandelrug', 'Pinelands'
);

-- Helderberg
UPDATE service_locations SET suburb = 'Helderberg' 
WHERE name IN (
  'Helderberg', 'Macassar', 'Faure', 'Firgrove'
);

-- Table Bay / Milnerton Area
UPDATE service_locations SET suburb = 'Table Bay' 
WHERE name IN (
  'Milnerton', 'Tableview', 'Century City', 'Sunset Beach', 'West Beach',
  'Bloubergrant', 'Bloubergstrand', 'Cape Gate', 'Marconi Beam', 'Ysterplaat',
  'Paarden Island'
);

-- False Bay / Southern Peninsula
UPDATE service_locations SET suburb = 'False Bay' 
WHERE name IN (
  'Muizenberg', 'Kalk Bay', 'Fish Hoek', 'Simons Town', 'Glencairn',
  'Kommetjie', 'Noordhoek', 'Scarborough', 'Sun Valley', 'St James', 'Clovelly',
  'Retreat', 'Southfield'
);

-- V&A Waterfront and Foreshore
UPDATE service_locations SET suburb = 'Waterfront & Foreshore' 
WHERE name IN (
  'V&A Waterfront', 'Waterfront', 'Foreshore'
);

-- Industrial and Commercial Areas
UPDATE service_locations SET suburb = 'Industrial & Commercial' 
WHERE name IN (
  'Epping', 'Athlone', 'Belhar', 'Brooklyn', 'Kensington', 'Kenwyn',
  'Lansdowne', 'Maitland', 'Ottery', 'Salt River', 'Crawford', 'Chempet',
  'Clareinch', 'D''urbanvale', 'Howard Place', 'Mutual Park',
  'Walmer Estate', 'Zonnebloem'
);

-- Bishopscourt (often considered part of Southern Suburbs but distinct)
UPDATE service_locations SET suburb = 'Bishopscourt' 
WHERE name = 'Bishopscourt';

-- Cape Town (general/central)
UPDATE service_locations SET suburb = 'Cape Town' 
WHERE name = 'Cape Town';

-- Set suburb for any remaining locations to 'Cape Town' if not yet set
UPDATE service_locations 
SET suburb = 'Cape Town' 
WHERE suburb IS NULL;

-- Add comment to column
COMMENT ON COLUMN service_locations.suburb IS 'Suburb or region grouping for the location within Cape Town';

