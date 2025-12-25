-- Add is_admin field to profiles table for admin role management

-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index on is_admin for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Comment for documentation
COMMENT ON COLUMN profiles.is_admin IS 'Indicates if the user has admin role and can access admin dashboard';












