-- Migration: Create popular_services table
-- Created: 2025-12-13
-- Description: Table to manage popular service tags displayed on the homepage

-- Create popular_services table
CREATE TABLE IF NOT EXISTS popular_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'popular_services' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE popular_services ADD COLUMN description TEXT;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_popular_services_order ON popular_services(display_order);
CREATE INDEX IF NOT EXISTS idx_popular_services_active ON popular_services(is_active);

-- Enable Row Level Security
ALTER TABLE popular_services ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active popular services" ON popular_services;
DROP POLICY IF EXISTS "Authenticated users can manage popular services" ON popular_services;

-- Anyone can view active popular services
CREATE POLICY "Anyone can view active popular services" ON popular_services
  FOR SELECT
  USING (is_active = true);

-- Only authenticated users can manage popular services (admin)
CREATE POLICY "Authenticated users can manage popular services" ON popular_services
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on popular_services
DROP TRIGGER IF EXISTS update_popular_services_updated_at ON popular_services;
CREATE TRIGGER update_popular_services_updated_at
  BEFORE UPDATE ON popular_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default popular services
INSERT INTO popular_services (name, slug, description, display_order) VALUES
  ('Holiday Cleaning', 'holiday-cleaning', 'Get your home ready for the holidays with our thorough cleaning service', 1),
  ('Office Cleaning', 'office-cleaning', 'Professional office cleaning to maintain a productive workspace', 2),
  ('Deep Cleaning', 'deep-cleaning', 'Intensive cleaning for every corner of your home or office', 3),
  ('Move-In Cleaning', 'move-in-cleaning', 'Make your new space spotless before moving in', 4)
ON CONFLICT (name) DO NOTHING;
