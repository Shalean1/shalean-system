-- Supabase Database Schema for Shalean Cleaning Services

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  
  -- Service details
  service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'deep', 'move-in-out', 'airbnb')),
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'weekly', 'bi-weekly', 'monthly')),
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  
  -- Property details
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 1,
  extras JSONB DEFAULT '[]'::jsonb,
  
  -- Address
  street_address TEXT NOT NULL,
  apt_unit TEXT,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Cleaner preference
  cleaner_preference TEXT DEFAULT 'no-preference' CHECK (cleaner_preference IN ('no-preference', 'natasha-m', 'estery-p', 'beaul')),
  
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

-- Optional: Create a profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
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

-- Create index on email in profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name'
  );
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
  ('Move-In Cleaning', 'move-in-cleaning', 4)
ON CONFLICT (name) DO NOTHING;


