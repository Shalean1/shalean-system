# Pricing Database Migration - Summary

## Overview
All booking prices are now stored in and fetched dynamically from the Supabase database instead of being hardcoded in the application code.

## What Was Changed

### 1. Database Schema Updates (`supabase/migrations/002_booking_dynamic_data.sql`)

#### New Table: `service_type_pricing`
Stores base prices for each service type:
- **Columns:**
  - `service_type` (TEXT): e.g., "standard", "deep", "move-in-out"
  - `service_name` (TEXT): Human-readable name
  - `base_price` (DECIMAL): Base price in ZAR
  - `description` (TEXT): Service description
  - `display_order` (INTEGER): Sort order
  - `is_active` (BOOLEAN): Active status

**Default Data:**
- Standard Cleaning: R250.00
- Deep Cleaning: R400.00
- Move In/Out: R500.00
- Airbnb Cleaning: R350.00
- Office Cleaning: R300.00
- Holiday Cleaning: R450.00

#### Updated Table: `system_settings`
Added new pricing settings:
- `price_per_bedroom`: R30
- `price_per_bathroom`: R40

#### Existing Tables (Already Had Pricing):
- ✅ `additional_services.price_modifier`: Extra services pricing
- ✅ `frequency_options.discount_percentage`: Frequency discounts
- ✅ `system_settings.service_fee_percentage`: Service fee (10%)

### 2. Backend Updates

#### `lib/supabase/booking-data.ts`
- **New Interface:** `ServiceTypePricing`
- **New Functions:**
  - `getServiceTypePricing()`: Fetch all service type pricing
  - `getServiceTypePricingByType(serviceType)`: Fetch specific service pricing
- **New Fallbacks:**
  - `FALLBACK_SERVICE_PRICING`
  - `FALLBACK_ROOM_PRICING`

#### `lib/pricing.ts`
- **New Interface:** `PricingConfig` - Contains all pricing configuration
- **New Function:** `fetchPricingConfig()` - Fetches all pricing from database
- **Updated Function:** `calculatePrice()` - Now accepts optional `PricingConfig` parameter
  - If config is provided, uses database prices
  - If not provided, uses fallback hardcoded prices (backward compatible)

### 3. Frontend Updates

All booking pages now fetch and use dynamic pricing:

#### Client Components (fetch pricing once on mount):
- ✅ `app/booking/service/[type]/details/page.tsx`
- ✅ `app/booking/service/[type]/schedule/page.tsx`
- ✅ `app/booking/service/[type]/review/page.tsx`
- ✅ `app/booking/service/[type]/confirmation/page.tsx`

#### Server Actions (fetch pricing on each call):
- ✅ `app/actions/payment.ts`
- ✅ `app/actions/submit-booking.ts`

### 4. Component Updates

#### `components/booking/PriceSummary.tsx`
- No changes needed - receives calculated prices as props
- Continues to work seamlessly

## How It Works

### Pricing Flow

1. **Database Storage:**
   ```
   service_type_pricing → Base prices (R250, R400, etc.)
   system_settings → Per room prices (R30/bed, R40/bath)
   additional_services → Extra services (R50-R150)
   frequency_options → Discounts (5%-15%)
   ```

2. **Data Fetching:**
   ```typescript
   const pricingConfig = await fetchPricingConfig();
   // Returns: {
   //   basePrices: { standard: 250, deep: 400, ... },
   //   pricePerBedroom: 30,
   //   pricePerBathroom: 40,
   //   extrasPricing: { "inside-fridge": 50, ... },
   //   serviceFeePercentage: 0.1,
   //   frequencyDiscounts: { weekly: 0.15, ... }
   // }
   ```

3. **Price Calculation:**
   ```typescript
   const priceBreakdown = calculatePrice(formData, pricingConfig);
   ```

## Benefits

### ✅ Dynamic Pricing
- Change prices from database without code deployment
- Easy A/B testing of different price points
- Seasonal pricing adjustments

### ✅ Centralized Management
- All prices in one place (database)
- Admin panel can be built to manage prices
- Audit trail of price changes

### ✅ Backward Compatible
- Fallback pricing if database is unavailable
- Existing code continues to work
- Graceful degradation

### ✅ Performance
- Client components: Fetch once on page load
- Server actions: Fresh pricing on each request
- Minimal database queries (parallel fetching)

## How to Update Prices

### Option 1: Database Client (Supabase Dashboard)
```sql
-- Update service base price
UPDATE service_type_pricing 
SET base_price = 280.00 
WHERE service_type = 'standard';

-- Update room pricing
UPDATE system_settings 
SET setting_value = '35' 
WHERE setting_key = 'price_per_bedroom';

-- Update extra service price
UPDATE additional_services 
SET price_modifier = 60.00 
WHERE service_id = 'inside-fridge';

-- Update frequency discount
UPDATE frequency_options 
SET discount_percentage = 20.00 
WHERE frequency_id = 'weekly';
```

### Option 2: Admin Panel (Future)
Build an admin interface that uses the existing Supabase functions to manage pricing.

## Testing Checklist

- [ ] Run migration: `npx supabase db push`
- [ ] Verify new table exists: Check `service_type_pricing`
- [ ] Test booking flow: Create a test booking
- [ ] Verify prices are fetched: Check console logs
- [ ] Test price changes: Update a price in database
- [ ] Verify updated prices: Create another booking
- [ ] Test fallback: Temporarily break DB connection
- [ ] Verify emails show correct prices

## Migration Command

```bash
# Push migration to Supabase
npx supabase db push

# Or if using Supabase CLI directly
supabase db push
```

## Rollback Plan

If issues arise, the system will automatically use fallback hardcoded prices. The old hardcoded values are preserved in `FALLBACK_PRICING_CONFIG` in `lib/pricing.ts`.

To completely rollback:
1. Revert changes to `calculatePrice()` to always use hardcoded values
2. Remove the optional `config` parameter
3. Remove calls to `fetchPricingConfig()`

## Future Enhancements

1. **Admin Dashboard:** Build UI to manage all pricing
2. **Price History:** Track price changes over time
3. **Regional Pricing:** Different prices per location
4. **Dynamic Discounts:** Time-based or demand-based pricing
5. **Promotional Pricing:** Temporary discounts and coupons
6. **Currency Support:** Multi-currency pricing (USD, EUR, etc.)

## Support

If you encounter any issues:
1. Check database connection
2. Verify migration was applied successfully
3. Check browser console for errors
4. Verify RLS policies are correctly set
5. Ensure fallback prices are being used if DB is unavailable

---

**Status:** ✅ Complete and Ready for Testing
**Date:** December 13, 2025
**Migration File:** `002_booking_dynamic_data.sql`
