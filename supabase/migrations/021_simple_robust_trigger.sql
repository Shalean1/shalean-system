-- Migration: Simple and robust handle_new_user trigger
-- Created: 2025-01-XX
-- Description: Alternative to migration 019 - a simpler trigger that's less likely to fail
--              This is a fallback option if you prefer triggers over application-level creation

-- Drop the complex trigger function and create a simpler version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_phone TEXT;
  user_cleaner_id TEXT;
  phone_conflict_exists BOOLEAN := FALSE;
BEGIN
  -- Extract phone and cleaner_id from metadata
  user_phone := COALESCE(
    NULLIF(NEW.phone, ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  );
  
  user_cleaner_id := NULLIF(NEW.raw_user_meta_data->>'cleaner_id', '');
  
  -- Check for phone conflict if this is a cleaner account
  IF user_cleaner_id IS NOT NULL AND user_phone IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 
      FROM public.profiles 
      WHERE phone = user_phone 
        AND cleaner_id IS NOT NULL 
        AND cleaner_id != user_cleaner_id
        AND phone IS NOT NULL
    ) INTO phone_conflict_exists;
    
    IF phone_conflict_exists THEN
      -- Phone conflict detected, skip phone insertion but still create profile
      RAISE WARNING 'Phone % already in use by another cleaner, skipping phone for user %', user_phone, NEW.id;
      user_phone := NULL;
    END IF;
  END IF;
  
  -- Insert profile with ON CONFLICT to handle race conditions
  INSERT INTO public.profiles (
    id, 
    email,
    phone,
    first_name, 
    last_name, 
    full_name,
    cleaner_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_phone,
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    user_cleaner_id
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update only if new values are provided and different
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id);
  
  RETURN NEW;
EXCEPTION
  -- Catch all errors and log them, but don't fail user creation
  WHEN unique_violation THEN
    -- Handle unique constraint violations (phone conflict for cleaners)
    -- Try inserting without phone if it's a cleaner account
    BEGIN
      IF user_cleaner_id IS NOT NULL AND user_phone IS NOT NULL THEN
        INSERT INTO public.profiles (
          id, 
          email,
          first_name, 
          last_name, 
          full_name,
          cleaner_id
        )
        VALUES (
          NEW.id,
          NEW.email,
          NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
          NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
          NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
          user_cleaner_id
        )
        ON CONFLICT (id) DO UPDATE SET
          email = COALESCE(EXCLUDED.email, profiles.email),
          first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
          last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
          full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
          cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id);
        RAISE WARNING 'Phone conflict for cleaner user %, created profile without phone', NEW.id;
      ELSE
        -- Other unique violation - try minimal insert
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;
        RAISE WARNING 'Unique constraint violation for user %, created minimal profile', NEW.id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error handling unique violation for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Error in handle_new_user trigger for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW to allow user creation to succeed even if profile creation fails
    -- The application code will handle profile creation manually
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: This trigger:
-- 1. Checks for phone conflicts before inserting (for cleaner accounts)
-- 2. Uses ON CONFLICT to handle race conditions
-- 3. Catches unique violations and handles them gracefully (creates profile without phone if needed)
-- 4. Catches all other exceptions and logs them without failing user creation
-- 5. Relies on application code to handle profile creation if trigger fails
-- 6. Is simpler than migration 019 while still handling phone conflicts properly
