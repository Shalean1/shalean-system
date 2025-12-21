# Cleaner Accept/Decline Booking Feature

## Overview
This feature allows cleaners to accept or decline bookings assigned to them. When a cleaner accepts a booking, it automatically moves to "Upcoming" status.

## Implementation Details

### Database Changes
- **Migration**: `supabase/migrations/018_cleaner_accept_decline.sql`
- **New Column**: `cleaner_response` (TEXT)
  - Values: `'accepted'`, `'declined'`, or `NULL` (pending response)
  - Default: `NULL`
  - Indexed for performance

### Workflow

1. **Booking Assignment**
   - When a booking is created with a cleaner preference, `assigned_cleaner_id` is set
   - `cleaner_response` is automatically `NULL` (pending acceptance)
   - Status remains `'pending'`

2. **Cleaner Views Booking**
   - Bookings with `status = 'pending'` and `cleaner_response IS NULL` appear in "New" section
   - Cleaner sees Accept/Decline buttons

3. **Cleaner Accepts**
   - `cleaner_response` → `'accepted'`
   - `status` → `'confirmed'`
   - Booking appears in "Upcoming" section

4. **Cleaner Declines**
   - `cleaner_response` → `'declined'`
   - `assigned_cleaner_id` → `NULL` (unassigned)
   - `status` remains `'pending'` (for admin reassignment)

### Code Changes

#### Type Updates
- `lib/types/booking.ts`: Added `cleanerResponse?: "accepted" | "declined" | null` to Booking interface

#### Server Actions
- `app/actions/cleaner-bookings.ts`: 
  - Added `acceptBookingAction()` - Accepts booking and sets status to confirmed
  - Added `declineBookingAction()` - Declines booking and unassigns cleaner

#### Storage Functions
- `lib/storage/cleaner-bookings-supabase.ts`:
  - Added `acceptBooking()` - Sets cleaner_response to 'accepted' and status to 'confirmed'
  - Added `declineBooking()` - Sets cleaner_response to 'declined' and unassigns cleaner
  - Updated `getCleanerUpcomingBookings()` - Only shows confirmed (accepted) bookings
  - Updated `getCleanerBookingStats()` - "New" counts pending bookings with no response
  - Updated `mapDatabaseToBooking()` - Includes cleanerResponse field

#### Components
- `components/cleaner/BookingStatusActions.tsx`:
  - Shows Accept/Decline buttons for pending bookings with no response
  - Accept button: Green, sets booking to confirmed
  - Decline button: Red, with confirmation dialog

### Query Logic

#### "New" Bookings
- Status: `'pending'`
- Cleaner Response: `NULL` (not yet responded)
- Scheduled Date: Within next 7 days

#### "Upcoming" Bookings
- Status: `'confirmed'` (accepted by cleaner)
- Scheduled Date: Today or future

### Usage

1. **Run Migration**
   ```sql
   -- Apply migration 018_cleaner_accept_decline.sql
   ```

2. **Cleaner Flow**
   - Cleaner logs in and sees "New" bookings
   - Clicks on a booking to view details
   - Sees Accept/Decline buttons
   - Accepts → Booking moves to "Upcoming"
   - Declines → Booking is unassigned (admin can reassign)

### Benefits

1. **Clear Workflow**: Cleaners explicitly accept bookings before they appear in Upcoming
2. **Flexibility**: Cleaners can decline bookings they cannot complete
3. **Transparency**: System tracks cleaner responses for accountability
4. **Reassignment**: Declined bookings can be easily reassigned by admin

### Future Enhancements

- Email notifications when cleaner accepts/declines
- Admin dashboard to see declined bookings
- Automatic reassignment logic for declined bookings
- Time limit for cleaner response (e.g., 24 hours)
