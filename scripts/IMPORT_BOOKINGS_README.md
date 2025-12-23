# Import Bookings Data

This guide explains how to import the bookings data from the old schema format to the new schema.

## Overview

The bookings SQL file uses an old schema format that needs to be transformed to match the current database schema. The main differences are:

### Old Schema → New Schema Mapping

| Old Schema | New Schema | Notes |
|------------|------------|-------|
| `cleaner_id` (UUID) | `assigned_cleaner_id` (TEXT) | Need to lookup cleaner_id from cleaners table |
| `booking_date` | `scheduled_date` | Same data, different name |
| `booking_time` | `scheduled_time` | Same data, different name |
| `customer_name` | `contact_first_name`, `contact_last_name` | Split name |
| `address_line1` | `street_address` | Same data, different name |
| `address_suburb` | `suburb` | Same data, different name |
| `address_city` | `city` | Same data, different name |
| `service_type` | `service_type` | Convert to lowercase (Standard → standard, Deep → deep, Airbnb → airbnb) |
| `frequency` | `frequency` | Map null → 'one-time', custom-weekly → 'weekly' |
| `price_snapshot` (JSONB) | `bedrooms`, `bathrooms`, `extras` | Extract from JSON |
| `total_amount` (cents) | `total_amount` (rands) | Divide by 100 |
| `tip_amount` (cents) | `tip_amount` (rands) | Divide by 100 |
| `cleaner_earnings` (cents) | `cleaner_earnings` (rands) | Divide by 100 |
| `status` | `status`, `payment_status` | Map status to both fields |

## Method 1: Using Python Script (Recommended)

1. Make sure you have Python 3 installed
2. Run the transformation script:

```bash
python scripts/import_bookings.py "C:\Users\27825\Downloads\bookings_rows.sql" supabase/migrations/055_import_bookings_data_transformed.sql
```

3. Review the generated SQL file
4. Run the migration:

```bash
# Using Supabase CLI
supabase db reset
# Or apply the migration directly
psql -h your-db-host -U postgres -d your-db-name -f supabase/migrations/055_import_bookings_data_transformed.sql
```

## Method 2: Direct SQL Import (Advanced)

If you prefer to import directly, you can:

1. Create a temporary table with the old schema
2. Load the data into the temporary table
3. Transform and insert into the bookings table

See `supabase/migrations/055_import_bookings_data.sql` for the transformation logic.

## Method 3: Manual Transformation

For smaller datasets, you can manually edit the SQL file to match the new schema format.

## Important Notes

- The `cleaner_id` UUID needs to be mapped to `cleaner_id` TEXT by looking up the cleaners table
- Amounts are stored in cents in the old schema but in rands in the new schema (divide by 100)
- The `price_snapshot` JSONB contains `bedrooms`, `bathrooms`, and `extras` that need to be extracted
- Customer names need to be split into first and last name
- Service types need to be normalized to lowercase
- Frequency values need to be normalized (null → 'one-time', custom-weekly → 'weekly')

## Verification

After importing, verify the data:

```sql
SELECT COUNT(*) FROM bookings;
SELECT service_type, COUNT(*) FROM bookings GROUP BY service_type;
SELECT frequency, COUNT(*) FROM bookings GROUP BY frequency;
```

