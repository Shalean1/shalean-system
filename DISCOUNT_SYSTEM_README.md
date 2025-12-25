# Discount Code System

A complete discount code system for the Shalean Cleaning Services booking platform.

## Features

✅ **Database Schema**: Discount codes table with validation rules
✅ **Backend Validation**: Server-side validation with database functions
✅ **UI Component**: User-friendly discount code input component
✅ **Price Integration**: Automatic price calculation with discount codes
✅ **Usage Tracking**: Tracks discount code usage and limits
✅ **Security**: Server-side validation prevents code manipulation

## Database Setup

### 1. Run the Migration

Execute the migration file in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/004_discount_codes.sql
```

This creates:
- `discount_codes` table - Stores discount codes and their rules
- `discount_code_usage` table - Tracks code usage
- `validate_discount_code()` function - Validates codes
- `record_discount_code_usage()` function - Records usage

### 2. Sample Codes

The migration includes sample discount codes:
- `WELCOME10` - 10% off (unlimited uses)
- `SAVE50` - R50 off orders over R300 (100 uses)
- `SUMMER15` - 15% off, max R100 (expires in 30 days)

## Usage

### For Users

1. During booking, navigate to the Review page
2. Enter a discount code in the "Enter discount code" field
3. Click "Apply"
4. The discount is automatically applied to the total
5. The discount is saved with the booking

### For Administrators

#### Creating Discount Codes

Insert into `discount_codes` table:

```sql
INSERT INTO discount_codes (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  is_active
) VALUES (
  'NEWCUSTOMER',
  '20% off for new customers',
  'percentage',
  20.00,
  0,
  200.00,  -- Max R200 discount
  NOW(),
  NOW() + INTERVAL '90 days',
  500,  -- 500 uses max
  true
);
```

#### Discount Types

- **percentage**: Percentage discount (e.g., 15.00 = 15%)
- **fixed**: Fixed amount discount (e.g., 50.00 = R50 off)

#### Fields Explained

- `code`: The discount code (case-insensitive)
- `discount_type`: 'percentage' or 'fixed'
- `discount_value`: The discount amount/percentage
- `minimum_order_amount`: Minimum order total required
- `maximum_discount_amount`: Max discount for percentage codes
- `valid_from`: Start date (defaults to NOW())
- `valid_until`: Expiry date (NULL = no expiry)
- `usage_limit`: Max uses (NULL = unlimited)
- `is_active`: Enable/disable code

## Architecture

### Components

1. **Database Migration** (`004_discount_codes.sql`)
   - Tables and functions
   - RLS policies
   - Sample data

2. **Server Actions** (`app/actions/discount.ts`)
   - `validateDiscountCode()` - Validates codes
   - `recordDiscountCodeUsage()` - Tracks usage

3. **UI Component** (`components/booking/DiscountCodeInput.tsx`)
   - Input field with validation
   - Success/error states
   - Remove functionality

4. **Pricing Integration** (`lib/pricing.ts`)
   - Updated `calculatePrice()` to accept discount amount
   - Applies discount after frequency discount

5. **Booking Integration** (`app/booking/service/[type]/review/page.tsx`)
   - Discount code input in review page
   - State management
   - Price recalculation

6. **Booking Submission** (`app/actions/submit-booking.ts`)
   - Server-side validation
   - Usage tracking
   - Error handling

## Discount Calculation

Discounts are applied in this order:

1. **Subtotal** = Base Price + Room Price + Extras
2. **Frequency Discount** = Subtotal × Frequency Rate
3. **Discount Code Discount** = Validated discount amount
4. **Discounted Subtotal** = Subtotal - Frequency Discount - Code Discount
5. **Service Fee** = Discounted Subtotal × Service Fee %
6. **Total** = Discounted Subtotal + Service Fee

## Validation Rules

The system validates:

✅ Code exists and is active
✅ Code is within validity dates
✅ Code hasn't exceeded usage limit
✅ Order meets minimum amount requirement
✅ Discount doesn't exceed maximum (for percentage codes)
✅ Discount doesn't exceed order total

## Security

- **Server-side validation**: All codes validated on server
- **RLS policies**: Database-level security
- **Case-insensitive**: Codes work regardless of case
- **Usage limits**: Prevents abuse
- **Date validation**: Expired codes rejected

## Testing

### Test Discount Codes

1. **WELCOME10**: 10% off, no minimum, unlimited uses
2. **SAVE50**: R50 off, minimum R300, 100 uses max
3. **SUMMER15**: 15% off, max R100, expires in 30 days

### Test Scenarios

1. Valid code → Should apply discount
2. Invalid code → Should show error
3. Expired code → Should show error
4. Code at limit → Should show error
5. Order below minimum → Should show error
6. Remove code → Should remove discount

## Troubleshooting

### Code not applying

1. Check code is active (`is_active = true`)
2. Verify validity dates
3. Check usage limit not exceeded
4. Ensure order meets minimum amount

### Price not updating

1. Check browser console for errors
2. Verify discount code validation response
3. Check price calculation function

### Usage not recording

1. Check `record_discount_code_usage` function
2. Verify booking reference is saved
3. Check database permissions

## Future Enhancements

- [ ] User-specific discount codes
- [ ] First-time customer only codes
- [ ] Referral discount codes
- [ ] Admin dashboard for managing codes
- [ ] Email notifications for code usage
- [ ] Analytics and reporting

## Files Modified/Created

### Created
- `supabase/migrations/004_discount_codes.sql`
- `app/actions/discount.ts`
- `components/booking/DiscountCodeInput.tsx`
- `DISCOUNT_SYSTEM_README.md`

### Modified
- `lib/pricing.ts` - Added discount code parameter
- `components/booking/PriceSummary.tsx` - Display discount code discount
- `app/booking/service/[type]/review/page.tsx` - Integrated discount component
- `app/actions/submit-booking.ts` - Server-side validation and tracking






















