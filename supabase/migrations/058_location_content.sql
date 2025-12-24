-- ============================================================================
-- LOCATION CONTENT
-- ============================================================================
-- This table stores unique, SEO-optimized content for each location page
-- Allows each location to have custom content to avoid duplicate content penalties

CREATE TABLE IF NOT EXISTS location_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_slug TEXT NOT NULL UNIQUE, -- References service_locations.slug
  intro_paragraph TEXT, -- First paragraph with location-specific context
  main_content TEXT, -- Main descriptive content paragraph
  closing_paragraph TEXT, -- Optional closing paragraph
  seo_keywords TEXT[], -- Location-specific keywords array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_content_slug ON location_content(location_slug);

-- Enable RLS
ALTER TABLE location_content ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access to location content
-- Drop policy if it exists to allow re-running migration
DROP POLICY IF EXISTS "Allow public read access to location content" ON location_content;

CREATE POLICY "Allow public read access to location content"
  ON location_content
  FOR SELECT
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_location_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to allow re-running migration
DROP TRIGGER IF EXISTS location_content_updated_at ON location_content;

CREATE TRIGGER location_content_updated_at
  BEFORE UPDATE ON location_content
  FOR EACH ROW
  EXECUTE FUNCTION update_location_content_updated_at();

