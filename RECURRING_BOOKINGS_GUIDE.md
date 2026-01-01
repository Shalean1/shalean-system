# Recurring Bookings System - Complete Guide

This guide explains the updated recurring bookings system that now creates bookings for only 1 month ahead, with automatic monthly generation.

## Overview

The system has been updated to:
1. Create bookings for only **1 month** ahead (instead of 3 months)
2. Automatically generate bookings monthly from recurring schedules
3. Sync existing recurring bookings into the `recurring_schedules` table
4. View recurring bookings grouped by series in the admin panel

## Key Changes

### 1. Frequency Logic (✅ Completed)
- **Before**: Created bookings for 3 months ahead
- **After**: Creates bookings for **1 month only**
- Location: `lib/utils/recurring-bookings.ts`
- The `calculateRecurringDates()` function now defaults to `months: 1`

### 2. Viewing Recurring Bookings (✅ Completed)
- **Admin → Bookings Page** now has:
  - Filter dropdown: "All Bookings" / "Recurring Only" / "One-Time Only"
  - When "Recurring Only" is selected, bookings are grouped by series
  - Each series can be expanded to see all bookings in that series
  - Shows paid/pending counts per series

### 3. Syncing Existing Bookings (✅ Completed)
- **Admin → Recurring Schedules** page has a "Sync from Bookings" button
- This creates `recurring_schedules` entries from existing recurring bookings
- Run this once to migrate your existing 20 bookings into the schedules table

### 4. Monthly Auto-Generation (✅ Completed)
- Created API endpoint: `/api/recurring/generate-monthly`
- Created admin button: "Generate Monthly" in Recurring Schedules page
- Automatically generates bookings for the next month from all active schedules

## How It Works

### When Customer Books Recurring Service

1. Customer selects weekly/bi-weekly/monthly frequency
2. System creates:
   - First booking (sequence 0) - **paid immediately**
   - 1 month of future bookings (sequences 1, 2, 3...) - **pending payment**
3. Example for weekly:
   - Sequence 0: Jan 1 (paid)
   - Sequence 1: Jan 8 (pending)
   - Sequence 2: Jan 15 (pending)
   - Sequence 3: Jan 22 (pending)
   - Sequence 4: Jan 29 (pending)
   - **Total: 1 month of bookings**

### Monthly Generation Process

At the start of each month (or manually via admin panel):

1. System checks all active `recurring_schedules`
2. For each schedule that hasn't been generated this month:
   - Calculates next month's booking dates based on frequency
   - Creates bookings for the entire month
   - Marks schedule as generated for current month
3. All new bookings are created as "pending" (not paid)

## Admin Features

### 1. View Recurring Bookings
**Path**: Admin → Bookings

- Select "Recurring Only" from the filter dropdown
- View all recurring booking series grouped together
- Expand each series to see individual bookings
- See payment status (paid/pending) for each booking

### 2. Sync Existing Bookings to Schedules
**Path**: Admin → Recurring Schedules

1. Click "Sync from Bookings" button
2. System will:
   - Find all recurring booking groups
   - Create customer records if needed
   - Create `recurring_schedules` entries
3. After sync, your schedules will appear in the recurring schedules list

### 3. Generate Monthly Bookings
**Path**: Admin → Recurring Schedules

1. Click "Generate Monthly" button
2. System will:
   - Check all active schedules
   - Generate bookings for next month
   - Create all pending bookings automatically

### 4. Manual Schedule Management
**Path**: Admin → Recurring Schedules

- Create new recurring schedules manually
- Edit existing schedules
- Assign cleaners to schedules
- Activate/deactivate schedules
- Set custom pricing per schedule

## Setting Up Monthly Auto-Generation (Cron Job)

To automatically generate bookings every month, set up a cron job or scheduled task:

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/recurring/generate-monthly",
    "schedule": "0 0 1 * *"
  }]
}
```

### Option 2: External Cron Service

Set up a cron job to call:
```
POST https://your-domain.com/api/recurring/generate-monthly
Authorization: Bearer YOUR_CRON_SECRET_TOKEN
```

Schedule: Run on the 1st of each month at midnight

### Option 3: Manual Execution

Use the "Generate Monthly" button in the admin panel.

## Environment Variables

Add to `.env.local` (optional, for API route protection):
```env
CRON_SECRET_TOKEN=your-secret-token-here
```

## Migration Steps

### For Existing Recurring Bookings

1. **Go to Admin → Recurring Schedules**
2. **Click "Sync from Bookings"**
   - This will create schedule entries from your existing 20 bookings
   - Creates customer records if needed
   - Links bookings to schedules

3. **Verify schedules appear**
   - You should see 2 schedules (one weekly, one bi-weekly)
   - Check that customer info is correct

4. **Test monthly generation**
   - Click "Generate Monthly" button
   - Should create bookings for next month
   - Check Admin → Bookings to verify new bookings were created

## Troubleshooting

### Recurring Schedules Page is Empty

**Solution**: Click "Sync from Bookings" to migrate existing bookings to schedules.

### New Bookings Not Generated

**Check**:
1. Are schedules marked as `is_active: true`?
2. Has `last_generated_month` been updated for current month?
3. Check server logs for errors

### Duplicate Bookings Created

**Solution**: The system tracks `last_generated_month` to prevent duplicates. If duplicates occur:
1. Check database for duplicate bookings
2. Manually update `last_generated_month` in `recurring_schedules` table
3. Delete duplicate bookings

## Database Tables

### `bookings` table
- Stores individual booking records
- `recurring_group_id`: Links bookings in same series
- `recurring_sequence`: Order within series (0 = first/paid)
- `is_recurring`: Boolean flag

### `recurring_schedules` table
- Stores schedule templates
- Used to generate bookings monthly
- `last_generated_month`: Tracks when bookings were last generated
- `is_active`: Controls if schedule should generate bookings

## API Endpoints

### POST `/api/recurring/generate-monthly`
Generates bookings for next month from all active schedules.

**Authentication**: Optional (set `CRON_SECRET_TOKEN` env var)

**Response**:
```json
{
  "success": true,
  "message": "Generated 24 bookings from 2 schedules.",
  "generated": 24
}
```

## Functions Reference

### `syncRecurringBookingsToSchedules()`
- Location: `app/actions/sync-recurring-schedules.ts`
- Purpose: Migrates existing bookings to schedules table
- Usage: Called from admin panel "Sync from Bookings" button

### `generateMonthlyBookingsFromSchedules()`
- Location: `app/actions/generate-monthly-bookings.ts`
- Purpose: Generates next month's bookings from schedules
- Usage: Called from admin panel or cron job

### `calculateRecurringDates()`
- Location: `lib/utils/recurring-bookings.ts`
- Changed: Now defaults to `months: 1` instead of `3`
- Purpose: Calculates booking dates for given frequency

## Summary

✅ Bookings now created for 1 month only  
✅ Monthly auto-generation system ready  
✅ Sync function to migrate existing bookings  
✅ Admin UI to view recurring bookings grouped by series  
✅ Manual generation button for testing  

All features are complete and ready to use!

