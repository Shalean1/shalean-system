-- ============================================================================
-- REPLACE SHALEAN WITH BOKKIE IN LOCATION CONTENT
-- ============================================================================
-- Migration: Replace all instances of "Shalean" with "Bokkie" in location_content
-- Created: 2025-01-XX
-- Description: Updates all location content to use "Bokkie" branding instead of "Shalean"

-- Update intro_paragraph
UPDATE location_content
SET intro_paragraph = REPLACE(intro_paragraph, 'Shalean', 'Bokkie')
WHERE intro_paragraph LIKE '%Shalean%';

-- Update main_content
UPDATE location_content
SET main_content = REPLACE(main_content, 'Shalean', 'Bokkie')
WHERE main_content LIKE '%Shalean%';

-- Update closing_paragraph
UPDATE location_content
SET closing_paragraph = REPLACE(closing_paragraph, 'Shalean', 'Bokkie')
WHERE closing_paragraph LIKE '%Shalean%';

-- Update seo_keywords array (replace in each keyword string)
UPDATE location_content
SET seo_keywords = (
  SELECT ARRAY_AGG(
    REPLACE(keyword, 'Shalean', 'Bokkie')
  )
  FROM UNNEST(seo_keywords) AS keyword
)
WHERE EXISTS (
  SELECT 1
  FROM UNNEST(seo_keywords) AS keyword
  WHERE keyword LIKE '%Shalean%'
);

-- Also handle case-insensitive variations
UPDATE location_content
SET intro_paragraph = REPLACE(intro_paragraph, 'shalean', 'Bokkie')
WHERE intro_paragraph ILIKE '%shalean%';

UPDATE location_content
SET main_content = REPLACE(main_content, 'shalean', 'Bokkie')
WHERE main_content ILIKE '%shalean%';

UPDATE location_content
SET closing_paragraph = REPLACE(closing_paragraph, 'shalean', 'Bokkie')
WHERE closing_paragraph ILIKE '%shalean%';

-- Update updated_at timestamp
UPDATE location_content
SET updated_at = NOW()
WHERE intro_paragraph LIKE '%Shalean%' 
   OR main_content LIKE '%Shalean%' 
   OR closing_paragraph LIKE '%Shalean%'
   OR intro_paragraph ILIKE '%shalean%' 
   OR main_content ILIKE '%shalean%' 
   OR closing_paragraph ILIKE '%shalean%';

