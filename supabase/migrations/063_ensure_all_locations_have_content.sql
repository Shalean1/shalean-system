-- ============================================================================
-- ENSURE ALL LOCATIONS HAVE CONTENT
-- ============================================================================
-- Migration: Create content for all active locations that don't have content yet
-- Created: 2025-01-XX
-- Description: Populates location_content for all active service_locations that are missing content
--              This migration is idempotent and can be run multiple times safely

-- Function to generate location-specific content with variations
CREATE OR REPLACE FUNCTION generate_location_content(
  location_name TEXT,
  location_slug TEXT
)
RETURNS TABLE (
  intro_paragraph TEXT,
  main_content TEXT,
  closing_paragraph TEXT,
  seo_keywords TEXT[]
) AS $$
DECLARE
  intro_text TEXT;
  main_text TEXT;
  closing_text TEXT;
  keywords TEXT[];
  location_lower TEXT := lower(location_name);
  hash_val INTEGER;
  variant_num INTEGER;
BEGIN
  -- Use location slug to determine which variant to use (ensures consistency for same location)
  -- Convert slug to a numeric hash by summing character codes
  hash_val := 0;
  FOR i IN 1..length(location_slug) LOOP
    hash_val := hash_val + ascii(substring(location_slug, i, 1));
  END LOOP;
  variant_num := (abs(hash_val) % 4) + 1; -- 4 different variants
  
  -- Generate intro paragraph with location-specific context (4 variations)
  CASE variant_num
    WHEN 1 THEN
      intro_text := 'Looking for professional cleaning services in ' || location_name || ', Cape Town? Bokkie Cleaning Services offers trusted and reliable cleaning solutions for residents and businesses throughout the area. From regular house cleaning to deep cleaning services, move-in/out cleaning, and Airbnb turnover cleaning, we cater to all your cleaning needs in ' || location_name || '. Our experienced team understands the unique requirements of homes and businesses in this vibrant Cape Town suburb.';
    WHEN 2 THEN
      intro_text := 'Residents and business owners in ' || location_name || ' trust Bokkie Cleaning Services for their cleaning needs. We provide comprehensive cleaning services across this beautiful Cape Town area, handling everything from routine house cleaning and deep cleaning to specialized services like office cleaning and Airbnb preparation. Our professional cleaners are dedicated to delivering exceptional results that keep your ' || location_name || ' property looking its best.';
    WHEN 3 THEN
      intro_text := 'Bokkie Cleaning Services brings professional cleaning excellence to ' || location_name || ', Cape Town. Whether you need weekly house cleaning, a one-time deep clean, move-in/out cleaning, or Airbnb cleaning services, our skilled team has you covered. We''ve been serving the ' || location_name || ' community with reliable, high-quality cleaning services that exceed expectations.';
    ELSE
      intro_text := 'Professional cleaning services in ' || location_name || ' are now more accessible than ever with Bokkie Cleaning Services. We specialize in providing top-tier cleaning solutions for homeowners, property managers, and businesses in this Cape Town area. From standard house cleaning and deep cleaning to move-in/out services and Airbnb cleaning, we offer tailored solutions for every cleaning need in ' || location_name || '.';
  END CASE;
  
  -- Generate main content paragraph (4 variations)
  CASE variant_num
    WHEN 1 THEN
      main_text := 'When you book with Bokkie in ' || location_name || ', you can expect fully equipped cleaning professionals who bring all necessary supplies and eco-friendly cleaning products. Our comprehensive service portfolio includes regular house cleaning, deep cleaning, move-in/out cleaning, Airbnb turnover cleaning, office cleaning, and various specialized services. Booking is simple and secure through our online platform - no cash required. We pride ourselves on punctuality, efficiency, and consistently delivering results that go beyond expectations.';
    WHEN 2 THEN
      main_text := 'Our cleaning teams working in ' || location_name || ' come fully prepared with premium cleaning supplies and environmentally friendly products. We provide a wide range of services designed to meet diverse needs: standard house cleaning, intensive deep cleaning, move-in/out cleaning, Airbnb preparation, commercial office cleaning, and custom cleaning solutions. Easy online booking ensures a hassle-free experience, and all transactions are secure and cashless. Timeliness and attention to detail are hallmarks of our service delivery in the ' || location_name || ' area.';
    WHEN 3 THEN
      main_text := 'Bokkie''s cleaning professionals serving ' || location_name || ' arrive fully stocked with all cleaning supplies and eco-conscious products. Our extensive service menu covers regular house cleaning, deep cleaning sessions, move-in/out cleaning, Airbnb cleaning, office cleaning, and specialized cleaning options. The booking process is streamlined through our secure digital platform, eliminating the need for cash transactions. We maintain strict punctuality standards and focus on delivering cleaning results that consistently surpass client expectations.';
    ELSE
      main_text := 'Booking cleaning services in ' || location_name || ' with Bokkie means working with professionals who bring their own supplies and eco-friendly cleaning solutions. Our diverse service offerings include routine house cleaning, comprehensive deep cleaning, move-in/out cleaning, Airbnb turnover services, office cleaning, and tailored cleaning packages. Our user-friendly online booking system makes scheduling convenient, secure, and completely cashless. Expect on-time arrivals and meticulous cleaning that exceeds your standards.';
  END CASE;
  
  -- Generate closing paragraph with call to action (4 variations)
  CASE variant_num
    WHEN 1 THEN
      closing_text := 'Transform your ' || location_name || ' home or office with Bokkie''s professional cleaning services. Book online today to experience our commitment to excellence, flexible scheduling options, and transparent pricing. Join the growing number of satisfied customers in Cape Town who trust us for their cleaning needs. Schedule your next cleaning appointment now and see the Bokkie difference.';
    WHEN 2 THEN
      closing_text := 'Experience premium cleaning services in ' || location_name || ' with Bokkie Cleaning Services. Our flexible scheduling, competitive pricing, and dedication to customer satisfaction have made us a leading choice for cleaning services throughout Cape Town. Ready to get started? Book your cleaning service online today and discover why residents and businesses choose Bokkie.';
    WHEN 3 THEN
      closing_text := 'Don''t wait to enjoy a cleaner space in ' || location_name || '. Bokkie Cleaning Services makes it easy to book professional cleaning through our online platform. With flexible scheduling, clear pricing, and unmatched service quality, we''re the preferred cleaning partner for many in the Cape Town area. Book your appointment today and join our community of satisfied customers.';
    ELSE
      closing_text := 'Take the first step toward a spotless home or office in ' || location_name || '. Bokkie Cleaning Services offers convenient online booking, flexible scheduling, and transparent pricing that makes professional cleaning accessible. We''re committed to providing exceptional service that keeps Cape Town properties looking their best. Contact us today to schedule your cleaning service.';
  END CASE;
  
  -- Generate SEO keywords array
  keywords := ARRAY[
    'cleaning services ' || location_name,
    'professional cleaners ' || location_name,
    'house cleaning ' || location_name,
    'office cleaning ' || location_name,
    'residential cleaning ' || location_name,
    'commercial cleaning ' || location_name,
    'deep cleaning ' || location_name,
    'move-in cleaning ' || location_name,
    'move-out cleaning ' || location_name,
    'Airbnb cleaning ' || location_name,
    'home cleaning ' || location_name,
    'maid service ' || location_name,
    'cleaning company ' || location_name,
    'cleaning services Cape Town',
    'cleaning services Western Cape'
  ];
  
  RETURN QUERY SELECT intro_text, main_text, closing_text, keywords;
