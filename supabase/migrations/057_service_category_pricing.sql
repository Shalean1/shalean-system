-- ============================================================================
-- SERVICE CATEGORY PRICING
-- ============================================================================
-- This table stores display prices for service categories shown on the services page
-- These are separate from booking prices and are used for marketing/display purposes

CREATE TABLE IF NOT EXISTS service_category_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL UNIQUE, -- e.g., "residential-cleaning", "commercial-cleaning", "specialized-cleaning"
  category_name TEXT NOT NULL,
  display_price DECIMAL(10, 2) NOT NULL, -- Display price (e.g., "Starting from R500")
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_category_pricing_order ON service_category_pricing(display_order);
CREATE INDEX IF NOT EXISTS idx_service_category_pricing_active ON service_category_pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_service_category_pricing_category ON service_category_pricing(category_id);

-- Enable RLS
ALTER TABLE service_category_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access to active service category pricing
CREATE POLICY "Allow public read access to active service category pricing"
  ON service_category_pricing
  FOR SELECT
  USING (is_active = true);

-- Insert default service category pricing
INSERT INTO service_category_pricing (category_id, category_name, display_price, description, display_order) VALUES
  ('residential-cleaning', 'General Residential Cleaning Services', 500.00, 'Regular maintenance cleaning for homes and private properties', 1),
  ('commercial-cleaning', 'General Commercial Cleaning Services', 800.00, 'Professional cleaning services for businesses, offices, and retail spaces', 2),
  ('specialized-cleaning', 'Specialized Cleaning Services', 900.00, 'Deep cleaning and specialized services for both residential and commercial properties', 3)
ON CONFLICT (category_id) DO UPDATE SET
  display_price = EXCLUDED.display_price,
  updated_at = NOW();

