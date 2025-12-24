# Complete Import Guide - Step by Step

## What You Have:
1. **`055_import_bookings_data.sql`** - Contains transformation logic (NO booking data)
2. **`bookings_rows (1).sql`** - Contains the actual booking data (INSERT statement)

## What You Need to Do:

### Step 1: Prepare the Data File

1. Open `c:\Users\27825\Downloads\bookings_rows (1).sql` in a text editor
2. Find the line that starts with: `INSERT INTO "public"."bookings"`
3. Replace it with: `INSERT INTO bookings_staging`
4. Copy the ENTIRE modified INSERT statement (it's all on one line)

### Step 2: Run in Supabase SQL Editor

Open Supabase Dashboard → SQL Editor and run these **in order**:

#### Part A: Setup (Copy from `055_import_bookings_data.sql` lines 1-147)
```sql
-- Copy everything from line 1 to line 147
-- This creates functions and staging table
```

#### Part B: Insert Your Data
```sql
-- Paste your modified INSERT statement here
-- The one that starts with: INSERT INTO bookings_staging
```

#### Part C: Transform Data (Copy from `055_import_bookings_data.sql` lines 167-253)
```sql
-- Copy the INSERT INTO bookings (...) SELECT ... section
-- This transforms and imports the data
```

#### Part D: Cleanup (Copy from `055_import_bookings_data.sql` lines 258-265)
```sql
-- Copy the DROP FUNCTION statements
```

### Step 3: Verify

Run this query:
```sql
SELECT COUNT(*) FROM bookings;
```

If it returns a number > 0, the data was imported successfully!

### Step 4: Fix Admin Access

Run `056_add_admin_bookings_policy.sql` to allow admins to see all bookings.

## Quick PowerShell Helper

If you want to automate the file modification, run:
```powershell
cd C:\Users\27825\shalean-system
.\scripts\prepare_bookings_import.ps1
```

This will create a modified INSERT file ready to use.




