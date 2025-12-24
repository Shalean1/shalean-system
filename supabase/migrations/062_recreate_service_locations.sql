-- ============================================================================
-- RECREATE SERVICE LOCATIONS WITH CORRECT SUBURB NAMES
-- ============================================================================
-- Migration: Update all suburb assignments to use the 8 correct suburb names
-- Created: 2025-01-XX
-- Description: Reassigns all locations to the correct suburbs: Atlantic Seaboard, 
--              Cape Flats, City Bowl, Eastern Suburbs, Northern Suburbs, 
--              Southern Suburbs, South Peninsula, West Coast

-- Clear all existing suburb assignments first
UPDATE service_locations SET suburb = NULL;

-- ============================================================================
-- ATLANTIC SEABOARD
-- ============================================================================
-- Coastal areas along the Atlantic Ocean
UPDATE service_locations SET suburb = 'Atlantic Seaboard' 
WHERE name IN (
  'Sea Point', 'Camps Bay', 'Green Point', 'Mouille Point', 
  'Three Anchor Bay', 'Bantry Bay', 'Fresnaye', 'Bakoven', 
  'Llandudno', 'Clifton'
);

-- ============================================================================
-- CAPE FLATS
-- ============================================================================
-- Flatland areas, industrial and commercial zones
UPDATE service_locations SET suburb = 'Cape Flats' 
WHERE name IN (
  'Athlone', 'Belhar', 'Brooklyn', 'Chempet', 'Clareinch', 'Crawford',
  'Epping', 'Kensington', 'Kenwyn', 'Lansdowne', 'Maitland', 'Ottery',
  'Salt River', 'D''urbanvale', 'Howard Place', 'Mutual Park',
  'Walmer Estate', 'Zonnebloem'
);

-- ============================================================================
-- CITY BOWL
-- ============================================================================
-- Central Cape Town area
UPDATE service_locations SET suburb = 'City Bowl' 
WHERE name IN (
  'City Bowl', 'Gardens', 'Tamboerskloof', 'Oranjezicht', 'Vredehoek',
  'Devils Peak', 'Devil''s Peak Estate', 'Bo-Kaap', 'De Waterkant', 
  'Schotse Kloof', 'Higgovale', 'Groote Schuur', 'University Estate',
  'V&A Waterfront', 'Waterfront', 'Foreshore'
);

-- ============================================================================
-- EASTERN SUBURBS
-- ============================================================================
-- Eastern areas of Cape Town
UPDATE service_locations SET suburb = 'Eastern Suburbs' 
WHERE name IN (
  'Helderberg', 'Macassar', 'Faure', 'Firgrove'
);

-- ============================================================================
-- NORTHERN SUBURBS
-- ============================================================================
-- Northern residential and commercial areas
UPDATE service_locations SET suburb = 'Northern Suburbs' 
WHERE name IN (
  'Amandelrug', 'Bellville', 'Bellville South', 'Bothasig', 'Brackenfell',
  'Durbanville', 'Goodwood', 'Parow', 'Parow East', 'Edgemead', 
  'Monte Vista', 'Panorama', 'Plattekloof', 'Welgemoed', 'Tyger Valley',
  'Tygerberg', 'Kraaifontein', 'Kuils River', 'Stellenbosch', 'Paarl',
  'Thornton', 'Ravensmead', 'Van Riebeeckshof', 'Pinelands'
);

-- ============================================================================
-- SOUTHERN SUBURBS
-- ============================================================================
-- Southern residential areas
UPDATE service_locations SET suburb = 'Southern Suburbs' 
WHERE name IN (
  'Claremont', 'Constantia', 'Newlands', 'Rondebosch', 'Rondebosch East',
  'Observatory', 'Woodstock', 'Wynberg', 'Kenilworth', 'Plumstead',
  'Diep River', 'Bergvliet', 'Tokai', 'Steenberg', 'Harfield Village',
  'Heathfield', 'Kirstenhof', 'Meadowridge', 'Mowbray', 'Wetton',
  'Wittebome', 'Rhodes', 'Lower Vrede', 'Kreupelbosch', 'Glosderry',
  'Old Oak', 'Sunnyside', 'Bishopscourt'
);

-- ============================================================================
-- SOUTH PENINSULA
-- ============================================================================
-- False Bay coastal areas and southern peninsula
UPDATE service_locations SET suburb = 'South Peninsula' 
WHERE name IN (
  'Muizenberg', 'Kalk Bay', 'Fish Hoek', 'Simons Town', 'Clovelly',
  'Glencairn', 'Kommetjie', 'Noordhoek', 'Scarborough', 'Sun Valley',
  'St James', 'Retreat', 'Southfield'
);

-- ============================================================================
-- WEST COAST
-- ============================================================================
-- Table Bay and west coast areas
UPDATE service_locations SET suburb = 'West Coast' 
WHERE name IN (
  'Bloubergrant', 'Bloubergstrand', 'Cape Gate', 'Century City',
  'Marconi Beam', 'Milnerton', 'Tableview', 'Sunset Beach', 'West Beach',
  'Ysterplaat', 'Paarden Island', 'Hout Bay', 'Cape Town'
);

-- ============================================================================
-- SET DEFAULT FOR ANY REMAINING LOCATIONS
-- ============================================================================
-- Set any remaining unassigned locations to 'Cape Town' (which is now in West Coast)
-- This should not happen if all locations are properly assigned above
UPDATE service_locations 
SET suburb = 'West Coast' 
WHERE suburb IS NULL;

-- ============================================================================
-- VERIFY AND REPORT
-- ============================================================================
-- This will help verify the migration worked correctly
DO $$
DECLARE
  total_locations INTEGER;
  unassigned_count INTEGER;
  suburb_counts RECORD;
BEGIN
  SELECT COUNT(*) INTO total_locations FROM service_locations WHERE is_active = true;
  SELECT COUNT(*) INTO unassigned_count FROM service_locations WHERE suburb IS NULL AND is_active = true;
  
  RAISE NOTICE 'Total active locations: %', total_locations;
  RAISE NOTICE 'Unassigned locations: %', unassigned_count;
  
  RAISE NOTICE 'Locations by suburb:';
  FOR suburb_counts IN 
    SELECT suburb, COUNT(*) as count 
    FROM service_locations 
    WHERE is_active = true 
    GROUP BY suburb 
    ORDER BY suburb
  LOOP
    RAISE NOTICE '  %: % locations', suburb_counts.suburb, suburb_counts.count;
  END LOOP;
END $$;

