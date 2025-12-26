-- SQL Script to Fix Existing Cleaner Profiles
-- Run this in Supabase SQL Editor to fix profiles for existing cleaner accounts
-- This extracts phone numbers and cleaner_id from auth.users metadata and updates profiles

-- Update profiles for users with @bokkie.co.za emails
UPDATE public.profiles p
SET 
  phone = COALESCE(
    p.phone,
    NULLIF((u.raw_user_meta_data->>'phone'), ''),
    NULLIF((u.raw_user_meta_data->>'normalized_phone'), ''),
    -- Extract phone from email if email is in format {phone}@bokkie.co.za
    CASE 
      WHEN u.email LIKE '%@bokkie.co.za' 
      THEN '+' || REPLACE(u.email, '@bokkie.co.za', '')
      ELSE NULL
    END
  ),
  cleaner_id = COALESCE(
    p.cleaner_id,
    NULLIF((u.raw_user_meta_data->>'cleaner_id'), '')
  ),
  email = COALESCE(p.email, u.email),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND u.email LIKE '%@bokkie.co.za'
  AND (
    p.phone IS NULL 
    OR p.cleaner_id IS NULL
    OR p.email IS NULL
  );

-- Create profiles for cleaner users that don't have profiles yet
INSERT INTO public.profiles (
  id,
  email,
  phone,
  cleaner_id,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(
    NULLIF((u.raw_user_meta_data->>'phone'), ''),
    NULLIF((u.raw_user_meta_data->>'normalized_phone'), ''),
    -- Extract phone from email if email is in format {phone}@bokkie.co.za
    CASE 
      WHEN u.email LIKE '%@bokkie.co.za' 
      THEN '+' || REPLACE(u.email, '@bokkie.co.za', '')
      ELSE NULL
    END
  ) as phone,
  NULLIF((u.raw_user_meta_data->>'cleaner_id'), '') as cleaner_id,
  NOW()
FROM auth.users u
WHERE u.email LIKE '%@bokkie.co.za'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- Show results
SELECT 
  p.id,
  p.email,
  p.phone,
  p.cleaner_id,
  u.raw_user_meta_data->>'cleaner_id' as metadata_cleaner_id,
  u.raw_user_meta_data->>'phone' as metadata_phone
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE '%@bokkie.co.za'
ORDER BY p.email;
