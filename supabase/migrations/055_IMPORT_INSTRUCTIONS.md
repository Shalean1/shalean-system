# Import Bookings Data - Instructions

This migration imports booking data from the old schema format into the new schema.

## Prerequisites

1. You have the `bookings_rows.sql` file with the old INSERT statement
2. Your Supabase database is set up with the current schema
3. You have access to the Supabase SQL Editor or psql

## Step-by-Step Instructions

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to **SQL Editor**

2. **Create the Staging Table and Functions**
   - Open `supabase/migrations/055_import_bookings_data.sql`
   - Copy everything from the beginning up to (but not including) the line that says `-- STEP 1: Copy the INSERT statement...`
   - Paste and run in SQL Editor

3. **Prepare the INSERT Statement**
   - Open `bookings_rows.sql` (the file with your old data)
   - Find the line that starts with: `INSERT INTO "public"."bookings" (`
   - Replace `INSERT INTO "public"."bookings"` with `INSERT INTO bookings_staging`
   - Copy the entire modified INSERT statement

4. **Insert Data into Staging Table**
   - In SQL Editor, paste the modified INSERT statement
   - Run it to load data into the staging table

5. **Transform and Import**
   - In SQL Editor, go back to `055_import_bookings_data.sql`
   - Copy the section starting from `-- TRANSFORM AND INSERT INTO BOOKINGS TABLE`
   - Paste and run in SQL Editor
   - This will transform the data and insert it into the `bookings` table

6. **Cleanup**
   - Copy and run the cleanup section (DROP FUNCTION statements) from the migration file

### Option 2: Using psql Command Line

1. **Prepare the SQL File**
   - Create a new file called `import_bookings_complete.sql`
   - Copy the entire `055_import_bookings_data.sql` content
   - Open `bookings_rows.sql` and modify the INSERT statement:
     - Replace `INSERT INTO "public"."bookings"` with `INSERT INTO bookings_staging`
   - Insert the modified INSERT statement into `import_bookings_complete.sql` right after the staging table creation

2. **Run the Migration**
   ```bash
   psql -h your-db-host -U postgres -d postgres -f import_bookings_complete.sql
   ```

## Data Transformations

The migration performs the following transformations:

- **Service Type**: Converts to lowercase (e.g., "Standard" → "standard")
- **Frequency**: 
  - `null` or empty → `"one-time"`
  - `"custom-weekly"` → `"weekly"`
  - Other values converted to lowercase
- **Customer Name**: Split into `contact_first_name` and `contact_last_name`
- **Phone Numbers**: Trimmed of leading/trailing spaces
- **Amounts**: Converted from cents (stored as strings) to rands (decimals)
  - Example: `"30600"` → `306.00`
- **Bedrooms/Bathrooms**: Extracted from `price_snapshot` JSON
- **Extras**: Extracted from `price_snapshot` JSON as JSONB array
- **Cleaner ID**: Maps UUID to `cleaner_id` TEXT by looking up in `cleaners` table
- **Booking Reference**: Uses `payment_reference` if available, otherwise uses `id`
- **Payment Status**: Set to `"completed"` if status is `"completed"`, otherwise `"pending"`

## Verification

After importing, verify the data:

```sql
-- Check total count
SELECT COUNT(*) FROM bookings;

-- Check a few sample records
SELECT 
  id,
  booking_reference,
  service_type,
  frequency,
  contact_first_name,
  contact_last_name,
  total_amount,
  status
FROM bookings
LIMIT 10;

-- Check for any NULL required fields
SELECT COUNT(*) 
FROM bookings 
WHERE contact_first_name IS NULL 
   OR contact_email IS NULL 
   OR street_address IS NULL;
```

## Troubleshooting

### Error: "violates foreign key constraint"
- The `cleaner_id` UUIDs in the old data might not match any cleaners in your database
- The migration will set `assigned_cleaner_id` to NULL if no match is found
- This is expected behavior for bookings without assigned cleaners

### Error: "duplicate key value violates unique constraint"
- Some booking IDs might already exist in the database
- The migration uses `ON CONFLICT` to update existing records
- If you want to skip existing records instead, modify the INSERT to use `ON CONFLICT DO NOTHING`

### Error: "invalid input syntax for type decimal"
- Some amount fields might have invalid values
- The migration handles this by checking if the value is numeric before converting
- Invalid values default to 0.00

## Notes

- The staging table is temporary and will be automatically dropped when the session ends
- All helper functions are cleaned up after the import
- The migration is idempotent - you can run it multiple times safely
- Existing bookings with the same `id` will be updated with the new data

