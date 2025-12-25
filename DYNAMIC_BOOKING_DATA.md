# Dynamic Booking Data System

This document explains the dynamic booking data system that allows you to manage booking form options (locations, extras, time slots, cleaners, frequencies) through the Supabase database instead of hardcoding them in the application.

## Overview

All booking form data is now stored in Supabase and can be managed dynamically:

- **Service Locations**: Cape Town areas where services are available
- **Additional Services/Extras**: Add-on services like "Inside Fridge", "Inside Oven", etc.
- **Time Slots**: Available booking time slots
- **Cleaners/Staff**: Team members with ratings and profiles
- **Frequency Options**: Booking frequencies with discount percentages
- **System Settings**: Global configuration options

## Database Tables

### 1. `service_locations`
Manages service areas and locations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Location name (e.g., "Sea Point") |
| `slug` | TEXT | URL-friendly slug |
| `city` | TEXT | City name (default: "Cape Town") |
| `display_order` | INTEGER | Sort order |
| `is_active` | BOOLEAN | Active status |

**Usage**: Displayed in the quote form location dropdown.

### 2. `additional_services`
Manages extra services that can be added to bookings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `service_id` | TEXT | Unique identifier (e.g., "inside-fridge") |
| `name` | TEXT | Display name |
| `description` | TEXT | Service description |
| `icon_name` | TEXT | Lucide icon name (e.g., "Refrigerator") |
| `price_modifier` | DECIMAL | Additional price for this service |
| `display_order` | INTEGER | Sort order |
| `is_active` | BOOLEAN | Active status |

**Available Icons**: `Refrigerator`, `ChefHat`, `Boxes`, `Grid`, `Paintbrush`, `Shirt`

### 3. `time_slots`
Manages available booking time slots.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `time_value` | TEXT | Time in 24h format (e.g., "08:00") |
| `display_label` | TEXT | Display label (e.g., "08:00 AM") |
| `display_order` | INTEGER | Sort order |
| `is_active` | BOOLEAN | Active status |

### 4. `cleaners`
Manages team members/cleaners.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `cleaner_id` | TEXT | Unique identifier (e.g., "natasha-m") |
| `name` | TEXT | Display name |
| `bio` | TEXT | Biography/description |
| `rating` | DECIMAL | Rating (0-5 scale) |
| `total_jobs` | INTEGER | Number of completed jobs |
| `avatar_url` | TEXT | Profile picture URL |
| `display_order` | INTEGER | Sort order |
| `is_active` | BOOLEAN | Active status |
| `is_available` | BOOLEAN | Currently available for bookings |

### 5. `frequency_options`
Manages booking frequency options and discounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `frequency_id` | TEXT | Unique identifier (e.g., "weekly") |
| `name` | TEXT | Display name |
| `description` | TEXT | Description |
| `discount_percentage` | DECIMAL | Discount percentage (e.g., 15.00 for 15%) |
| `display_label` | TEXT | Label shown to users (e.g., "Save 15%") |
| `display_order` | INTEGER | Sort order |
| `is_active` | BOOLEAN | Active status |

### 6. `system_settings`
Global system configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `setting_key` | TEXT | Setting key (unique) |
| `setting_value` | TEXT | Setting value |
| `setting_type` | TEXT | Type: string, number, boolean, json |
| `description` | TEXT | Setting description |
| `is_public` | BOOLEAN | Accessible by non-authenticated users |

**Default Settings**:
- `default_city`: "Cape Town"
- `enable_location_other_option`: "true"
- `min_booking_hours_notice`: "24"
- `max_bedrooms`: "11"
- `max_bathrooms`: "11"
- `service_fee_percentage`: "10"

## How to Use

### Running the Migration

1. Make sure your Supabase project is set up
2. Run the migration:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually apply the migration file
   # supabase/migrations/002_booking_dynamic_data.sql
   ```

### Managing Data

#### Via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Select the table you want to edit
4. Add, edit, or remove rows

#### Via SQL

```sql
-- Add a new location
INSERT INTO service_locations (name, slug, city, display_order)
VALUES ('Atlantic Seaboard', 'atlantic-seaboard', 'Cape Town', 35);

-- Add a new extra service
INSERT INTO additional_services (service_id, name, icon_name, price_modifier, display_order)
VALUES ('carpet-cleaning', 'Carpet Cleaning', 'Grid', 200.00, 8);

