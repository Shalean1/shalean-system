# Email Bounce Fix Guide

## Problem
Admin notification emails to `bookings@bokkiecleaning.co.za` are bouncing, while customer emails are being delivered successfully.

## Root Cause
The email address `bookings@bokkiecleaning.co.za` either:
- Doesn't exist on your mail server
- Isn't configured to receive emails
- Has a full inbox or is disabled
- Has mail server configuration issues

## Solutions

### Solution 1: Use an Existing Email Address (Quickest Fix)

Change your `RESEND_TO_EMAIL` environment variable to an email address that you know works and can receive emails.

**Steps:**
1. Check which email addresses you have set up for `bokkiecleaning.co.za`
2. Update your `.env.local` or environment variables:
   ```env
   RESEND_TO_EMAIL=info@bokkiecleaning.co.za
   ```
   (Or use another working email like `hello@bokkiecleaning.co.za`, `admin@bokkiecleaning.co.za`, etc.)

3. Restart your application/server

### Solution 2: Set Up the `bookings@bokkiecleaning.co.za` Email Address

If you want to use `bookings@bokkiecleaning.co.za`, you need to:

1. **Create the email account** in your email hosting provider (cPanel, Google Workspace, Microsoft 365, etc.)
2. **Verify MX records** are properly configured for your domain
3. **Test the email** by sending a test email to `bookings@bokkiecleaning.co.za` from another email account
4. **Check spam folder** - sometimes emails bounce if the inbox is full or has restrictions

### Solution 3: Use a Different Email Service

If you're using a shared hosting email, consider:
- **Google Workspace** (Gmail for business)
- **Microsoft 365** (Outlook for business)
- **Zoho Mail**
- **ProtonMail Business**

These services have better deliverability and are less likely to bounce.

## How to Check Email Bounce Details in Resend

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click on a bounced email
3. Check the bounce reason - it will tell you why it bounced:
   - **550 5.1.1 User unknown** - Email address doesn't exist
   - **550 5.2.1 Mailbox full** - Inbox is full
   - **550 5.7.1 Message rejected** - SPF/DKIM/DMARC failure
   - **550 5.4.1 Host not found** - MX record issues

## Verification Steps

After making changes:

1. **Test the email address** by sending a manual email to it
2. **Check Resend logs** - send a test booking/quote and verify it's delivered
3. **Monitor bounce rates** - should drop to 0% after fix

## Current Configuration

Your code defaults to `info@bokkiecleaning.co.za` if `RESEND_TO_EMAIL` is not set:
- Quote notifications: `process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za"`
- Booking notifications: `process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za"`

If you're seeing `bookings@bokkiecleaning.co.za` in the logs, it means `RESEND_TO_EMAIL` is set to that address in your environment variables.

## Recommended Action

**Immediate fix:** Change `RESEND_TO_EMAIL` to `info@bokkiecleaning.co.za` (or another working email) in your environment variables.

**Long-term:** Set up `bookings@bokkiecleaning.co.za` properly in your email hosting provider if you want to use that address.

