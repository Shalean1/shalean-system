# Bookings Import Issues and Solution

## Why Bookings Aren't Importing

There are several issues preventing bookings from being imported from the old app:

### 1. **Status Value Mismatch** ❌
- **Problem**: Old data has `'accepted'` status, but the new schema only allows: `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`
- **Impact**: Any booking with `'accepted'` status will fail to insert
- **Solution**: The new transformation script maps `'accepted'` → `'confirmed'`

### 2. **Foreign Key Constraint** ⚠️
- **Problem**: `assigned_cleaner_id` references `cleaners(cleaner_id)`. If a cleaner UUID from the old app doesn't exist in the new `cleaners` table, the insert fails
- **Impact**: Bookings with non-existent cleaner IDs will fail
- **Solution**: The transformation function returns `NULL` if cleaner is not found (which is allowed)

### 3. **NOT NULL Constraints** ⚠️
- **Problem**: Several required fields might be NULL or empty in the old data:
  - `booking_reference` (UNIQUE NOT NULL)
  - `service_type` (NOT NULL)
  - `frequency` (NOT NULL)
  - `scheduled_date` (NOT NULL)
  - `scheduled_time` (NOT NULL)
  - `street_address` (NOT NULL)
  - `suburb` (NOT NULL)
  - `city` (NOT NULL)
  - `contact_first_name` (NOT NULL)
  - `contact_last_name` (NOT NULL)
  - `contact_email` (NOT NULL)
  - `contact_phone` (NOT NULL)
  - `total_amount` (NOT NULL)
- **Impact**: Any booking with NULL/empty values in these fields will fail
- **Solution**: The new transformation script provides defaults for all required fields

### 4. **Service Type Case Sensitivity** ⚠️
- **Problem**: Old data has `'Standard'` (capitalized), but schema requires lowercase `'standard'`
- **Impact**: Case mismatches would fail the CHECK constraint
- **Solution**: The `normalize_service_type()` function converts to lowercase

### 5. **UNIQUE Constraint on booking_reference** ⚠️
- **Problem**: If there are duplicate `booking_reference` values, inserts will fail
- **Impact**: Duplicate references cause constraint violations
- **Solution**: The transformation uses `COALESCE` to ensure uniqueness, falling back to `id` or generating a UUID

## Solution: Improved Import Process

### Migration Files (Run in Order):

1. **`055_00_create_bookings_staging.sql`**
   - Creates the `bookings_staging` table
   - Must run first

2. **`055_bookings_data_insert.sql`**
   - Inserts raw data into `bookings_staging`
   - Run after step 1

3. **`055_01_transform_and_import.sql`** ⭐ NEW
   - Transforms and validates all data
   - Handles all constraint issues
   - Inserts into the main `bookings` table
   - Run after step 2

### Key Improvements in `055_01_transform_and_import.sql`:

✅ **Status Normalization**: Maps `'accepted'` → `'confirmed'`  
✅ **NULL Handling**: Provides defaults for all NOT NULL fields  
✅ **Empty String Handling**: Converts empty strings to defaults  
✅ **Service Type Normalization**: Converts to lowercase  
✅ **Frequency Normalization**: Maps `'custom-weekly'` → `'weekly'`  
✅ **Price Conversion**: Handles both cents and rands formats  
✅ **Cleaner Mapping**: Returns NULL if cleaner not found (safe)  
✅ **Name Splitting**: Handles NULL/empty names gracefully  
✅ **Unique Reference**: Ensures `booking_reference` is always unique  

## How to Run the Import

### Step 1: Create Staging Table
```sql
-- Run: 055_00_create_bookings_staging.sql
```

### Step 2: Insert Raw Data
```sql
-- Run: 055_bookings_data_insert.sql
```

### Step 3: Transform and Import
```sql
-- Run: 055_01_transform_and_import.sql
```

### Step 4: Verify
```sql
-- Run: 056_verify_bookings_import.sql
```

## Troubleshooting

If imports still fail, check:

1. **Check constraint violations**:
```sql
SELECT 
  bs.id,
  bs.service_type,
  bs.status,
  bs.frequency
FROM bookings_staging bs
WHERE 
  lower(trim(bs.service_type)) NOT IN ('standard', 'deep', 'move-in-out', 'airbnb', 'carpet-cleaning', 'office', 'holiday')
  OR lower(trim(bs.status)) NOT IN ('pending', 'confirmed', 'completed', 'cancelled')
  OR lower(trim(bs.frequency)) NOT IN ('one-time', 'weekly', 'bi-weekly', 'monthly');
```

2. **Check for NULL required fields**:
```sql
SELECT 
  id,
  CASE WHEN customer_name IS NULL OR trim(customer_name) = '' THEN 'MISSING NAME' END as name_issue,
  CASE WHEN customer_email IS NULL OR trim(customer_email) = '' THEN 'MISSING EMAIL' END as email_issue,
  CASE WHEN address_line1 IS NULL OR trim(address_line1) = '' THEN 'MISSING ADDRESS' END as address_issue
FROM bookings_staging
WHERE 
  customer_name IS NULL OR trim(customer_name) = ''
  OR customer_email IS NULL OR trim(customer_email) = ''
  OR address_line1 IS NULL OR trim(address_line1) = '';
```

3. **Check cleaner mappings**:
```sql
SELECT DISTINCT bs.cleaner_id
FROM bookings_staging bs
WHERE bs.cleaner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM cleaners c 
    WHERE c.id::TEXT = trim(bs.cleaner_id) OR c.id = bs.cleaner_id::UUID
  );
```

## Expected Results

After running all migrations, you should see:
- All bookings from staging imported into `bookings` table
- Status values normalized (no 'accepted', only 'confirmed')
- All required fields populated with defaults if missing
- Cleaner assignments preserved where cleaners exist
- No constraint violations

