-- Migration: Simple and robust handle_new_user trigger (Fixed Version)
-- Created: 2025-01-XX
-- Description: Fixed version that ensures user creation never fails even if profile creation fails
--              This version is more defensive and handles all edge cases

-- First, drop any existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_phone TEXT;
  user_cleaner_id TEXT;
  phone_conflict_exists BOOLEAN := FALSE;
BEGIN
  -- Extract phone and cleaner_id from metadata
  -- Handle both NEW.phone (if phone auth is used) and metadata
  user_phone := COALESCE(
    NULLIF(TRIM(NEW.phone), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
  );
  
  user_cleaner_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'cleaner_id'), '');
  
  -- Check for phone conflict if this is a cleaner account
  IF user_cleaner_id IS NOT NULL AND user_cleaner_id != '' AND user_phone IS NOT NULL AND user_phone != '' THEN
    BEGIN
      SELECT EXISTS(
        SELECT 1 
        FROM public.profiles 
        WHERE phone = user_phone 
          AND cleaner_id IS NOT NULL 
          AND cleaner_id != user_cleaner_id
          AND phone IS NOT NULL
      ) INTO phone_conflict_exists;
    EXCEPTION
      WHEN OTHERS THEN
        -- If check fails, assume no conflict and continue
        phone_conflict_exists := FALSE;
        RAISE WARNING 'Error checking phone conflict for user %: %', NEW.id, SQLERRM;
    END;
    
    IF phone_conflict_exists THEN
      -- Phone conflict detected, skip phone insertion but still create profile
      RAISE WARNING 'Phone % already in use by another cleaner, skipping phone for user %', user_phone, NEW.id;
      user_phone := NULL;
    END IF;
  END IF;
  
  -- Insert profile with ON CONFLICT to handle race conditions
  -- Wrap in BEGIN/EXCEPTION to ensure it never fails user creation
  BEGIN
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
      COALESCE(NEW.email, ''),
      user_phone,
      NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      user_cleaner_id
    )
    ON CONFLICT (id) DO UPDATE SET
      -- Update only if new values are provided and different
      email = COALESCE(NULLIF(EXCLUDED.email, ''), profiles.email),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
      last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
      cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id);
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle unique constraint violations (phone conflict for cleaners)
      BEGIN
        IF user_cleaner_id IS NOT NULL AND user_cleaner_id != '' THEN
          -- Try inserting without phone if it's a cleaner account
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
            COALESCE(NEW.email, ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
            user_cleaner_id
          )
          ON CONFLICT (id) DO UPDATE SET
            email = COALESCE(NULLIF(EXCLUDED.email, ''), profiles.email),
            first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
            last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
            full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
            cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id);
          RAISE WARNING 'Phone conflict for cleaner user %, created profile without phone', NEW.id;
        ELSE
          -- Other unique violation - try minimal insert
          INSERT INTO public.profiles (id, email)
          VALUES (NEW.id, COALESCE(NEW.email, ''))
          ON CONFLICT (id) DO NOTHING;
          RAISE WARNING 'Unique constraint violation for user %, created minimal profile', NEW.id;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Even if this fails, try minimal insert
          BEGIN
            INSERT INTO public.profiles (id, email)
            VALUES (NEW.id, COALESCE(NEW.email, ''))
            ON CONFLICT (id) DO NOTHING;
            RAISE WARNING 'Error handling unique violation for user %, created minimal profile: %', NEW.id, SQLERRM;
          EXCEPTION
            WHEN OTHERS THEN
              -- Last resort: just log and continue
              RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
          END;
      END;
    WHEN foreign_key_violation THEN
      -- Foreign key violation - invalid cleaner_id
      BEGIN
        -- Try creating profile without cleaner_id
        INSERT INTO public.profiles (id, email, phone)
        VALUES (NEW.id, COALESCE(NEW.email, ''), user_phone)
        ON CONFLICT (id) DO UPDATE SET
          email = COALESCE(NULLIF(EXCLUDED.email, ''), profiles.email),
          phone = COALESCE(EXCLUDED.phone, profiles.phone);
        RAISE WARNING 'Foreign key violation for user %, created profile without cleaner_id: %', NEW.id, SQLERRM;
      EXCEPTION
        WHEN OTHERS THEN
          -- Try minimal insert
          BEGIN
            INSERT INTO public.profiles (id, email)
            VALUES (NEW.id, COALESCE(NEW.email, ''))
            ON CONFLICT (id) DO NOTHING;
            RAISE WARNING 'Error handling foreign key violation for user %, created minimal profile: %', NEW.id, SQLERRM;
          EXCEPTION
            WHEN OTHERS THEN
              RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
          END;
      END;
    WHEN OTHERS THEN
      -- Catch all other errors and log them, but don't fail user creation
      BEGIN
        -- Try minimal insert as last resort
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, COALESCE(NEW.email, ''))
        ON CONFLICT (id) DO NOTHING;
        RAISE WARNING 'Error in handle_new_user trigger for user %: % (SQLSTATE: %). Created minimal profile.', 
          NEW.id, SQLERRM, SQLSTATE;
      EXCEPTION
        WHEN OTHERS THEN
          -- Even minimal insert failed - just log and continue
          RAISE WARNING 'Critical error in handle_new_user trigger for user %: % (SQLSTATE: %). Profile will be created manually by application.', 
            NEW.id, SQLERRM, SQLSTATE;
      END;
  END;
  
  -- Always return NEW to allow user creation to succeed
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Note: This trigger:
-- 1. Always returns NEW, ensuring user creation never fails
-- 2. Handles phone conflicts gracefully
-- 3. Handles foreign key violations (invalid cleaner_id)
-- 4. Handles all other errors gracefully
-- 5. Creates minimal profile if full profile creation fails
-- 6. Application code will update profile with missing fields if needed
--
-- IMPORTANT: If you're getting "get_or_create_referral_code does not exist" errors,
-- run migration 022_fix_referral_trigger_for_cleaners.sql to fix the referral code trigger
