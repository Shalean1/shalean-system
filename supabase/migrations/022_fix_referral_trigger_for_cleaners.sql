-- Migration: Fix referral code trigger to skip cleaner accounts
-- Created: 2025-01-XX
-- Description: Update initialize_referral_code trigger to skip cleaner accounts
--              and handle missing function gracefully

-- Update the referral code initialization function to skip cleaner accounts
-- and handle missing function gracefully
CREATE OR REPLACE FUNCTION initialize_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip referral code creation for cleaner accounts
  -- Cleaner accounts have cleaner_id in metadata and don't need referral codes
  IF NEW.raw_user_meta_data->>'cleaner_id' IS NOT NULL 
     AND NULLIF(TRIM(NEW.raw_user_meta_data->>'cleaner_id'), '') IS NOT NULL THEN
    -- This is a cleaner account, skip referral code creation
    RETURN NEW;
  END IF;

  -- Try to generate referral code for new user
  -- Wrap in exception handler in case function doesn't exist
  BEGIN
    PERFORM get_or_create_referral_code(NEW.id);
  EXCEPTION
    WHEN undefined_function THEN
      -- Function doesn't exist (migration 015 hasn't been run)
      -- Skip referral code creation and continue
      RAISE WARNING 'Referral code function not found, skipping referral code creation for user %', NEW.id;
    WHEN OTHERS THEN
      -- Any other error - log but don't fail user creation
      RAISE WARNING 'Error creating referral code for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_user_created_init_referral_code should already exist
-- If it doesn't exist, migration 015_referral_system.sql needs to be run first
-- This migration just updates the function to be more robust