-- Add a new cleaner
INSERT INTO cleaners (cleaner_id, name, bio, rating, display_order)
VALUES ('john-d', 'John D.', 'Experienced cleaner', 4.8, 4);

-- Update frequency discount
UPDATE frequency_options 
SET discount_percentage = 20.00, display_label = 'Save 20%'
WHERE frequency_id = 'weekly';

-- Deactivate a time slot
UPDATE time_slots SET is_active = false WHERE time_value = '16:30';

-- Update a system setting
UPDATE system_settings 
SET setting_value = 'Johannesburg'
WHERE setting_key = 'default_city';
```

### Application Integration

The booking forms automatically fetch data from these tables:

**Quote Page** (`app/booking/quote/page.tsx`):
- Fetches `service_locations` for location dropdown
- Fetches `additional_services` for extras selection

**Service Details Page** (`app/booking/service/[type]/details/page.tsx`):
- Fetches `additional_services` for extras
- Fetches `time_slots` for time selection

**Schedule Page** (`app/booking/service/[type]/schedule/page.tsx`):
- Fetches `cleaners` for cleaner selection
- Fetches `frequency_options` for frequency selection
- Fetches `default_city` from system settings

### Fallback Data

The system includes fallback data that is used if:
- Supabase connection fails
- No data is available in the database
- User is offline

Fallback constants are defined in:
```
lib/supabase/booking-data.ts
```

## API Functions

Import from `@/lib/supabase/booking-data`:

```typescript
import {
  getServiceLocations,
  getAdditionalServices,
  getTimeSlots,
  getCleaners,
  getFrequencyOptions,
  getSystemSetting,
  getSystemSettings,
  getAllSystemSettings,
} from '@/lib/supabase/booking-data';

// Usage examples
const locations = await getServiceLocations();
const extras = await getAdditionalServices();
const timeSlots = await getTimeSlots();
const cleaners = await getCleaners();
const frequencies = await getFrequencyOptions();
const defaultCity = await getSystemSetting('default_city');
```

## Security

All tables use Row Level Security (RLS):

- **Public Read Access**: Anyone can view active records
- **Admin Management**: Only authenticated users can create/update/delete records

To manage data, you need to:
1. Sign in to your Supabase dashboard
2. Or authenticate via the application with proper permissions

## Performance

- Data is fetched on component mount
- Uses React hooks for state management
- Includes loading states
- Graceful fallback to hardcoded data on error
- Can be cached or optimized with SWR/React Query if needed

## Adding New Features

### Adding a New Icon

1. Import the icon in the page component:
   ```typescript
   import { NewIcon } from "lucide-react";
   ```

2. Add it to the `iconMap`:
   ```typescript
   const iconMap = {
     ...existing,
     NewIcon,
   };
   ```

3. Use the icon name in the database:
   ```sql
   INSERT INTO additional_services (service_id, name, icon_name, ...)
   VALUES ('new-service', 'New Service', 'NewIcon', ...);
   ```

### Adding a New Setting

```sql
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES ('new_setting', 'value', 'string', 'Description', true);
```

Then fetch it in your component:
```typescript
const newSetting = await getSystemSetting('new_setting');
```

## Troubleshooting

### Data Not Loading

1. **Check Supabase Connection**: Verify your `.env.local` has correct Supabase credentials
2. **Check RLS Policies**: Ensure Row Level Security policies allow public read access
3. **Check Browser Console**: Look for error messages
4. **Verify Migration**: Ensure migration ran successfully

### Fallback Data Being Used

If you see the original hardcoded data:
1. Check if the tables have data: `SELECT * FROM service_locations;`
2. Verify data is marked as active: `is_active = true`
3. Check for JavaScript errors in console

### Adding Data Not Working

1. Ensure you're authenticated in Supabase
2. Check RLS policies allow your user to insert/update
3. Verify unique constraints (name, slug, service_id) aren't violated

## Migration History

- **001_popular_services.sql**: Popular services table
- **002_booking_dynamic_data.sql**: All booking dynamic data tables (this feature)

## Next Steps

Consider implementing:
- Admin panel to manage this data through the UI
- Caching layer (SWR or React Query) for better performance
- Real-time updates using Supabase subscriptions
- Localization support for multi-language
- Audit logging for data changes






















