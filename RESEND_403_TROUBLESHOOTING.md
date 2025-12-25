# Resend 403 Error Troubleshooting Guide

If you're getting **403 Forbidden** errors from Resend, this guide will help you diagnose and fix the issue.

## Common Causes of 403 Errors

### 1. Invalid or Expired API Key

**Symptoms:**
- All email requests return 403
- Error message mentions "Forbidden" or "403"

**Solution:**
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Check if your API key is active
3. If expired or invalid, create a new API key
4. Update your `RESEND_API_KEY` environment variable with the new key
5. Restart your application

**Verify:**
- API key should start with `re_`
- API key should be 40+ characters long
- Check your environment variables are loaded correctly

### 2. Domain Not Verified

**Symptoms:**
- 403 errors when sending emails
- Domain verification status shows as "Pending" or "Failed" in Resend dashboard

**Solution:**
1. Go to [Resend Domains](https://resend.com/domains)
2. Check the status of your domain (e.g., `bokkiecleaning.co.za`)
3. If not verified, follow the verification steps:
   - Add the required DNS records (SPF, DKIM, DMARC)
   - Wait for DNS propagation (can take up to 48 hours)
   - Verify the domain status shows as "Verified"

**Important:** You can only send emails from verified domains.

### 3. From Email Not Allowed

**Symptoms:**
- 403 errors specifically when using certain "from" addresses

**Solution:**
1. Check your `RESEND_FROM_EMAIL` environment variable
2. Ensure the email address is from a verified domain
3. In Resend dashboard → Domains → Your domain → Check which email addresses are allowed
4. Update `RESEND_FROM_EMAIL` to match a verified email address

**Example:**
- If your domain `bokkiecleaning.co.za` is verified, you can use:
  - `bookings@bokkiecleaning.co.za` ✅
  - `info@bokkiecleaning.co.za` ✅
  - `noreply@bokkiecleaning.co.za` ✅
  - `test@gmail.com` ❌ (not from verified domain)

### 4. API Key Permissions

**Symptoms:**
- API key exists but still getting 403 errors

**Solution:**
1. Check your API key permissions in Resend dashboard
2. Ensure the API key has "Send Email" permissions
3. If using a restricted API key, ensure it has access to the domain you're trying to use

## Quick Diagnostic Steps

1. **Check Environment Variables:**
   ```bash
   # Verify RESEND_API_KEY is set
   echo $RESEND_API_KEY  # Linux/Mac
   echo %RESEND_API_KEY% # Windows
   ```

2. **Verify API Key Format:**
   - Should start with `re_`
   - Should be 40+ characters
   - No extra spaces or quotes

3. **Check Resend Dashboard:**
   - [API Keys](https://resend.com/api-keys) - Verify key is active
   - [Domains](https://resend.com/domains) - Verify domain status
   - [Logs](https://resend.com/emails) - Check for detailed error messages

4. **Test with Resend API directly:**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "bookings@bokkiecleaning.co.za",
       "to": "test@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

## Environment Variables Checklist

Make sure these are set in your `.env` file or environment:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=bookings@bokkiecleaning.co.za
RESEND_TO_EMAIL=info@bokkiecleaning.co.za
```

## After Fixing

1. Restart your application/server
2. Try sending a test email
3. Check the application logs for detailed error messages
4. Monitor the Resend dashboard for successful sends

## Getting Help

If you've tried all the above and still getting 403 errors:

1. Check the detailed error logs in your application console
2. Review the Resend dashboard logs for more information
3. Contact Resend support with:
   - Your API key prefix (first 10 characters)
   - Domain name
   - Error message details
   - Timestamp of the error

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

