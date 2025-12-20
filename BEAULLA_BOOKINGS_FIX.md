# Fix: Beaulla Chemugarira Cleaner Dashboard Not Showing Bookings

## Problem
Beaulla Chemugarira's cleaner dashboard is not displaying any bookings (past, upcoming, new, or today), even though bookings are assigned to her.

## Root Cause
The issue is likely that Beaulla's profile in the `profiles` table doesn't have the `cleaner_id` field set to `'beaul'`, or it's set with a different case (e.g., `'Beaul'` instead of `'beaul'`).

The cleaner dashboard queries bookings using:
```sql
WHERE assigned_cleaner_id = cleaner.cleanerId
```

If the profile's `cleaner_id` doesn't match the bookings' `assigned_cleaner_id`, no bookings will be returned.

## Solution

### Step 1: Run Diagnostic SQL
Run `fix_beaulla_bookings_display.sql` to:
1. Verify the 'beaul' cleaner exists in the `cleaners` table
2. Find Beaulla's profile and check its `cleaner_id` value
3. Count how many bookings are assigned to 'beaul'
4. Show sample bookings

### Step 2: Fix the Profile
Based on the diagnostic results, update Beaulla's profile:

**Option A: If you know the user ID**
```sql
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE id = 'USER_ID_HERE'::uuid;
```

**Option B: Fix case mismatches automatically**
```sql
UPDATE profiles
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE LOWER(cleaner_id) = 'beaul'
  AND cleaner_id != 'beaul';
```

**Option C: Find and fix by phone/email pattern**
```sql
UPDATE profiles p
SET cleaner_id = 'beaul',
    updated_at = NOW()
WHERE (p.phone LIKE '%27825%' OR EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.phone LIKE '%27825%'
))
AND (p.cleaner_id IS NULL OR LOWER(p.cleaner_id) != 'beaul');
```

### Step 3: Verify the Fix
After updating the profile, verify with:
```sql
SELECT 
  p.id,
  p.cleaner_id,
  p.phone,
  p.email,
  COUNT(b.booking_reference) as booking_count
FROM profiles p
LEFT JOIN bookings b ON b.assigned_cleaner_id = p.cleaner_id
WHERE p.cleaner_id = 'beaul'
GROUP BY p.id, p.cleaner_id, p.phone, p.email;
```

## Code Improvements Made
1. **Case-insensitive matching**: The code now normalizes cleaner IDs to lowercase and handles case mismatches
2. **Better diagnostics**: Added detailed logging to help identify issues
3. **Fallback search**: If exact match fails, tries case-insensitive client-side filtering

## Files Modified
- `lib/storage/cleaner-bookings-supabase.ts` - Enhanced `getCleanerBookings()` and `getCleanerBookingStats()` with case-insensitive matching and better diagnostics

## Files Created
- `fix_beaulla_bookings_display.sql` - Comprehensive diagnostic and fix script
- `fix_beaulla_cleaner_profile.sql` - Detailed profile verification script
- `BEAULLA_BOOKINGS_FIX.md` - This documentation

## Testing
After fixing the profile:
1. Log in as Beaulla Chemugarira
2. Navigate to the cleaner dashboard (`/cleaner`)
3. Verify bookings appear in:
   - Dashboard stats (upcoming, today, new, past)
   - Bookings page (`/cleaner/bookings`)

## Prevention
To prevent this issue in the future:
1. Ensure cleaner profiles are created with the correct `cleaner_id` when setting up cleaner accounts
2. Use the same case consistently (lowercase) for all cleaner IDs
3. Run periodic checks to ensure profiles have matching `cleaner_id` values
