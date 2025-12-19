# Cleaner Credentials Setup Guide

This guide will help you set up cleaner credentials so cleaners can login using phone number and password on `/cleaner/login`.

## Prerequisites

- Supabase project set up
- Environment variables configured (`.env.local`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (required for creating cleaner credentials)

## Step 1: Run the Database Migration

The trigger migration must be run to automatically create profiles when cleaner credentials are created.

### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Open the file: `supabase/migrations/021_simple_robust_trigger.sql`
6. Copy the entire contents of the file
7. Paste into the SQL Editor
8. Click **Run** to execute the migration
9. Verify success - you should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

## Step 2: Verify the Migration

Run this query in the SQL Editor to verify the trigger exists:

```sql
-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

You should see:
- Trigger: `on_auth_user_created` on table `auth.users`
- Function: `handle_new_user` (function)

## Step 3: Create Cleaner Credentials

1. **Access the Admin Panel:**
   - Log in to your application at `/auth/login`
   - Navigate to `/admin` (or click "Admin" in the header)
   - Click on "Cleaner Credentials" card

2. **Fill in the Form:**
   - Select a cleaner from the dropdown
   - Enter phone number (e.g., `+27792022648`)
   - Optionally enter an email address
   - Enter a password (minimum 6 characters)
   - Confirm the password

3. **Submit:**
   - Click "Create Credentials"
   - You should see a success message
   - The cleaner will now appear as "Has Credentials" in the status list

## Step 4: Test Cleaner Login

1. **Navigate to Cleaner Login:**
   - Go to `/cleaner/login`

2. **Login with Phone and Password:**
   - Enter the phone number used when creating credentials
   - Enter the password
   - Click "Sign In"
   - You should be redirected to `/cleaner` dashboard

## How It Works

### Credential Creation Flow

1. Admin selects a cleaner and enters phone/password
2. System creates a Supabase auth user with:
   - Email: Constructed from phone (e.g., `27792022648@shalean.co.za`) or provided email
   - Password: The provided password
   - Metadata: Contains `cleaner_id` and `phone`
3. Trigger automatically creates a profile in `profiles` table with:
   - `id`: Matches auth user ID
   - `phone`: The cleaner's phone number
   - `email`: The email used for auth
   - `cleaner_id`: Links to the cleaner record
4. If trigger fails, the application code manually creates the profile

### Login Flow

1. Cleaner enters phone number and password
2. System finds cleaner profile by phone number
3. System constructs email from phone (if not stored) or uses stored email
4. System signs in using email and password
5. Cleaner is redirected to dashboard

## Troubleshooting

### Error: "Database error creating user. The trigger may have failed."

**Solution:**
1. **Check if migration was run:**
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
   If no results, run the migration (see Step 1).

2. **Check server logs** - The improved error handling now shows detailed error messages including:
   - Full error text from Supabase
   - Error codes
   - Error details and hints
   - What specifically failed

3. **Verify service role key:**
   - Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
   - Get it from: Supabase Dashboard → Settings → API → service_role key (secret)
   - Restart dev server after adding/updating

4. **Run diagnostic script:**
   - Open `scripts/check-trigger.sql` in Supabase SQL Editor
   - Run it to check trigger, function, and table setup

5. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Postgres Logs
   - Look for errors related to `handle_new_user` function

See `CLEANER_CREDENTIALS_TROUBLESHOOTING.md` for detailed troubleshooting steps.

### Error: "This cleaner already has login credentials"

**Solution:**
- The cleaner already has credentials
- Check the "Cleaners Status" section at the bottom of the form
- Cleaners with credentials show "Has Credentials" badge

### Error: "This phone number is already registered to another cleaner"

**Solution:**
- Each phone number can only be used by one cleaner
- Check if another cleaner is using this phone number
- Use a different phone number or update the existing cleaner's credentials

### Error: "Permission denied" or "JWT" error

**Solution:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Get the service role key from: Supabase Dashboard → Settings → API → service_role key (secret)
- Restart your development server after adding the key

### Cleaner cannot login

**Solution:**
- Verify credentials were created successfully
- Check that the phone number matches exactly (including country code format)
- Ensure password is correct
- Check browser console for errors
- Verify the cleaner profile exists in the `profiles` table with correct `cleaner_id`

## Database Schema

The system uses these tables:

- `cleaners`: Stores cleaner information (name, bio, rating, etc.)
- `profiles`: Links auth users to cleaners via `cleaner_id`
- `auth.users`: Supabase auth users

Key relationships:
- `profiles.cleaner_id` → `cleaners.cleaner_id` (foreign key)
- `profiles.id` → `auth.users.id` (foreign key)
- Unique constraint: `phone` + `cleaner_id` (one phone per cleaner)

## Security Notes

- The service role key has full database access - keep it secret
- Cleaner passwords are hashed by Supabase Auth
- Phone numbers are validated before credential creation
- Each cleaner can only have one set of credentials
- Each phone number can only be used by one cleaner account
