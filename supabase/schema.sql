-- Supabase Database Schema for Shalean Cleaning Services

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANERS TABLE (must be created first as it's referenced by other tables)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaner_id TEXT NOT NULL UNIQUE, -- e.g., "natasha-m"
  name TEXT NOT NULL,
  bio TEXT,
  rating DECIMAL(3, 2), -- e.g., 4.70
  total_jobs INTEGER DEFAULT 0,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  availability_days JSONB DEFAULT '[]'::jsonb, -- Array of days of the week (e.g., ["Monday", "Tuesday"])
  working_areas JSONB DEFAULT '[]'::jsonb, -- Array of suburb names where the cleaner provides service (e.g., ["Sea Point", "Camps Bay"])
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cleaners_order ON cleaners(display_order);
CREATE INDEX IF NOT EXISTS idx_cleaners_active ON cleaners(is_active);
CREATE INDEX IF NOT EXISTS idx_cleaners_available ON cleaners(is_available);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  
  -- Service details
  service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'deep', 'move-in-out', 'airbnb', 'carpet-cleaning')),
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'weekly', 'bi-weekly', 'monthly')),
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  
  -- Property details
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 1,
  extras JSONB DEFAULT '[]'::jsonb,
  
  -- Carpet cleaning specific fields
  fitted_rooms_count INTEGER,
  loose_carpets_count INTEGER,
  rooms_furniture_status TEXT CHECK (rooms_furniture_status IN ('furnished', 'empty') OR rooms_furniture_status IS NULL),
  
  -- Address
  street_address TEXT NOT NULL,
  apt_unit TEXT,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Cleaner preference
  cleaner_preference TEXT DEFAULT 'no-preference' CHECK (cleaner_preference IN ('no-preference', 'natasha-m', 'estery-p', 'beaul')),
  assigned_cleaner_id TEXT REFERENCES cleaners(cleaner_id),
  
  -- Instructions
  special_instructions TEXT,
  
  -- Contact information
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Pricing & Discount
  discount_code TEXT,
  tip_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_reference TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on booking_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Create index on contact_email for user bookings
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(contact_email);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Create index on assigned_cleaner_id
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_cleaner ON bookings(assigned_cleaner_id);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = contact_email
  );

-- Policy: Anyone can create bookings (anonymous or authenticated)
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Users can update their own bookings
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = contact_email
  );

-- Policy: Cleaners can view bookings assigned to them
DROP POLICY IF EXISTS "Cleaners can view assigned bookings" ON bookings;
CREATE POLICY "Cleaners can view assigned bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  );

-- Policy: Cleaners can update status of bookings assigned to them
DROP POLICY IF EXISTS "Cleaners can update assigned booking status" ON bookings;
CREATE POLICY "Cleaners can update assigned booking status" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.cleaner_id = bookings.assigned_cleaner_id
      AND profiles.cleaner_id IS NOT NULL
    )
  );

-- Optional: Create a profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  cleaner_id TEXT REFERENCES cleaners(cleaner_id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Cleaners can view their own profile
DROP POLICY IF EXISTS "Cleaners can view own profile" ON profiles;
CREATE POLICY "Cleaners can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Cleaners can update their own profile
DROP POLICY IF EXISTS "Cleaners can update own profile" ON profiles;
CREATE POLICY "Cleaners can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create index on email in profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on cleaner_id in profiles
CREATE INDEX IF NOT EXISTS idx_profiles_cleaner_id ON profiles(cleaner_id);

-- Create index on is_admin for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Add unique constraint on phone for cleaner accounts (where cleaner_id is not null)
-- Note: This allows multiple regular users with same phone, but cleaners must have unique phones
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cleaner_phone_unique 
ON profiles(phone) 
WHERE cleaner_id IS NOT NULL AND phone IS NOT NULL;

-- Function to create profile on user signup
-- Updated to support both email and phone-based authentication
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_phone TEXT;
  user_cleaner_id TEXT;
BEGIN
  -- Extract phone from auth.users table or metadata
  user_phone := COALESCE(
    NEW.phone, -- Phone from auth.users table (for phone-based auth)
    NEW.raw_user_meta_data->>'phone' -- Phone from metadata as fallback
  );
  
  -- Extract cleaner_id from metadata if present
  user_cleaner_id := NEW.raw_user_meta_data->>'cleaner_id';
  
  -- Insert profile with all available data
  -- Use ON CONFLICT to prevent errors if profile already exists
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    full_name, 
    email,
    phone,
    cleaner_id
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email, -- Can be NULL for phone-based users
    user_phone,
    NULLIF(user_cleaner_id, '') -- Set cleaner_id if present and not empty
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update fields if profile already exists (shouldn't happen, but be safe)
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    email = COALESCE(EXCLUDED.email, profiles.email),
    cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  RETURN NEW;
EXCEPTION
  -- Catch any errors and log them, but don't fail the user creation
  WHEN OTHERS THEN
    -- Log the error but allow user creation to proceed
    -- The application code will handle profile creation/update manually
    RAISE WARNING 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create popular_services table
CREATE TABLE IF NOT EXISTS popular_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_popular_services_order ON popular_services(display_order);

-- Create index on is_active
CREATE INDEX IF NOT EXISTS idx_popular_services_active ON popular_services(is_active);

-- Enable RLS on popular_services
ALTER TABLE popular_services ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active popular services
DROP POLICY IF EXISTS "Anyone can view active popular services" ON popular_services;
CREATE POLICY "Anyone can view active popular services" ON popular_services
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can manage popular services (admin)
DROP POLICY IF EXISTS "Authenticated users can manage popular services" ON popular_services;
CREATE POLICY "Authenticated users can manage popular services" ON popular_services
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at on popular_services
DROP TRIGGER IF EXISTS update_popular_services_updated_at ON popular_services;
CREATE TRIGGER update_popular_services_updated_at
  BEFORE UPDATE ON popular_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default popular services
INSERT INTO popular_services (name, slug, display_order) VALUES
  ('Holiday Cleaning', 'holiday-cleaning', 1),
  ('Office Cleaning', 'office-cleaning', 2),
  ('Deep Cleaning', 'deep-cleaning', 3),
  ('Move-In Cleaning', 'move-in-cleaning', 4),
  ('Airbnb Cleaning', 'airbnb-cleaning', 5)
ON CONFLICT (name) DO NOTHING;

-- Trigger to update updated_at on cleaners
DROP TRIGGER IF EXISTS update_cleaners_updated_at ON cleaners;
CREATE TRIGGER update_cleaners_updated_at
  BEFORE UPDATE ON cleaners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Get cleaner_id from user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_cleaner_id_from_user()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT cleaner_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND cleaner_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN bookings.assigned_cleaner_id IS 'The cleaner_id assigned to complete this booking (may differ from cleaner_preference)';
COMMENT ON COLUMN profiles.cleaner_id IS 'Links user account to cleaner record if this is a cleaner account';
COMMENT ON COLUMN bookings.fitted_rooms_count IS 'Number of rooms with fitted carpets (for carpet-cleaning service)';
COMMENT ON COLUMN bookings.loose_carpets_count IS 'Number of loose carpets (for carpet-cleaning service)';
COMMENT ON COLUMN bookings.rooms_furniture_status IS 'Whether rooms have furniture (furnished) or are empty (for carpet-cleaning service)';


