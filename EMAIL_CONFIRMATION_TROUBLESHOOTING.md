# Email Confirmation Troubleshooting Guide

## Problem: Not Receiving Confirmation Emails After Signup

If you're not receiving confirmation emails after signing up, here are the most common causes and solutions:

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

Supabase's default email service has limitations. For reliable email delivery, set up a custom SMTP provider:

### Option 1: Using Resend (Recommended)

1. **Sign up for Resend** at [resend.com](https://resend.com)
2. **Verify your domain** (or use their test domain for development)
3. **Get your API key** from Resend dashboard
4. **Configure in Supabase**:
   - Go to **Authentication** → **SMTP Settings**
   - Enable "Custom SMTP"
   - Fill in:
     - **Host**: `smtp.resend.com`
     - **Port**: `465` (SSL) or `587` (TLS)
     - **Username**: `resend`
     - **Password**: Your Resend API key
     - **Sender email**: Your verified email (e.g., `noreply@yourdomain.com`)
     - **Sender name**: `Shalean Cleaning Services`
   - Click "Save"

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
     - **Sender name**: `Shalean Cleaning Services`
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
     - **Sender name**: `Shalean Cleaning Services`
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
