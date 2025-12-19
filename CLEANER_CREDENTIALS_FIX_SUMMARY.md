# Cleaner Credentials Error Fix Summary

## Problem
You were getting "Database error creating user. The trigger may have failed" errors when trying to create cleaner credentials.

## Changes Made

### 1. Improved Error Handling (`app/actions/create-cleaner-credentials.ts`)
- **Enhanced error logging**: Now captures and displays:
  - Full error message from Supabase
  - Error code
  - Error details and hints
  - What field caused the error
- **User recovery check**: If user creation reports an error, the code now checks if the user was actually created (sometimes Supabase returns an error even when user is created)
- **Better error messages**: More specific error messages based on error type

### 2. Fixed Cleaner Login (`app/actions/cleaner-auth.ts`)
- **Email construction**: Now properly constructs email from phone number if cleaner's email isn't stored
- **More reliable**: Works even if profile doesn't have email stored

### 3. New Migration File (`supabase/migrations/021_simple_robust_trigger_fixed.sql`)
- **More robust trigger**: Enhanced version that:
  - Never fails user creation (always returns NEW)
  - Handles all error cases gracefully
  - Creates minimal profile if full profile creation fails
  - Better error handling for phone conflicts and foreign key violations

### 4. Diagnostic Tools
- **`scripts/check-trigger.sql`**: Diagnostic script to verify trigger setup
- **`CLEANER_CREDENTIALS_TROUBLESHOOTING.md`**: Comprehensive troubleshooting guide

## Next Steps

### Step 1: Check Server Logs
When you try to create credentials again, check your server console/terminal. You should now see detailed error information including:
- Full error message
- Error code
- Error details
- Error hints

This will help identify the actual problem.

### Step 2: Run the Fixed Migration
Try running the improved migration:

1. Open Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/021_simple_robust_trigger_fixed.sql`
3. Copy entire contents
4. Paste and run in SQL Editor
5. Verify success

### Step 3: Verify Setup
Run the diagnostic script:

1. Open `scripts/check-trigger.sql` in Supabase SQL Editor
2. Run it
3. Verify all checks pass

### Step 4: Try Creating Credentials Again
1. Go to `/admin/cleaners/create-credentials`
2. Fill in the form
3. Submit
4. **Check server console** for detailed error messages if it fails

## What to Look For

### In Server Console
Look for a log entry like:
```
Error creating auth user: {
  "error": {...},
  "errorMessage": "...",
  "errorCode": "...",
  "errorDetails": "...",
  "errorHint": "..."
}
```

This will tell you exactly what's failing.

### Common Issues Based on Error Code

- **403 or "permission"**: Service role key missing/incorrect
- **500 or "Database error"**: Trigger issue or database constraint
- **"already registered"**: User/email already exists
- **"foreign key"**: Cleaner doesn't exist in database
- **"unique constraint"**: Phone number already in use

## If Still Failing

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs → Postgres Logs
   - Look for errors around the time you tried to create credentials
   - Look for errors related to `handle_new_user` function

2. **Verify Prerequisites**:
   - `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
   - Migration `017_cleaner_dashboard.sql` has been run (adds `cleaner_id` column)
   - Migration `002_booking_dynamic_data.sql` has been run (creates `cleaners` table)

3. **Try Manual Test**:
   ```sql
   -- Test if you can create a user manually
   INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     'test@shalean.co.za',
     crypt('testpassword', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW()
   );
   ```
   If this fails, there's a deeper Supabase configuration issue.

## Files Changed

- `app/actions/create-cleaner-credentials.ts` - Improved error handling
- `app/actions/cleaner-auth.ts` - Fixed email construction
- `supabase/migrations/021_simple_robust_trigger_fixed.sql` - New robust trigger
- `scripts/check-trigger.sql` - Diagnostic script
- `CLEANER_CREDENTIALS_TROUBLESHOOTING.md` - Troubleshooting guide

## Expected Behavior After Fix

1. **Better error messages**: You'll see exactly what failed
2. **Automatic recovery**: If user is created despite error, code continues
3. **More reliable**: Trigger never fails user creation
4. **Better logging**: Full error details in server console

Try creating credentials again and check the server console for the detailed error message. This will help identify the root cause.
