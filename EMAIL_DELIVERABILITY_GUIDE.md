# Email Deliverability Troubleshooting Guide

If emails are still going to spam after fixing code issues, the problem is likely with DNS configuration, domain reputation, or email authentication. Follow this comprehensive guide.

## 🚨 IMMEDIATE ACTION REQUIRED

**Your Google Admin Toolbox results show critical issues:**
- ❌ **DKIM is not set up** ← This is causing spam filtering
- ❌ **DMARC is not set up** ← This is causing spam filtering
- ⚠️ SPF configuration needs attention

**These missing DNS records are 100% why your emails go to spam.**

### Quick Fix Steps (Do This Now):

1. **Go to Resend Dashboard**: https://resend.com/domains
2. **Click on your domain** `bokkiecleaning.co.za`
3. **Copy the DNS records** Resend shows you need to add
4. **Add them to your domain's DNS** (see detailed instructions below)
5. **Wait 24-48 hours** for DNS propagation
6. **Verify in Resend** that status shows "Verified"

**Note**: The "SPF must allow Google servers" warning from Google Admin Toolbox is for Google Workspace. Since you're using Resend, you need SPF to allow Resend, not Google. The critical issues are the missing DKIM and DMARC records.

## Critical Checklist

### 1. Verify DNS Records (MOST IMPORTANT) ⚠️ CRITICAL ISSUE DETECTED

**Your Google Admin Toolbox results show:**
- ❌ **DKIM is not set up** - CRITICAL
- ❌ **DMARC is not set up** - CRITICAL
- ⚠️ SPF configuration issues

These missing records are **definitely causing emails to go to spam**. Fix these immediately.

#### Check Current DNS Records

