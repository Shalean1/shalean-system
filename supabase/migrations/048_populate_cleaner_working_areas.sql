-- Migration: Populate cleaner working_areas from existing areas data
-- Created: 2025-01-XX
-- Description: Maps the old 'areas' TEXT[] column to the new 'working_areas' JSONB column,
--              normalizing suburb names to match service_locations table format

-- ============================================================================
-- HELPER FUNCTION: Normalize suburb name
-- ============================================================================
-- Normalizes common variations of suburb names to match service_locations format
CREATE OR REPLACE FUNCTION normalize_suburb_name(suburb_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Trim whitespace and convert to title case for matching
  suburb_name := trim(both ' ' from suburb_name);
  
    -- Common normalization mappings to match service_locations table
  RETURN CASE
    WHEN lower(suburb_name) IN ('capetown', 'cape town') THEN 'Cape Town'
    WHEN lower(suburb_name) IN ('seapoint', 'sea point') THEN 'Sea Point'
    WHEN lower(suburb_name) IN ('camps bay', 'campsbay') THEN 'Camps Bay'
    WHEN lower(suburb_name) IN ('greenpoint', 'green point') THEN 'Green Point'
    WHEN lower(suburb_name) IN ('va waterfront', 'v&a waterfront', 'waterfront') THEN 'V&A Waterfront'
    WHEN lower(suburb_name) IN ('citybowl', 'city bowl') THEN 'City Bowl'
    WHEN lower(suburb_name) IN ('tamboerskloof', 'tamboers kloof') THEN 'Tamboerskloof'
    WHEN lower(suburb_name) IN ('mouillepoint', 'mouille point') THEN 'Mouille Point'
    WHEN lower(suburb_name) IN ('three anchor bay', 'threeanchorbay') THEN 'Three Anchor Bay'
    WHEN lower(suburb_name) IN ('bantrybay', 'bantry bay') THEN 'Bantry Bay'
    WHEN lower(suburb_name) IN ('houtbay', 'hout bay') THEN 'Hout Bay'
    WHEN lower(suburb_name) IN ('fishhoek', 'fish hoek') THEN 'Fish Hoek'
    WHEN lower(suburb_name) IN ('kalkbay', 'kalk bay') THEN 'Kalk Bay'
    WHEN lower(suburb_name) IN ('simons town', 'simons-town', 'simon''s town', 'simonstown') THEN 'Simons Town'
    WHEN lower(suburb_name) IN ('diepriver', 'diep river') THEN 'Diep River'
    WHEN lower(suburb_name) IN ('begviliet', 'bergvliet') THEN 'Bergvliet'
    WHEN lower(suburb_name) IN ('rondebocsh', 'rondebosch') THEN 'Rondebosch'
    WHEN lower(suburb_name) IN ('muizernberg', 'muizenberg') THEN 'Muizenberg'
    WHEN lower(suburb_name) IN ('heathfield', 'heatfiled') THEN 'Heathfield'
    WHEN lower(suburb_name) IN ('westlake', 'west lake') THEN 'Westlake'
    WHEN lower(suburb_name) IN ('clifton') THEN 'Clifton' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('st james') THEN 'St James' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('false bay') THEN 'False Bay' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('lakeside') THEN 'Lakeside' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('rosebank') THEN 'Rosebank' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('mowbary', 'mowbray') THEN 'Mowbray' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('retreat') THEN 'Retreat' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('bishopscourt', 'bishops court') THEN 'Bishopscourt' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('noordhoek') THEN 'Noordhoek' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('kommetjie') THEN 'Kommetjie' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('scarborough') THEN 'Scarborough' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('lansdowne') THEN 'Lansdowne' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('steernberg', 'steenberg') THEN 'Steenberg'
    WHEN lower(suburb_name) IN ('ottery') THEN 'Ottery' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('table view', 'tableview') THEN 'Table View' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('parklands') THEN 'Parklands' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('century city') THEN 'Century City' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('blouberg', 'bloubergstrand') THEN 'Blouberg' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('milnerton') THEN 'Milnerton' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('bellville') THEN 'Bellville' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('parow') THEN 'Parow' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('somerset west') THEN 'Somerset West' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('strand') THEN 'Strand' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('bothasig') THEN 'Bothasig' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('richwood') THEN 'Richwood' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('sundown') THEN 'Sundown' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('burgundy estate') THEN 'Burgundy Estate' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('sunningdale') THEN 'Sunningdale' -- Note: May need to add to service_locations if missing
    WHEN lower(suburb_name) IN ('bigbay', 'big bay') THEN 'Big Bay' -- Note: May need to add to service_locations if missing
    ELSE initcap(suburb_name) -- Convert to title case as fallback
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POPULATE working_areas FROM areas COLUMN
-- ============================================================================
-- For cleaners that have areas data, convert to working_areas JSONB
-- Only updates cleaners where working_areas is currently empty/null
UPDATE cleaners
SET working_areas = (
  SELECT COALESCE(
    jsonb_agg(DISTINCT normalize_suburb_name(unnest_val)), 
    '[]'::jsonb
  )
  FROM unnest(
    COALESCE(areas, ARRAY[]::TEXT[])
  ) AS unnest_val
  WHERE normalize_suburb_name(unnest_val) IS NOT NULL
    AND normalize_suburb_name(unnest_val) != ''
)
WHERE (working_areas IS NULL OR working_areas = '[]'::jsonb)
  AND areas IS NOT NULL 
  AND array_length(areas, 1) > 0;

-- ============================================================================
-- EXAMPLE: Manual assignment for specific cleaners (optional)
-- ============================================================================
-- If you want to manually assign working areas for specific cleaners,
-- uncomment and modify the following examples:

-- Example: Assign Claremont to a specific cleaner by cleaner_id
-- UPDATE cleaners
-- SET working_areas = '["Claremont"]'::jsonb
-- WHERE cleaner_id = 'example-cleaner-id'
--   AND (working_areas IS NULL OR working_areas = '[]'::jsonb);

-- Example: Assign multiple suburbs to a cleaner
-- UPDATE cleaners
-- SET working_areas = '["Claremont", "Sea Point", "Camps Bay"]'::jsonb
-- WHERE cleaner_id = 'example-cleaner-id'
--   AND (working_areas IS NULL OR working_areas = '[]'::jsonb);

-- ============================================================================
-- CLEANUP: Drop helper function (optional, can keep for future use)
-- ============================================================================
DROP FUNCTION IF EXISTS normalize_suburb_name(TEXT);

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this migration:
-- 1. Review the working_areas for each cleaner to ensure accuracy
-- 2. Update any cleaners manually if their areas weren't properly converted
-- 3. The suburb names should match exactly with service_locations.name
-- 4. Suburbs that don't exist in service_locations will still be included,
--    but they won't match any location filters
-- 5. You can verify the results with:
--    SELECT cleaner_id, name, working_areas 
--    FROM cleaners 
--    WHERE working_areas IS NOT NULL AND working_areas != '[]'::jsonb
--    ORDER BY name;

