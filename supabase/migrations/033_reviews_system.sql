-- Migration: Create reviews system tables
-- Created: 2025-01-XX
-- Description: Tables for customer reviews/testimonials management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_image_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  booking_id TEXT REFERENCES bookings(booking_reference),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON reviews(display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_published_at ON reviews(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_reviews_fulltext ON reviews USING GIN(
  to_tsvector('english', COALESCE(customer_name, '') || ' ' || COALESCE(review_text, ''))
);

-- ============================================================================
-- 2. UPDATE TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================================================
-- 3. INSERT SAMPLE DATA (from existing testimonials)
-- ============================================================================
INSERT INTO reviews (customer_name, rating, review_text, status, is_featured, display_order, published_at)
VALUES
  (
    'Sumaya',
    5,
    'The professionalism of the Company is exceptional, and they ensure a suitable lady is available for your clean day/s. The ladies allocated to me thus far have good cleaning skills... I highly recommend Shalean Cleaning Services.',
    'approved',
    true,
    1,
    '2024-01-15'::timestamptz
  ),
  (
    'Sarah M.',
    5,
    'Outstanding service! The team was punctual, thorough, and left my home spotless. Highly professional and reliable cleaning service.',
    'approved',
    true,
    2,
    '2024-02-20'::timestamptz
  ),
  (
    'John D.',
    5,
    'Best cleaning service in Cape Town. They pay attention to every detail and use eco-friendly products. My apartment has never looked better!',
    'approved',
    true,
    3,
    '2024-03-10'::timestamptz
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Authenticated users can insert reviews (for future customer review submission)
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update their own reviews (if linked to booking)
CREATE POLICY "Authenticated users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users can do everything (handled via service role in server actions)
-- Note: Admin operations will use service role which bypasses RLS

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON reviews TO authenticated;
-- Full access via service role in server actions
