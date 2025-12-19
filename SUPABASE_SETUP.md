# Supabase Setup Guide

This guide will help you set up Supabase for your Shalean Cleaning Services application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Shalean Cleaning Services
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Add your site URL for password reset emails
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Existing keys
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `bookings` table with all necessary fields
- `profiles` table for user information
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic profile creation

## Step 5: Configure Authentication

### Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset email templates (optional)

### Email Confirmation (Optional)

By default, Supabase requires email confirmation. To disable it for development:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, uncheck "Enable email confirmations"
3. Click "Save"

For production, keep email confirmation enabled for security.

### Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**: Add:
     - `http://localhost:3000/**` (development)
     - Your production URL with `/**` wildcard

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`
3. Create a test account
4. Check if the account is created:
   - Go to Supabase dashboard → **Authentication** → **Users**
   - You should see your test user

5. Try logging in at `http://localhost:3000/auth/login`

## Step 7: Update Booking Actions (If Needed)

The booking actions will need to be updated to use the new Supabase storage instead of JSON files:

1. Update imports in `app/actions/submit-booking.ts`:
   ```typescript
   // Old
   import { saveBooking, generateBookingReference, generateBookingId } from "@/lib/storage/bookings";
   
   // New
   import { saveBooking, generateBookingReference, generateBookingId } from "@/lib/storage/bookings-supabase";
   ```

## Features Enabled

✅ **User Authentication**
- Email/password signup and login
- Password reset functionality
- Automatic session management
- Secure cookie-based authentication

✅ **Booking Management**
- Store bookings in Supabase database
- Query bookings by user email
- Update booking status
- Track payment status
- Row-level security for data protection

✅ **User Profiles**
- Automatic profile creation on signup
- Store user metadata (first name, last name)
- Link bookings to user profiles

## Next Steps

1. **Add Admin Panel**: Create an admin interface to manage bookings
2. **Add Realtime**: Use Supabase realtime to get live updates on bookings
3. **Add Storage**: Use Supabase Storage for uploading images (before/after cleaning photos)
4. **Add Reviews**: Create a reviews table for customer feedback
5. **Add Push Notifications**: Notify users about booking updates

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after changing environment variables

### Email not sending
- Check Supabase email settings in **Authentication** → **Settings**
- For production, set up a custom SMTP provider

### RLS Policy Issues
- If users can't access their data, check the RLS policies in the SQL editor
- Make sure the policies match your authentication setup

### Database Connection Issues
- Ensure your Supabase project is active (it may pause after inactivity on free tier)
- Check your internet connection

## Support

For more information, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)