END;
$$ LANGUAGE plpgsql;

-- Insert location content for all active locations that don't already have content
DO $$
DECLARE
  loc_record RECORD;
  content_record RECORD;
  created_count INTEGER := 0;
  skipped_count INTEGER := 0;
BEGIN
  FOR loc_record IN 
    SELECT name, slug 
    FROM service_locations 
    WHERE is_active = true
    ORDER BY display_order, name
  LOOP
    -- Skip if content already exists
    IF NOT EXISTS (
      SELECT 1 FROM location_content WHERE location_slug = loc_record.slug
    ) THEN
      -- Generate content for this location
      SELECT * INTO content_record
      FROM generate_location_content(loc_record.name, loc_record.slug);
      
      -- Insert the content
      INSERT INTO location_content (
        location_slug,
        intro_paragraph,
        main_content,
        closing_paragraph,
        seo_keywords
      ) VALUES (
        loc_record.slug,
        content_record.intro_paragraph,
        content_record.main_content,
        content_record.closing_paragraph,
        content_record.seo_keywords
      );
      
      created_count := created_count + 1;
      RAISE NOTICE 'Created content for location: % (%)', loc_record.name, loc_record.slug;
    ELSE
      skipped_count := skipped_count + 1;
      RAISE NOTICE 'Content already exists for location: % (%), skipping', loc_record.name, loc_record.slug;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Created content for % locations', created_count;
  RAISE NOTICE '  Skipped % locations (content already exists)', skipped_count;
  RAISE NOTICE '  Total active locations: %', created_count + skipped_count;
  RAISE NOTICE '========================================';
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_location_content(TEXT, TEXT);








