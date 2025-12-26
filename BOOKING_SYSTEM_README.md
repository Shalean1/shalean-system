# Booking System Documentation

## Overview

This is a full-stack multi-step booking form system for Bokkie Cleaning Services. The system allows users to book cleaning services without requiring login, integrates with Paystack for payments, sends confirmation emails, and stores bookings in JSON files.

## Features

- ✅ Multi-step booking flow (3 steps)
- ✅ No login required
- ✅ Real-time price calculation
- ✅ Paystack payment integration
- ✅ Email confirmations (customer and business)
- ✅ Booking storage in JSON files
- ✅ Responsive design matching Bokkie website

## Route Structure

- `/booking/service/[type]/details` - Step 1: Service & Details
- `/booking/service/[type]/schedule` - Step 2: Schedule & Cleaner
- `/booking/service/[type]/review` - Step 3: Contact & Review
- `/booking/service/[type]/confirmation` - Confirmation page after successful booking

Where `[type]` can be: `standard`, `deep`, `move-in-out`, or `airbnb`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=hello@bokkie.com

# Paystack Payment Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

For production, use production keys:
- `pk_live_...` for PAYSTACK_PUBLIC_KEY
- `sk_live_...` for PAYSTACK_SECRET_KEY

## Booking Flow

### Step 1: Service & Details
- Select service type (Standard, Deep, Move In/Out, Airbnb)
- Choose bedrooms and bathrooms
- Select extras (Inside Fridge, Inside Oven, etc.)
- Pick date and time
- Add special instructions
- Real-time price summary

### Step 2: Schedule & Cleaner
- Enter service address (street, apt/unit, suburb, city)
- Select preferred cleaner or "No preference"
- Choose cleaning frequency (One-Time, Weekly, Bi-Weekly, Monthly)
- Updated price summary with frequency discounts

### Step 3: Contact & Review
- Enter contact information (first name, last name, email, phone)
- Review all booking details (editable sections)
- Apply discount code (optional)
- Confirm and pay via Paystack

### Confirmation Page
- Display booking reference
- Show booking summary
- Next steps information
- Contact information

## Pricing Logic

### Base Prices
- Standard Cleaning: R250
- Deep Cleaning: R400
- Move In/Out: R500
- Airbnb Cleaning: R350

### Room Pricing
- Per Bedroom: R30
- Per Bathroom: R40

### Extras Pricing
- Inside Fridge: R50
- Inside Oven: R50
- Inside Cabinets: R40
- Interior Windows: R60
- Interior Walls: R80
- Laundry & Ironing: R70
- Ironing: R50

### Frequency Discounts
- Weekly: 15% discount
- Bi-Weekly: 10% discount
- Monthly: 5% discount
- One-Time: No discount

### Service Fee
- 10% of discounted subtotal

## Data Storage

Bookings are stored in `data/bookings.json`. Each booking includes:
- Unique booking ID
- Booking reference (e.g., SHL-ABC123-XYZ)
- All form data
- Pricing breakdown
- Payment status
- Timestamp

## Email Templates

### Customer Confirmation Email
Sent to the customer after successful booking with:
- Booking reference
- Service details
- Schedule information
- Address
- Payment confirmation

### Business Notification Email
Sent to the business email with:
- Customer information
- Service details
- Schedule
- Payment status

## Payment Integration

The system uses Paystack's inline payment popup:
1. User clicks "Confirm & Pay"
2. Payment is initialized with booking data
3. Paystack popup opens
4. User completes payment
5. On success, redirects to confirmation page
6. Booking is saved with payment reference

## File Structure

```
app/
  booking/
    service/
      [type]/
        details/page.tsx      # Step 1
        schedule/page.tsx      # Step 2
        review/page.tsx        # Step 3
        confirmation/page.tsx   # Confirmation
        layout.tsx             # Shared layout
  actions/
    payment.ts                 # Payment initialization
    submit-booking.ts         # Booking submission

components/
  booking/
    ProgressIndicator.tsx     # Step progress bar
    PriceSummary.tsx           # Price breakdown sidebar
    ServiceCard.tsx            # Service selection card
    CleanerCard.tsx            # Cleaner selection card
    FrequencyCard.tsx          # Frequency selection card
    BookingLayoutHeader.tsx    # Layout header

lib/
  types/booking.ts             # TypeScript interfaces
  pricing.ts                   # Pricing calculations
  paystack.ts                  # Paystack utilities
  storage/bookings.ts          # Booking storage
  email.ts                     # Email functions (extended)

data/
  bookings.json                # Booking storage (gitignored)
```

## Testing

### Test Payment Flow
1. Use Paystack test keys
2. Use test card: 4084084084084081
3. Use any future expiry date
4. Use any CVV
5. Use any PIN

### Test Email Flow
- In development, emails are sent to configured addresses
- Check Resend dashboard for email logs

## Future Enhancements

- [ ] Database integration (replace JSON storage)
- [ ] Admin dashboard for viewing bookings
- [ ] Booking modification/cancellation
- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Recurring booking management
- [ ] Discount code validation
- [ ] Payment webhook verification

## Support

For issues or questions, contact:
- Email: hello@bokkie.com
- Phone: +27 12 345 6789

