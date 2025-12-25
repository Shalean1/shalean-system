# Step-by-Step Import Instructions for bookings_rows (1).sql

Follow these steps to import your booking data:

## Step 1: Prepare the SQL File

1. Open `c:\Users\27825\Downloads\bookings_rows (1).sql` in a text editor
2. Find the line that starts with: `INSERT INTO "public"."bookings"`
3. Replace `INSERT INTO "public"."bookings"` with `INSERT INTO bookings_staging`
4. Save the file (or copy the modified INSERT statement)

## Step 2: Run the Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to **SQL Editor**

2. **Create Staging Table and Functions**
   - Copy the first part of `055_import_bookings_data.sql` (from the beginning up to the line that says `-- STEP 1: Copy the INSERT statement...`)
   - Paste and run in SQL Editor
   - This creates the staging table and helper functions

3. **Import Data into Staging Table**
   - Copy your modified INSERT statement (the one with `INSERT INTO bookings_staging`)
   - Paste and run in SQL Editor
   - Wait for it to complete (this may take a minute for large datasets)

4. **Transform and Import to Bookings Table**
   - In SQL Editor, go back to `055_import_bookings_data.sql`
   - Copy the section starting from `-- TRANSFORM AND INSERT INTO BOOKINGS TABLE`
   - Paste and run in SQL Editor
   - This will transform the data and insert it into the `bookings` table

5. **Cleanup**
   - Copy and run the cleanup section (DROP FUNCTION statements) from the migration file

## Step 3: Verify the Import

Run the verification queries from `056_verify_bookings_import.sql`:

```sql
-- Check total count
SELECT COUNT(*) as total_bookings FROM bookings;

-- Check sample records
SELECT 
  id,
  booking_reference,
  service_type,
  contact_first_name,
  contact_last_name,
  total_amount,
  status
FROM bookings
ORDER BY created_at DESC
LIMIT 10;
```

## Step 4: Add Admin Access (if needed)

Run `056_add_admin_bookings_policy.sql` to ensure admins can view all bookings.

## Troubleshooting

### If the INSERT statement is too large:
- Split it into smaller chunks (e.g., 100 rows at a time)
- Or use a command-line tool like `psql` to import directly

### If you get foreign key errors:
- The `cleaner_id` UUIDs might not match your cleaners table
- This is okay - those bookings will have `assigned_cleaner_id` set to NULL

### If bookings don't appear in admin dashboard:
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Run the admin policy migration (`056_add_admin_bookings_policy.sql`)
3. Restart your development server










