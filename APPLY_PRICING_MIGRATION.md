# Quick Start: Apply Pricing Migration

## Step 1: Apply the Migration

Run the migration to create the new pricing tables:

```bash
npx supabase db push
```

Or if using Supabase CLI:

```bash
supabase db push
```

## Step 2: Verify Database Changes

Check that the following was created:

### New Table
- ✅ `service_type_pricing` (with 6 service types)

### New Settings
- ✅ `price_per_bedroom` = 30
- ✅ `price_per_bathroom` = 40

### Sample Query to Verify
```sql
-- Check service type pricing
SELECT * FROM service_type_pricing ORDER BY display_order;

-- Check room pricing settings
SELECT * FROM system_settings 
WHERE setting_key IN ('price_per_bedroom', 'price_per_bathroom', 'service_fee_percentage');

-- Check additional services
SELECT service_id, name, price_modifier FROM additional_services ORDER BY display_order;

-- Check frequency discounts
SELECT frequency_id, name, discount_percentage FROM frequency_options ORDER BY display_order;
```

## Step 3: Test the Application

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Create a test booking:**
   - Go to the booking page
   - Select a service (e.g., Standard Cleaning)
   - Add bedrooms and bathrooms
   - Add extras
   - Proceed through the booking flow

3. **Verify prices are loaded from database:**
   - Check browser console for any errors
   - Prices should match database values
   - Try changing service type and verify prices update

## Step 4: Test Dynamic Price Changes

1. **Update a price in the database:**
   ```sql
   UPDATE service_type_pricing 
   SET base_price = 300.00 
   WHERE service_type = 'standard';
   ```

2. **Refresh the booking page**

3. **Verify the new price is reflected**

## Expected Behavior

### ✅ Success Indicators:
- No console errors
- Prices load correctly
- Price changes in DB reflect immediately
- Booking submission works
- Emails show correct prices

### ⚠️ Fallback Behavior:
If database is unavailable, the app will:
- Use hardcoded fallback prices
- Log an error to console
- Continue functioning normally

## Troubleshooting

### Issue: "Cannot read property of undefined"
**Solution:** Make sure migration was applied successfully. Check if tables exist.

### Issue: Prices not updating
**Solution:** 
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear localStorage
3. Check database connection
4. Verify RLS policies are set correctly

### Issue: "Permission denied"
**Solution:** Check Row Level Security policies. Public read access should be enabled for pricing tables.

### Verify RLS Policies:
```sql
-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('service_type_pricing', 'additional_services', 'frequency_options', 'system_settings');
```

## Current Pricing (Default Values)

### Service Base Prices
| Service | Price |
|---------|-------|
| Standard Cleaning | R250.00 |
| Deep Cleaning | R400.00 |
| Move In/Out | R500.00 |
| Airbnb Cleaning | R350.00 |
| Office Cleaning | R300.00 |
| Holiday Cleaning | R450.00 |

### Room Pricing
- Per Bedroom: **R30**
- Per Bathroom: **R40**

### Additional Services
| Service | Price |
|---------|-------|
| Inside Fridge | R50.00 |
| Inside Oven | R50.00 |
| Inside Cabinets | R75.00 |
| Interior Windows | R100.00 |
| Interior Walls | R100.00 |
| Ironing | R75.00 |
| Laundry & Ironing | R150.00 |

### Frequency Discounts
- One-time: **0%**
- Weekly: **15%**
- Bi-weekly: **10%**
- Monthly: **5%**

### Service Fee
- **10%** of discounted subtotal

## Next Steps

1. ✅ Apply migration
2. ✅ Test booking flow
3. ✅ Verify prices in database
4. 🔄 Update prices as needed
5. 🚀 Deploy to production

## Production Deployment

Before deploying to production:

1. **Backup current database**
2. **Test migration on staging first**
3. **Apply migration to production:**
   ```bash
   npx supabase db push --linked
   ```
4. **Monitor for any issues**
5. **Verify prices are correct**

## Support

For issues or questions:
1. Check `PRICING_DATABASE_MIGRATION.md` for detailed documentation
2. Review console logs for errors
3. Verify database connection
4. Check Supabase dashboard for data

---

**Status:** Ready to Apply ✅
**Estimated Time:** 5 minutes
**Risk Level:** Low (has fallback mechanism)
