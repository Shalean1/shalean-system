-- Migration: Fix existing cleaner profiles
-- Created: 2025-01-XX
-- Description: Updates profiles for existing cleaner accounts that were created before
--              profiles were properly set up, or whose profiles are missing phone/cleaner_id

-- Function to update or create profile for existing cleaner users
CREATE OR REPLACE FUNCTION fix_cleaner_profile(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_email TEXT;
  v_phone TEXT;
  v_cleaner_id TEXT;
  v_user_metadata JSONB;
BEGIN
  -- Get user email and metadata from auth.users
  SELECT email, raw_user_meta_data INTO v_email, v_user_metadata
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_email IS NULL THEN
    RAISE WARNING 'User % not found in auth.users', p_user_id;
    RETURN;
  END IF;
  
  -- Extract phone and cleaner_id from metadata
  v_phone := COALESCE(
    NULLIF(v_user_metadata->>'phone', ''),
    NULLIF(v_user_metadata->>'normalized_phone', '')
  );
  
  v_cleaner_id := NULLIF(v_user_metadata->>'cleaner_id', '');
  
  -- If email is in format {phone}@shalean.co.za, extract phone from email
  IF v_email LIKE '%@shalean.co.za' AND v_phone IS NULL THEN
    v_phone := REPLACE(v_email, '@shalean.co.za', '');
    -- Add + if it doesn't start with it (assuming South African numbers)
    IF v_phone NOT LIKE '+%' THEN
      v_phone := '+' || v_phone;
    END IF;
  END IF;
  
  -- Upsert profile
  INSERT INTO public.profiles (
    id,
    email,
    phone,
    cleaner_id,
    updated_at
  )
  VALUES (
    p_user_id,
    v_email,
    v_phone,
    v_cleaner_id,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id),
    updated_at = NOW();
    
  RAISE NOTICE 'Fixed profile for user %: email=%, phone=%, cleaner_id=%', 
    p_user_id, v_email, v_phone, v_cleaner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix profiles for users with @shalean.co.za emails (cleaner accounts)
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE email LIKE '%@shalean.co.za'
  LOOP
    BEGIN
      PERFORM fix_cleaner_profile(user_record.id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error fixing profile for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS fix_cleaner_profile(UUID);
