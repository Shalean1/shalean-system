-- ============================================================================
-- ADD MISSING LOCATIONS
-- ============================================================================
-- Migration: Add missing Cape Town locations to service_locations table
-- Created: 2025-01-XX
-- Description: Adds locations from the provided list that are not already in the database

-- Function to generate slug from location name
CREATE OR REPLACE FUNCTION generate_location_slug(location_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(location_name, '''', '', 'g'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert missing locations
-- Using a DO block to check both name and slug conflicts
DO $$
DECLARE
  loc_record RECORD;
  loc_slug TEXT;
BEGIN
  FOR loc_record IN 
    SELECT * FROM (VALUES
      ('Amandelrug', 100),
      ('Athlone', 101),
      ('Belhar', 102),
      ('Bellville', 103),
      ('Bellville South', 104),
      ('Bishopscourt', 105),
      ('Bloubergrant', 106),
      ('Bloubergstrand', 107),
      ('Bo-Kaap', 108),
      ('Bothasig', 109),
      ('Brackenfell', 110),
      ('Brooklyn', 111),
      ('Cape Gate', 112),
      ('Cape Town', 113),
      ('Century City', 114),
      ('Chempet', 115),
      ('Clareinch', 116),
      ('Clifton', 117),
      ('Clovelly', 118),
      ('Crawford', 119),
      ('D''urbanvale', 120),
      ('De Waterkant', 121),
      ('Devil''s Peak Estate', 122),
      ('Durbanville', 123),
      ('Edgemead', 124),
      ('Epping', 125),
      ('Faure', 126),
      ('Firgrove', 127),
      ('Foreshore', 128),
      ('Glencairn', 129),
      ('Glosderry', 130),
      ('Goodwood', 131),
      ('Groote Schuur', 132),
      ('Harfield Village', 133),
      ('Heathfield', 134),
      ('Helderberg', 135),
      ('Higgovale', 136),
      ('Howard Place', 137),
      ('Kensington', 138),
      ('Kenwyn', 139),
      ('Kirstenhof', 140),
      ('Kommetjie', 141),
      ('Kraaifontein', 142),
      ('Kreupelbosch', 143),
      ('Kuils River', 144),
      ('Lansdowne', 145),
      ('Lower Vrede', 146),
      ('Macassar', 147),
      ('Maitland', 148),
      ('Marconi Beam', 149),
      ('Meadowridge', 150),
      ('Milnerton', 151),
      ('Monte Vista', 152),
      ('Mowbray', 153),
      ('Mutual Park', 154),
      ('Noordhoek', 155),
      ('Old Oak', 156),
      ('Ottery', 157),
      ('Paarden Island', 158),
      ('Paarl', 159),
      ('Panorama', 160),
      ('Parow', 161),
      ('Parow East', 162),
      ('Pinelands', 163),
      ('Plattekloof', 164),
      ('Ravensmead', 165),
      ('Retreat', 166),
      ('Rhodes', 167),
      ('Rondebosch East', 168),
      ('Salt River', 169),
      ('Scarborough', 170),
      ('Schotse Kloof', 171),
      ('Southfield', 172),
      ('St James', 173),
      ('Stellenbosch', 174),
      ('Sun Valley', 175),
      ('Sunnyside', 176),
      ('Sunset Beach', 177),
      ('Tableview', 178),
      ('Thornton', 179),
      ('Tyger Valley', 180),
      ('Tygerberg', 181),
      ('University Estate', 182),
      ('Van Riebeeckshof', 183),
      ('Walmer Estate', 184),
      ('Waterfront', 185),
      ('Welgemoed', 186),
      ('West Beach', 187),
      ('Wetton', 188),
      ('Wittebome', 189),
      ('Ysterplaat', 190),
      ('Zonnebloem', 191)
    ) AS t(name, display_order)
  LOOP
    loc_slug := generate_location_slug(loc_record.name);
    
    -- Skip if name or slug already exists
    IF NOT EXISTS (
      SELECT 1 FROM service_locations 
      WHERE name = loc_record.name OR slug = loc_slug
    ) THEN
      INSERT INTO service_locations (name, slug, city, display_order)
      VALUES (loc_record.name, loc_slug, 'Cape Town', loc_record.display_order);
    END IF;
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_location_slug(TEXT);

