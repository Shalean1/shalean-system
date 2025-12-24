# Complete Import Guide - All in One

## ✅ Step 1: Prepare the Data (Already Done!)

The script has already prepared your data file:
- ✅ Created: `supabase/migrations/055_bookings_data_insert.sql`
- This file contains your booking data ready to import

## 📋 Step 2: Run the Import in Supabase SQL Editor

Open Supabase Dashboard → SQL Editor and run these **in order**:

### Part A: Setup (Run First)
1. Open `supabase/migrations/055_complete_import.sql`
2. Copy everything from the beginning up to the line that says `-- PART 2: INSERT DATA INTO STAGING TABLE`
3. Paste and run in SQL Editor
4. This creates the functions and staging table

### Part B: Insert Data (Run Second)
1. Open `supabase/migrations/055_bookings_data_insert.sql`
2. Copy the **entire** contents (it's one large INSERT statement)
3. Paste and run in SQL Editor
4. Wait for it to complete (may take 30-60 seconds)

### Part C: Transform Data (Run Third)
1. Go back to `supabase/migrations/055_complete_import.sql`
2. Copy the section starting from `-- PART 3: TRANSFORM AND INSERT INTO BOOKINGS TABLE`
3. Copy up to (but not including) `-- PART 4: CLEANUP`
4. Paste and run in SQL Editor
5. This transforms and imports the data into the bookings table

### Part D: Cleanup (Run Fourth)
1. Copy the `-- PART 4: CLEANUP` section from `055_complete_import.sql`
2. Paste and run in SQL Editor

## ✅ Step 3: Verify the Import

Run this query:
```sql
SELECT COUNT(*) as total_bookings FROM bookings;
```

You should see a number > 0.

## ✅ Step 4: Enable Admin Access

Run `supabase/migrations/056_add_admin_bookings_policy.sql` to allow admins to view all bookings.

## ✅ Step 5: Check Admin Dashboard

1. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Restart your development server
3. Open the admin dashboard
4. You should now see all the imported bookings!

## Troubleshooting

### If Part B fails with "relation bookings_staging does not exist"
- Make sure you ran Part A first

### If Part C shows 0 rows inserted
- Check that Part B completed successfully
- Run: `SELECT COUNT(*) FROM bookings_staging;` to verify data is in staging

### If bookings don't appear in admin dashboard
- Run `056_add_admin_bookings_policy.sql`
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Restart your dev server




