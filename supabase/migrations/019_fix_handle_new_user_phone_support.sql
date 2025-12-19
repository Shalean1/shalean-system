-- Migration: Fix handle_new_user() to support phone-based authentication
-- Created: 2025-01-XX
-- Description: Update handle_new_user() trigger function to properly handle phone-based users and cleaner_id
-- BYPASS: This version is more robust and handles constraint violations gracefully
-- RLS: SECURITY DEFINER bypasses RLS, but we also add explicit error handling

-- Update the function to handle both email and phone-based users
-- This function now gracefully handles phone-based authentication and prevents
-- errors when profiles already exist or when phone numbers might conflict
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_phone TEXT;
  user_cleaner_id TEXT;
  existing_profile_id UUID;
  phone_conflict_exists BOOLEAN := FALSE;
  metadata_phone TEXT;
BEGIN
  -- Extract phone from auth.users table or metadata
  -- Try multiple sources: NEW.phone, raw_user_meta_data->>'phone', user_metadata->>'phone'
  metadata_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->'phone')::TEXT,
    NULL
  );
  
  user_phone := COALESCE(
    NULLIF(NEW.phone, ''), -- Phone from auth.users table (for phone-based auth)
    NULLIF(metadata_phone, ''), -- Phone from metadata
    NULLIF(TRIM(metadata_phone), '') -- Trimmed metadata phone
  );
  
  -- Extract cleaner_id from metadata if present
  user_cleaner_id := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'cleaner_id', ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'cleaner_id'), '')
  );
  
  -- Validate cleaner_id exists if provided (prevent foreign key violation)
  IF user_cleaner_id IS NOT NULL THEN
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.cleaners WHERE cleaner_id = user_cleaner_id) THEN
        RAISE WARNING 'Cleaner_id % does not exist, skipping cleaner_id for user %', user_cleaner_id, NEW.id;
        user_cleaner_id := NULL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error validating cleaner_id % for user %: %', user_cleaner_id, NEW.id, SQLERRM;
        user_cleaner_id := NULL;
    END;
  END IF;
  
  -- Check if profile already exists (shouldn't happen, but be safe)
  SELECT id INTO existing_profile_id FROM public.profiles WHERE id = NEW.id;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Profile already exists, just update it
    BEGIN
      UPDATE public.profiles SET
        phone = COALESCE(user_phone, phone),
        email = COALESCE(NEW.email, email),
        cleaner_id = COALESCE(user_cleaner_id, cleaner_id),
        first_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), first_name),
        last_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), last_name),
        full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), full_name)
      WHERE id = NEW.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error updating existing profile for user %: %', NEW.id, SQLERRM;
    END;
  ELSE
    -- Check for phone conflict if this is a cleaner account (before attempting insert)
    IF user_cleaner_id IS NOT NULL AND user_phone IS NOT NULL THEN
      BEGIN
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
      EXCEPTION
        WHEN OTHERS THEN
          -- If check fails, proceed without phone to avoid blocking user creation
          RAISE WARNING 'Error checking phone conflict for user %: %, proceeding without phone', NEW.id, SQLERRM;
          user_phone := NULL;
      END;
    END IF;
    
    -- Insert profile with all available data
    -- Use ON CONFLICT to prevent errors if profile was created between check and insert
    -- Wrap in exception handler to ensure we never fail user creation
    BEGIN
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
        NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email, -- Can be NULL for phone-based users
        user_phone,
        user_cleaner_id
      )
      ON CONFLICT (id) DO UPDATE SET
        -- Update fields if profile was created between check and insert
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        email = COALESCE(EXCLUDED.email, profiles.email),
        cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id),
        first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
        last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
    EXCEPTION
      WHEN unique_violation THEN
        -- Phone conflict detected - try inserting without phone
        BEGIN
          IF user_cleaner_id IS NOT NULL AND user_phone IS NOT NULL THEN
            -- Phone conflict for cleaner - insert without phone
            INSERT INTO public.profiles (
              id, 
              first_name, 
              last_name, 
              full_name, 
              email,
              cleaner_id
            )
            VALUES (
              NEW.id,
              NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
              NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
              NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
              NEW.email,
              user_cleaner_id
            )
            ON CONFLICT (id) DO UPDATE SET
              email = COALESCE(EXCLUDED.email, profiles.email),
              cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id),
              first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
              last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
              full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
            RAISE WARNING 'Phone % already in use, created profile without phone for cleaner user %', user_phone, NEW.id;
          ELSE
            -- Other unique violation - try basic insert
            INSERT INTO public.profiles (id, email)
            VALUES (NEW.id, NEW.email)
            ON CONFLICT (id) DO NOTHING;
            RAISE WARNING 'Unique constraint violation for user %, created minimal profile: %', NEW.id, SQLERRM;
          END IF;
        EXCEPTION
          WHEN OTHERS THEN
            -- If even fallback insert fails, try minimal insert
            BEGIN
              INSERT INTO public.profiles (id, email)
              VALUES (NEW.id, NEW.email)
              ON CONFLICT (id) DO NOTHING;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE WARNING 'Failed to create profile for user % after unique violation: %', NEW.id, SQLERRM;
            END;
        END;
      WHEN foreign_key_violation THEN
        -- Invalid cleaner_id - insert without cleaner_id
        BEGIN
          INSERT INTO public.profiles (
            id, 
            first_name, 
            last_name, 
            full_name, 
            email,
            phone
          )
          VALUES (
            NEW.id,
            NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NEW.email,
            user_phone
          )
          ON CONFLICT (id) DO UPDATE SET
            phone = COALESCE(EXCLUDED.phone, profiles.phone),
            email = COALESCE(EXCLUDED.email, profiles.email),
            first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
            last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
            full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
          RAISE WARNING 'Foreign key violation for user %, created profile without cleaner_id: %', NEW.id, SQLERRM;
        EXCEPTION
          WHEN OTHERS THEN
            -- If fallback insert fails, try minimal insert
            BEGIN
              INSERT INTO public.profiles (id, email)
              VALUES (NEW.id, NEW.email)
              ON CONFLICT (id) DO NOTHING;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE WARNING 'Failed to create profile for user % after foreign key violation: %', NEW.id, SQLERRM;
            END;
        END;
      WHEN OTHERS THEN
        -- Any other error - try minimal insert
        BEGIN
          INSERT INTO public.profiles (id, email)
          VALUES (NEW.id, NEW.email)
          ON CONFLICT (id) DO NOTHING;
          RAISE WARNING 'Error inserting profile for user %, created minimal profile: %', NEW.id, SQLERRM;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE WARNING 'Failed to create even minimal profile for user %: %', NEW.id, SQLERRM;
        END;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  -- Catch specific constraint violations and handle them gracefully
  WHEN unique_violation THEN
    -- Handle unique constraint violations (phone conflict for cleaners)
    -- Try inserting without phone if it's a cleaner account
    BEGIN
      IF user_cleaner_id IS NOT NULL AND user_phone IS NOT NULL THEN
        -- Phone conflict for cleaner - try without phone
        INSERT INTO public.profiles (
          id, 
          first_name, 
          last_name, 
          full_name, 
          email,
          cleaner_id
        )
        VALUES (
          NEW.id,
          NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
          NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
          NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
          NEW.email,
          user_cleaner_id
        )
        ON CONFLICT (id) DO UPDATE SET
          email = COALESCE(EXCLUDED.email, profiles.email),
          cleaner_id = COALESCE(EXCLUDED.cleaner_id, profiles.cleaner_id),
          first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
          last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
          full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
        RAISE WARNING 'Phone % already in use, created profile without phone for cleaner user %', user_phone, NEW.id;
      ELSE
        -- Other unique violation - try basic insert
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;
        RAISE WARNING 'Unique constraint violation for user %, created minimal profile: %', NEW.id, SQLERRM;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error handling unique violation for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
  WHEN foreign_key_violation THEN
    -- Handle foreign key violations (invalid cleaner_id)
    BEGIN
      INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        full_name, 
        email,
        phone
      )
      VALUES (
        NEW.id,
        NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        user_phone
      )
      ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        email = COALESCE(EXCLUDED.email, profiles.email),
        first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
        last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
      RAISE WARNING 'Foreign key violation for user %, created profile without cleaner_id: %', NEW.id, SQLERRM;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error handling foreign key violation for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log any other errors but don't fail the user creation
    -- The application code will handle profile creation/update manually
    RAISE WARNING 'Error in handle_new_user trigger for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Try to create a minimal profile as fallback
    BEGIN
      INSERT INTO public.profiles (id, email)
      VALUES (NEW.id, NEW.email)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- If even minimal insert fails, log and continue
        RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: SECURITY DEFINER functions bypass RLS automatically
-- The trigger function runs with elevated privileges and can insert into profiles
-- No additional RLS policy is needed for SECURITY DEFINER functions
