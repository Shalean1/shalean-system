# Email Confirmation Troubleshooting Guide

## Problem: Not Receiving Confirmation Emails After Signup

If you're not receiving confirmation emails after signing up, here are the most common causes and solutions:

**Note**: If your domain is already verified in Resend (for sending booking/quote confirmation emails), you should configure Supabase to use Resend SMTP so all emails go through your verified domain. See "Set Up Custom SMTP" section below.

## ⚠️ Quick Fix: Domain Verified but Emails Not Sending

**If your domain is already verified in Resend but Supabase confirmation emails are failing:**

This happens because Supabase uses its own email service by default, separate from your Resend configuration. Even though your domain is verified in Resend, Supabase authentication emails won't use it until you configure SMTP.

**Solution**: Configure Supabase to use Resend SMTP (takes 2 minutes):

1. Go to **Supabase Dashboard** → **Authentication** → **SMTP Settings**
2. Enable **"Custom SMTP"**
3. Enter these settings:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: Your Resend API key (from Resend dashboard)
   - **Sender email**: `bookings@bokkiecleaning.co.za` (or another email from your verified domain)
   - **Sender name**: `Bokkie Cleaning Services`
4. Click **"Save"** and test the connection

After this, all Supabase authentication emails (signup confirmations, password resets) will be sent through your verified Resend domain! ✅

## Quick Fixes

### 1. Check Supabase Email Settings

**For Development (Local Testing):**

1. Go to your Supabase Dashboard → **Authentication** → **Settings**
2. Under **Email Auth**, you have two options:
   - **Option A**: Disable email confirmation temporarily
     - Uncheck "Enable email confirmations"
     - Click "Save"
     - Users can now log in immediately after signup (development only!)
   
   - **Option B**: Keep email confirmation enabled but configure SMTP
     - See "Set Up Custom SMTP" section below

### 2. Check Email Spam Folder

- Supabase's default email service may send emails that end up in spam
- Check your spam/junk folder
- Add `noreply@mail.app.supabase.io` to your contacts/whitelist

### 3. Verify Supabase Project Status

- Free tier projects may pause after inactivity
- Check if your Supabase project is active in the dashboard
- If paused, click "Restore" to reactivate

### 4. Check URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Ensure these are set:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/**`
3. Click "Save"

## Set Up Custom SMTP (Recommended for Production)

Supabase's default email service has limitations. For reliable email delivery, set up a custom SMTP provider.

**Why configure SMTP?**
- Your domain is already verified in Resend (for application emails)
- Using Resend SMTP ensures all emails (including authentication emails) come from your verified domain
- Better deliverability and branding consistency
- Avoids emails going to spam folders

### Option 1: Using Resend (Recommended)

**Important**: If your domain is already verified in Resend (like `bokkiecleaning.co.za`), you can use it for Supabase authentication emails too!

1. **Get your Resend API key** from [Resend Dashboard](https://resend.com/api-keys)
   - Go to **API Keys** section
   - Copy your API key (starts with `re_`)

2. **Configure in Supabase**:
   - Go to your Supabase Dashboard → **Authentication** → **SMTP Settings**
   - Enable "Custom SMTP" toggle
   - Fill in the following settings:
     - **Host**: `smtp.resend.com`
     - **Port**: `587` (TLS - recommended) or `465` (SSL)
     - **Username**: `resend`
     - **Password**: Your Resend API key (paste the full API key here)
     - **Sender email**: Use your verified domain email (e.g., `bookings@bokkiecleaning.co.za` or `noreply@bokkiecleaning.co.za`)
       - ⚠️ **Important**: The sender email MUST be from your verified domain in Resend
       - To verify which emails you can use, check your Resend dashboard → **Domains** → Click on your domain → See verified email addresses
       - Common options: `bookings@`, `noreply@`, `hello@`, `info@` (all from your verified domain)
     - **Sender name**: `Bokkie Cleaning Services` (or your preferred name)
   - Click "Save"

3. **Verify the configuration**:
   - After saving, Supabase will test the SMTP connection
   - If successful, you'll see a green checkmark
   - If it fails, double-check:
     - Your Resend API key is correct
     - The sender email uses your verified domain
     - Port 587 is not blocked by firewall

### Option 2: Using SendGrid

1. **Sign up for SendGrid** at [sendgrid.com](https://sendgrid.com)
2. **Create an API key** in SendGrid dashboard
3. **Configure in Supabase**:
   - Go to **Authentication** → **SMTP Settings**
   - Enable "Custom SMTP"
   - Fill in:
     - **Host**: `smtp.sendgrid.net`
     - **Port**: `587`
     - **Username**: `apikey`
     - **Password**: Your SendGrid API key
     - **Sender email**: Your verified email
     - **Sender name**: `Bokkie Cleaning Services`
   - Click "Save"

### Option 3: Using Gmail (Development Only)

⚠️ **Warning**: Gmail has strict limits and is not recommended for production.

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account → Security → App passwords
   - Generate a password for "Mail"
3. **Configure in Supabase**:
   - Go to **Authentication** → **SMTP Settings**
   - Enable "Custom SMTP"
   - Fill in:
     - **Host**: `smtp.gmail.com`
     - **Port**: `587`
     - **Username**: Your Gmail address
     - **Password**: The app password (not your regular password)
     - **Sender email**: Your Gmail address
     - **Sender name**: `Bokkie Cleaning Services`
   - Click "Save"

## Test Email Configuration

After configuring SMTP, test it:

1. Go to **Authentication** → **Email Templates**
2. Click "Send test email"
3. Enter your email address
4. Check if you receive the test email

## Using the Resend Email Feature

If emails still aren't arriving, you can use the "Resend Email" button on the confirmation page:

1. After signing up, you'll be redirected to `/auth/signup/confirmation`
2. Click the "Resend Email" button
3. Check your inbox (and spam folder)

## Manual User Confirmation (Development Only)

For development/testing, you can manually confirm users in Supabase:

1. Go to **Authentication** → **Users**
2. Find the user who needs confirmation
3. Click on the user
4. Click "Confirm user" button
5. The user can now log in

## Check Email Logs

Supabase provides email logs:

1. Go to **Authentication** → **Logs**
2. Filter by "Email" type
3. Check for any errors or delivery issues

## Common Error Messages

### "Email rate limit exceeded"
- **Solution**: Wait a few minutes before trying again, or set up custom SMTP

### "Invalid email address"
- **Solution**: Verify the email format is correct

### "Email provider error"
- **Solution**: Check SMTP configuration or use Supabase's default service

## Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

After changing environment variables, restart your development server.

## Still Having Issues?

1. **Check Supabase Status**: Visit [status.supabase.com](https://status.supabase.com)
2. **Review Logs**: Check browser console and server logs for errors
3. **Test with Different Email**: Try a different email provider (Gmail, Outlook, etc.)
4. **Contact Support**: Reach out to Supabase support or check their documentation

## Production Checklist

Before deploying to production:

- [ ] Set up custom SMTP provider (Resend, SendGrid, etc.)
- [ ] Verify your domain in the email provider
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your production URL
- [ ] Update Supabase redirect URLs to include production domain
- [ ] Test email delivery in production environment
- [ ] Set up email monitoring/alerts
- [ ] Configure SPF/DKIM records for your domain (for better deliverability)
