# Cleaner Credentials Troubleshooting Guide

If you're getting "Database error creating user" errors, follow these steps:

## Step 1: Verify Migration Has Been Run

Run this query in Supabase SQL Editor to check if the trigger exists:

```sql
-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';
```

**Expected Result:** You should see one row with `on_auth_user_created` trigger.

**If no results:** The migration hasn't been run. Go to Step 2.

## Step 2: Run the Migration

**Option A: Try the fixed version first (recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open file: `supabase/migrations/021_simple_robust_trigger_fixed.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run"
7. Verify success message appears

**Option B: Use the original migration**

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open file: `supabase/migrations/021_simple_robust_trigger.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run"
7. Verify success message appears

**If migration fails:**
- Check the error message in Supabase SQL Editor
- Common issues:
  - Missing `cleaner_id` column in profiles table (run migration `017_cleaner_dashboard.sql` first)
  - Missing `cleaners` table (run migration `002_booking_dynamic_data.sql` first)

## Step 3: Verify Trigger Function Exists

Run this query:

```sql
-- Check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';
```

**Expected Result:** You should see `handle_new_user` function listed.

## Step 4: Check Service Role Key

The error might be due to missing or incorrect service role key:

1. Check `.env.local` file exists
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Get the key from: Supabase Dashboard → Settings → API → service_role key (secret)
4. Restart your development server after adding/updating the key

## Step 5: Check Server Logs

Look at your server console/terminal for detailed error messages. The improved error handling will now show:
- Full error message from Supabase
- Error code
- Error details and hints
- What field caused the error

## Step 6: Run Diagnostic Script

Run the diagnostic script to check everything:

1. Open Supabase SQL Editor
2. Open file: `scripts/check-trigger.sql`
3. Copy and paste into SQL Editor
4. Click "Run"
5. Review all results

## Common Issues and Solutions

### Issue: "Permission denied" or "JWT" error

**Solution:**
- `SUPABASE_SERVICE_ROLE_KEY` is missing or incorrect
- Check `.env.local` file
- Restart dev server after adding key

### Issue: "Trigger may have failed"

**Solution:**
- Run migration `021_simple_robust_trigger.sql`
- Verify trigger exists (Step 1)
- Check Supabase logs for trigger errors

### Issue: "This phone number is already registered"

**Solution:**
- Phone number is already in use by another cleaner
- Check existing cleaner credentials
- Use a different phone number

### Issue: "Invalid cleaner selected"

**Solution:**
- The cleaner_id doesn't exist in the cleaners table
- Refresh the page to reload cleaner list
- Verify cleaner exists in database

### Issue: User creation fails but user exists

**Solution:**
- This can happen if trigger throws an error but user is created
- The code now handles this automatically
- Check if profile was created manually
- Try creating credentials again (it will update existing profile)

## Manual Profile Creation (If Trigger Fails)

If the trigger keeps failing, you can manually create profiles after user creation:

```sql
-- Find the user ID first
SELECT id, email FROM auth.users WHERE email = '27792022648@shalean.co.za';

-- Then create profile (replace USER_ID and CLEANER_ID)
INSERT INTO profiles (id, email, phone, cleaner_id)
VALUES (
  'USER_ID_FROM_ABOVE',
  '27792022648@shalean.co.za',
  '+27792022648',
  'beaul'
)
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  cleaner_id = EXCLUDED.cleaner_id;
```

## Issue: "get_or_create_referral_code does not exist"

**Solution:**
This error occurs when the referral code trigger tries to create a referral code but the function doesn't exist. Run migration `022_fix_referral_trigger_for_cleaners.sql`:

1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/022_fix_referral_trigger_for_cleaners.sql`
3. Copy entire contents
4. Paste and run in SQL Editor
5. This will update the referral code trigger to skip cleaner accounts and handle missing function gracefully

**Alternative:** If you don't need the referral system, you can disable the referral code trigger:
```sql
DROP TRIGGER IF EXISTS on_user_created_init_referral_code ON auth.users;
```

## Still Having Issues?

1. Check Supabase Dashboard → Logs → Postgres Logs for detailed errors
2. Check your server console for the full error details (now includes error code, details, and hints)
3. Verify all prerequisites from `CLEANER_CREDENTIALS_SETUP.md`
4. Try creating credentials for a different cleaner to isolate the issue
5. If you see "get_or_create_referral_code" errors, run migration `022_fix_referral_trigger_for_cleaners.sql`