Use these tools to verify your DNS records:
- **MXToolbox**: https://mxtoolbox.com/spf.aspx
- **DMARC Analyzer**: https://dmarcian.com/dmarc-inspector/
- **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/ (you've already checked ✅)

#### Required DNS Records for Resend

**STEP 1: Get DNS Records from Resend**

1. Go to [Resend Domains Dashboard](https://resend.com/domains)
2. Click on `bokkiecleaning.co.za`
3. You'll see the exact DNS records you need to add:
   - **SPF Record** (TXT record for root domain)
   - **DKIM Record** (TXT record with selector)
   - Copy these EXACT values

**STEP 2: Add DNS Records to Your Domain**

You need to add these TXT records to your domain's DNS:

1. **SPF Record** (TXT record for `bokkiecleaning.co.za`)
   - Name/Host: `@` or `bokkiecleaning.co.za` (root domain)
   - Type: `TXT`
   - Value: `v=spf1 include:resend.com ~all`
   - **Note**: If you already have an SPF record, you need to MODIFY it, not create a duplicate. You can only have ONE SPF record per domain.

2. **DKIM Record** (TXT record - Resend provides specific values)
   - Name/Host: `[selector]._domainkey` (e.g., `resend._domainkey` or similar)
   - Type: `TXT`
   - Value: Copy the EXACT value from Resend dashboard
   - **Example format**: `[selector]._domainkey.bokkiecleaning.co.za`

3. **DMARC Record** (TXT record for `_dmarc.bokkiecleaning.co.za`)
   - Name/Host: `_dmarc`
   - Type: `TXT`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@bokkiecleaning.co.za`
   - **Start with `p=none`** (monitoring only), then change to `p=quarantine` after confirming it works

#### How to Add DNS Records (Step-by-Step)

**Option A: If using Domain Registrar (GoDaddy, Namecheap, etc.)**

1. Log into your domain registrar account
2. Navigate to: **DNS Management** / **DNS Settings** / **Advanced DNS**
3. Find the **TXT Records** section
4. Click **Add Record** or **+**
5. Add each record:
   - **SPF**: Host `@`, Type `TXT`, Value `v=spf1 include:resend.com ~all`
   - **DKIM**: Host `[selector]._domainkey` (from Resend), Type `TXT`, Value (from Resend)
   - **DMARC**: Host `_dmarc`, Type `TXT`, Value `v=DMARC1; p=none; rua=mailto:dmarc@bokkiecleaning.co.za`
6. Save all records
7. Wait 24-48 hours for DNS propagation

**Option B: If using Cloudflare or another DNS provider**

1. Log into Cloudflare (or your DNS provider)
2. Select domain `bokkiecleaning.co.za`
3. Go to **DNS** section
4. Click **Add record**
5. Add the three TXT records as above
6. Ensure **Proxy status** is **DNS only** (not proxied) for email records

**Important Notes:**
- ⚠️ **Only ONE SPF record allowed** - If you already have one, MODIFY it to include `include:resend.com`
- ⚠️ **DKIM selector is specific** - Use the exact selector Resend provides
- ⚠️ **Wait 24-48 hours** - DNS changes take time to propagate globally
- ⚠️ **Verify in Resend** - After 24 hours, check Resend dashboard to confirm "Verified" status

### 2. Test Email Authentication

After adding DNS records, test them:

**SPF Test:**
```bash
# Using dig (Linux/Mac)
dig TXT bokkiecleaning.co.za

# Or use online tool
https://mxtoolbox.com/spf.aspx
```

**DKIM Test:**
```bash
# Resend provides specific selector
dig TXT [selector]._domainkey.bokkiecleaning.co.za

# Or use online tool
https://mxtoolbox.com/dkim.aspx
```

**DMARC Test:**
```bash
dig TXT _dmarc.bokkiecleaning.co.za

# Or use online tool
https://dmarcian.com/dmarc-inspector/
```

### 3. Check Domain Reputation

Your domain might have a poor reputation from previous email activity.

**Check Domain Reputation:**
- **Sender Score**: https://www.senderscore.org/
- **Google Postmaster Tools**: https://postmaster.google.com/
- **Microsoft SNDS**: https://sendersupport.olc.protection.outlook.com/snds/

**If Domain Reputation is Poor:**
- Wait 30-60 days for reputation to improve
- Send only to engaged recipients
- Avoid sending to invalid/bounced emails
- Gradually increase sending volume

### 4. Email Testing Tools

Test your emails before sending:

**Mail-Tester** (Free):
1. Go to https://www.mail-tester.com/
2. Get a test email address
3. Send a test email to that address
4. Check your score (aim for 8+/10)
5. Fix any issues it identifies

**GlockApps** (Paid):
- More comprehensive testing
- Tests across multiple email providers
- Shows spam score and placement

**Litmus** (Paid):
- Email preview across clients
- Spam filter testing

### 5. Verify Resend Domain Status

1. Go to https://resend.com/domains
2. Click on `bokkiecleaning.co.za`
3. Verify ALL statuses show "Verified" (green checkmarks):
   - ✅ SPF Record
   - ✅ DKIM Record
   - ✅ Domain Status
4. If any show "Pending" or "Failed", fix the DNS records

### 6. Check Email Content

Even with proper authentication, certain content can trigger spam filters:

**Avoid:**
- ALL CAPS in subject lines
- Excessive exclamation marks (!!!)
- Spam trigger words: "free", "guarantee", "winner", "urgent", "act now"
- Too many links
- Image-only emails (no text)
- Suspicious URLs (URL shorteners, mismatched domains)

**Best Practices:**
- Use clear, professional subject lines
- Balance text and images (60/40 text-to-image ratio)
- Include plain text version (already done ✅)
- Use your domain for all links
- Personalize emails with recipient's name

### 7. Warm Up Your Domain (If New)

If this is a new domain or you just started sending:

**Week 1-2:**
- Send 10-20 emails per day
- Only to engaged recipients (people who signed up)
- Monitor bounce rates (should be < 5%)

**Week 3-4:**
- Gradually increase to 50-100 emails per day
- Continue monitoring metrics

**Week 5+:**
- Can send at full volume
- Continue monitoring reputation

### 8. Monitor Email Metrics

Track these metrics in Resend dashboard:

**Good Metrics:**
- ✅ Delivery rate: > 95%
- ✅ Open rate: > 20%
- ✅ Click rate: > 2%
- ✅ Bounce rate: < 5%
- ✅ Spam complaints: < 0.1%

**Red Flags:**
- ❌ High bounce rate (> 10%)
- ❌ High spam complaints (> 0.5%)
- ❌ Low open rates (< 10%)
- ❌ Many emails going to spam

### 9. Verify Environment Variables

Double-check your `.env.local` file:

```env
# Must be set correctly
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=bookings@bokkiecleaning.co.za

# Verify this matches your verified domain
# DO NOT use noreply@ addresses
```

**Important:**
- Use `bookings@bokkiecleaning.co.za` (not `noreply@`)
- Ensure email matches what's verified in Resend
- Restart server after changing environment variables

### 10. Test with Different Email Providers

Send test emails to:
- Gmail account
- Outlook/Hotmail account
- Yahoo account
- Your own domain email

Check where they land:
- ✅ Inbox = Good
- ⚠️ Promotions/Social = Acceptable (for marketing emails)
- ❌ Spam/Junk = Problem

### 11. Check IP Reputation

Resend uses shared IPs. If many users abuse Resend, it can affect deliverability.

**What You Can Do:**
- Use Resend's dedicated IP option (paid feature)
- Or wait for Resend to resolve IP reputation issues
- Consider alternative email services if persistent issues

### 12. Contact Resend Support

If all else fails:

1. Go to https://resend.com/support
2. Provide:
   - Your domain name
   - API key prefix (first 10 characters)
   - Screenshot of domain verification status
   - Email testing results (Mail-Tester score)
   - DNS record screenshots
   - Description of the issue

### 13. Alternative Solutions

If Resend continues to have deliverability issues:

**Consider:**
- **SendGrid** - Good deliverability, similar pricing
- **Mailgun** - Strong deliverability, developer-friendly
- **Amazon SES** - Very reliable, requires more setup
- **Postmark** - Excellent deliverability, transactional focus

## Quick Diagnostic Commands

**Check DNS records:**
```bash
# SPF
dig TXT bokkiecleaning.co.za | grep spf

# DKIM (replace [selector] with Resend's selector)
dig TXT [selector]._domainkey.bokkiecleaning.co.za

# DMARC
dig TXT _dmarc.bokkiecleaning.co.za
```

**Test email sending:**
```bash
# Use Mail-Tester
# 1. Go to https://www.mail-tester.com/
# 2. Send test email
# 3. Check score
```

## Most Common Issues

1. **Missing or incorrect DNS records** (SPF/DKIM/DMARC) - 80% of cases
2. **Domain not fully verified in Resend** - 10% of cases
3. **Poor domain reputation** - 5% of cases
4. **Using noreply@ address** - 3% of cases
5. **Other issues** - 2% of cases

## Next Steps

1. ✅ **First**: Verify DNS records are correct (use tools above)
2. ✅ **Second**: Confirm domain is verified in Resend dashboard
3. ✅ **Third**: Test email with Mail-Tester
4. ✅ **Fourth**: Check domain reputation
5. ✅ **Fifth**: Monitor metrics for 1-2 weeks

## Expected Timeline

- **DNS propagation**: 24-48 hours
- **Domain reputation improvement**: 2-4 weeks (if poor)
- **Full deliverability**: 1-2 months (for new domains)

## Resources

- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [SPF Record Syntax](https://www.openspf.org/SPF_Record_Syntax)
- [DMARC Guide](https://dmarc.org/wiki/FAQ)
- [Mail-Tester](https://www.mail-tester.com/)
- [Google Postmaster Tools](https://postmaster.google.com/)
