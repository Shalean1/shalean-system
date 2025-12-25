-- Migration: Disable trigger and rely on application-level profile creation
-- Created: 2025-01-XX
-- Description: Disable the handle_new_user trigger to avoid database errors.
--              The application code in create-cleaner-credentials.ts already handles
--              profile creation manually, so the trigger is redundant and can cause issues.

-- Disable the trigger to prevent database errors during user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function definition in case we need to re-enable it later
-- but don't attach it to any trigger
-- The function handle_new_user() will remain but won't be called automatically

-- Note: Profile creation is now handled entirely in application code:
-- - app/actions/create-cleaner-credentials.ts (for cleaners)
-- - app/actions/auth.ts (for regular users via signup)
-- - components/dashboard/ProfileForm.tsx (for profile updates)

















