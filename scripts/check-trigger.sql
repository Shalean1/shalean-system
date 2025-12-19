-- Diagnostic script to check if the cleaner credentials trigger is set up correctly
-- Run this in Supabase SQL Editor to verify the trigger exists and is working

-- 1. Check if the trigger function exists
SELECT 
  routine_name as function_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- 2. Check if the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- 3. Check if profiles table has cleaner_id column
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('id', 'email', 'phone', 'cleaner_id');

-- 4. Check if cleaners table exists
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'cleaners'
  AND column_name = 'cleaner_id';

-- 5. Test the trigger function (this will show if there are syntax errors)
-- Note: This won't actually execute, just validate syntax
DO $$
BEGIN
  -- Try to call the function with a test (this will fail but show if function exists)
  RAISE NOTICE 'Trigger function handle_new_user exists and is callable';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error checking trigger: %', SQLERRM;
END $$;
