# Quick Start: Dynamic Booking Data

This guide will help you set up and test the new dynamic booking data system.

## Prerequisites

- Supabase project set up
- Supabase CLI installed (optional, for local development)
- Environment variables configured (`.env.local`)

## Step 1: Apply the Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the content from:
   ```
   supabase/migrations/002_booking_dynamic_data.sql
   ```
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI

```bash
# Push all pending migrations
supabase db push

# Or link and push if not already linked
supabase link --project-ref your-project-ref
supabase db push
```

## Step 2: Verify the Migration

Check that all tables were created successfully:

```sql
-- Run this in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'service_locations',
  'additional_services',
  'time_slots',
  'cleaners',
  'frequency_options',
  'system_settings'
);
```

You should see all 6 tables listed.

## Step 3: Verify Default Data

Check that default data was inserted:

```sql
-- Check locations (should have 34 Cape Town areas)
SELECT COUNT(*) as location_count FROM service_locations;

-- Check additional services (should have 7 services)
SELECT COUNT(*) as service_count FROM additional_services;

-- Check time slots (should have 18 slots)
SELECT COUNT(*) as slot_count FROM time_slots;

-- Check cleaners (should have 4 cleaners)
SELECT COUNT(*) as cleaner_count FROM cleaners;

-- Check frequencies (should have 4 options)
SELECT COUNT(*) as frequency_count FROM frequency_options;

-- Check system settings (should have 6 settings)
SELECT COUNT(*) as setting_count FROM system_settings;
```

## Step 4: Test the Application

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the Quote Form**:
   - Go to `/booking/quote`
   - Verify that the location dropdown shows all Cape Town areas
   - Verify that additional services show with icons

3. **Test the Full Booking Flow**:
   - Go to `/booking/service/standard/details`
   - Verify extras show correctly
   - Verify time slots are available
   - Continue to schedule page
   - Verify cleaners are displayed
   - Verify frequency options show with discounts

4. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any error messages
   - Verify data is being fetched successfully

## Step 5: Customize Your Data

### Add a New Location

```sql
INSERT INTO service_locations (name, slug, city, display_order)
VALUES ('Stellenbosch', 'stellenbosch', 'Cape Town', 35);
```

### Add a New Extra Service

```sql
INSERT INTO additional_services (
  service_id, 
  name, 
  description, 
  icon_name, 
  price_modifier, 
  display_order
)
VALUES (
  'window-washing',
  'Window Washing',
  'Professional window washing service',
  'Grid',
  150.00,
  8
);
```

### Add a New Cleaner

```sql
INSERT INTO cleaners (
  cleaner_id,
  name,
  bio,
  rating,
  total_jobs,
  display_order
)
VALUES (
  'sarah-k',
  'Sarah K.',
  'Specialized in eco-friendly cleaning',
  4.9,
  312,
  4
);
```

### Update Frequency Discount

```sql
UPDATE frequency_options 
SET discount_percentage = 20.00, display_label = 'Save 20%'
WHERE frequency_id = 'weekly';
```

### Update System Settings

```sql
-- Change default city
UPDATE system_settings 
SET setting_value = 'Johannesburg'
WHERE setting_key = 'default_city';

-- Update service fee
UPDATE system_settings 
SET setting_value = '15'
WHERE setting_key = 'service_fee_percentage';
```

## Troubleshooting

### Issue: Data not showing in forms

**Solution**:
1. Check browser console for errors
2. Verify Supabase environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Verify tables have `is_active = true` for records
4. Check RLS policies allow public read access

### Issue: "Failed to fetch" errors

**Solution**:
1. Check internet connection
2. Verify Supabase project is not paused
3. Check Supabase status page
4. The app will use fallback data automatically

### Issue: Changes not reflecting immediately

**Solution**:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Data is fetched on component mount, so navigate away and back

## Testing Checklist

- [ ] Migration applied successfully
- [ ] All 6 tables created
- [ ] Default data inserted
- [ ] Quote form loads locations from database
- [ ] Quote form loads additional services from database
- [ ] Service details page loads extras from database
- [ ] Service details page loads time slots from database
- [ ] Schedule page loads cleaners from database
- [ ] Schedule page loads frequencies from database
- [ ] Fallback data works when Supabase is unreachable
- [ ] Custom data can be added via SQL
- [ ] Changes reflect in the application

## Next Steps

1. **Set up Admin Panel**: Consider building an admin interface to manage this data
2. **Add Caching**: Implement SWR or React Query for better performance
3. **Enable Real-time**: Use Supabase subscriptions for live updates
4. **Add Validation**: Implement server-side validation for data integrity
5. **Monitor Usage**: Track which services and locations are most popular

## Support

For detailed documentation, see:
- `DYNAMIC_BOOKING_DATA.md` - Complete system documentation
- `SUPABASE_QUICK_START.md` - Supabase setup guide

## Common SQL Queries

```sql
-- View all active locations
SELECT name, city, display_order 
FROM service_locations 
WHERE is_active = true 
ORDER BY display_order;

-- View all extras with prices
SELECT name, price_modifier, icon_name 
FROM additional_services 
WHERE is_active = true 
ORDER BY display_order;

-- View cleaners with ratings
SELECT name, rating, total_jobs 
FROM cleaners 
WHERE is_active = true 
ORDER BY rating DESC;

-- View frequency options with discounts
SELECT name, discount_percentage, display_label 
FROM frequency_options 
WHERE is_active = true 
ORDER BY display_order;

-- View all system settings
SELECT setting_key, setting_value, description 
FROM system_settings 
WHERE is_public = true;

-- Deactivate a location without deleting
UPDATE service_locations 
SET is_active = false 
WHERE slug = 'some-location';

-- Reactivate a location
UPDATE service_locations 
SET is_active = true 
WHERE slug = 'some-location';
```

That's it! Your booking forms now use dynamic data from Supabase. 🎉

















