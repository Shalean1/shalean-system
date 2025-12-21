-- Migration: Create quotes table
-- Created: 2025-01-XX
-- Description: Table for storing quote requests from customers

-- ============================================================================
-- QUOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Location details
  location TEXT NOT NULL,
  custom_location TEXT,
  
  -- Service details
  service TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 1,
  additional_services JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_location ON quotes(location);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all quotes (admin access)
DROP POLICY IF EXISTS "Authenticated users can view quotes" ON quotes;
CREATE POLICY "Authenticated users can view quotes" ON quotes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Anyone can create quotes (public form submission)
DROP POLICY IF EXISTS "Anyone can create quotes" ON quotes;
CREATE POLICY "Anyone can create quotes" ON quotes
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Authenticated users can update quotes (admin access)
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON quotes;
CREATE POLICY "Authenticated users can update quotes" ON quotes
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE quotes IS 'Stores quote requests submitted by customers through the quote form';
COMMENT ON COLUMN quotes.status IS 'Status of the quote: pending, contacted, converted (to booking), or declined';
COMMENT ON COLUMN quotes.additional_services IS 'Array of additional service IDs selected by the customer';
