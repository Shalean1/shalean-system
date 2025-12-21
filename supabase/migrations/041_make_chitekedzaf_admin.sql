-- Grant admin role to chitekedzaf@gmail.com
-- This migration sets is_admin = true for the specified user

-- Update profiles table where email matches
UPDATE profiles
SET is_admin = true
WHERE email = 'chitekedzaf@gmail.com';

-- Also update via auth.users if profile doesn't exist yet
-- This handles the case where the user exists in auth.users but not in profiles
INSERT INTO profiles (id, email, is_admin)
SELECT u.id, u.email, true
FROM auth.users u
WHERE u.email = 'chitekedzaf@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET is_admin = true;
