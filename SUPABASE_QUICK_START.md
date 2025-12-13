# 🚀 Supabase Quick Start

## What's Been Set Up

✅ **Supabase packages installed** (`@supabase/supabase-js` and `@supabase/ssr`)
✅ **Client utilities created** for browser, server, and middleware
✅ **Auth actions updated** with real authentication (login, signup, password reset)
✅ **Booking storage created** with Supabase integration
✅ **Database schema prepared** for your tables
✅ **Middleware configured** for session management

## 🔧 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - Name: `Shalean Cleaning Services`
   - Database Password: (save this!)
   - Region: Choose closest to your users
4. Wait ~2 minutes for setup

### Step 2: Get Your Keys

1. In your project, go to **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public key**

### Step 3: Create .env.local File

Create a file named `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For password reset emails
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Your existing keys
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-key
```

Replace the values with your actual keys from Step 2.

### Step 4: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **"Run"**

This creates your `bookings` and `profiles` tables with security policies.

### Step 5: Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Add:
   - **Site URL**: `http://localhost:3000` (or your domain)
   - **Redirect URLs**: `http://localhost:3000/**`

3. (Optional) For development, disable email confirmation:
   - Go to **Authentication** → **Providers** → **Email**
   - Uncheck "Confirm email"

### Step 6: Test It!

```bash
npm run dev
```

Visit `http://localhost:3000/auth/signup` and create a test account!

## 📁 Files Created

```
lib/
├── supabase/
│   ├── client.ts          # Client-side Supabase
│   ├── server.ts          # Server-side Supabase
│   └── middleware.ts      # Session refresh
├── storage/
│   ├── bookings.ts        # Old file-based (keep for now)
│   └── bookings-supabase.ts # New Supabase storage
supabase/
└── schema.sql             # Database schema
middleware.ts              # Next.js middleware
```

## 🔄 Migrate to Supabase Storage

When ready to use Supabase instead of JSON files:

**In `app/actions/submit-booking.ts`**, change:

```typescript
// Old
import { saveBooking, generateBookingId, generateBookingReference } from "@/lib/storage/bookings";

// New
import { saveBooking, generateBookingId, generateBookingReference } from "@/lib/storage/bookings-supabase";
```

**In any API routes using bookings**, update the import the same way.

## 🎯 What Works Now

### Authentication
- ✅ User signup with email/password
- ✅ User login
- ✅ Password reset via email
- ✅ Automatic session management
- ✅ User profile creation

### Bookings (when you switch to Supabase storage)
- ✅ Save bookings to database
- ✅ Query bookings by user
- ✅ Query bookings by reference
- ✅ Update booking status
- ✅ Update payment status
- ✅ Row-level security (users can only see their bookings)

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only see their own bookings
- **Email verification**: Can be enabled in production
- **Secure cookies**: Session tokens stored securely
- **Automatic session refresh**: Middleware keeps users logged in

## 📊 View Your Data

In Supabase dashboard:
- **Authentication** → **Users**: See all registered users
- **Table Editor** → **bookings**: View all bookings
- **Table Editor** → **profiles**: View user profiles

## 🆘 Troubleshooting

### "Invalid API key"
- Check `.env.local` has correct values
- Restart dev server: `npm run dev`

### Users can't login
- Check authentication is enabled in Supabase
- Verify email confirmation settings

### Can't see bookings
- Check RLS policies in SQL editor
- Ensure user is authenticated

### Need help?
See `SUPABASE_SETUP.md` for detailed guide.

## 🚀 Next Steps

1. **Test authentication flow**: Signup → Login → Logout
2. **Switch to Supabase storage**: Update booking imports
3. **Configure email templates**: Customize in Supabase dashboard
4. **Add production URL**: Update redirect URLs for production
5. **Enable email verification**: For production security

## 📚 Useful Commands

```bash
# Start dev server
npm run dev

# Check Supabase tables
# Visit: https://app.supabase.com/project/_/editor

# View auth users
# Visit: https://app.supabase.com/project/_/auth/users
```

That's it! You're ready to use Supabase! 🎉
