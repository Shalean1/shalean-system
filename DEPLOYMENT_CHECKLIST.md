# Deployment Checklist - Dynamic Booking Data

Use this checklist to deploy the dynamic booking data system to production.

## Pre-Deployment

### 1. Review Changes
- [ ] Read `CHANGES_SUMMARY.md` to understand all changes
- [ ] Review `DYNAMIC_BOOKING_DATA.md` for system documentation
- [ ] Check `QUICK_START_DYNAMIC_DATA.md` for setup instructions

### 2. Local Testing
- [ ] Migration runs successfully locally
- [ ] All 6 tables created with correct schema
- [ ] Default data (73 records) inserted correctly
- [ ] Quote form loads locations from database
- [ ] Quote form loads additional services from database
- [ ] Service details page loads extras from database
- [ ] Service details page loads time slots from database
- [ ] Schedule page loads cleaners from database
- [ ] Schedule page loads frequencies from database
- [ ] System settings load correctly
- [ ] Fallback data works when Supabase is unreachable
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] No console errors in browser

### 3. Backup
- [ ] Backup current production database
- [ ] Export current data (if any exists in tables)
- [ ] Document current configuration
- [ ] Have rollback plan ready

## Deployment Steps

### Step 1: Database Migration

#### Option A: Supabase Dashboard (Recommended)
- [ ] Log in to Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Open `supabase/migrations/002_booking_dynamic_data.sql`
- [ ] Copy entire file content
- [ ] Paste into SQL Editor
- [ ] Click "Run" to execute
- [ ] Verify success message appears
- [ ] Check for any error messages

#### Option B: Supabase CLI
```bash
- [ ] Run: supabase link --project-ref <your-project-ref>
- [ ] Run: supabase db push
- [ ] Verify migration applied successfully
```

### Step 2: Verify Database

Run these queries in SQL Editor:

```sql
-- Verify all tables exist
- [ ] SELECT COUNT(*) FROM service_locations; -- Should return 34
- [ ] SELECT COUNT(*) FROM additional_services; -- Should return 7
- [ ] SELECT COUNT(*) FROM time_slots; -- Should return 18
- [ ] SELECT COUNT(*) FROM cleaners; -- Should return 4
- [ ] SELECT COUNT(*) FROM frequency_options; -- Should return 4
- [ ] SELECT COUNT(*) FROM system_settings; -- Should return 6
```

### Step 3: Verify RLS Policies

```sql
-- Check RLS is enabled
- [ ] SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
      AND tablename IN ('service_locations', 'additional_services', 
      'time_slots', 'cleaners', 'frequency_options', 'system_settings')
      AND rowsecurity = true;
```

All 6 tables should be returned with `rowsecurity = true`

### Step 4: Deploy Code Changes

```bash
- [ ] Commit changes: git add . && git commit -m "feat: dynamic booking data system"
- [ ] Push to repository: git push
- [ ] Deploy to production (Vercel/Netlify/etc.)
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors
```

### Step 5: Production Testing

- [ ] Open production URL
- [ ] Navigate to `/booking/quote`
- [ ] Verify locations dropdown populated (should have 34+ locations)
- [ ] Verify additional services show with icons
- [ ] Navigate to `/booking/service/standard/details`
- [ ] Verify extras displayed correctly
- [ ] Verify time slots available
- [ ] Continue to schedule page
- [ ] Verify cleaners displayed with ratings
- [ ] Verify frequency options with discounts
- [ ] Complete full booking flow
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)

### Step 6: Monitor

- [ ] Check application logs for errors
- [ ] Monitor Supabase logs
- [ ] Check performance metrics
- [ ] Verify no increase in error rates
- [ ] Monitor page load times

## Post-Deployment

### 1. Verify Data Access
- [ ] Test that public users can view data
- [ ] Test that data updates reflect immediately
- [ ] Verify fallback works (disconnect internet temporarily)

### 2. Update Documentation
- [ ] Update team documentation with new system
- [ ] Share SQL query examples with team
- [ ] Document data management procedures
- [ ] Create admin guide for non-technical users

### 3. Training (if needed)
- [ ] Train team on how to update locations
- [ ] Train team on how to manage cleaners
- [ ] Train team on how to adjust pricing/discounts
- [ ] Share troubleshooting guide

## Customization (Optional)

### Add Your Own Data

```sql
-- Add new locations
- [ ] INSERT INTO service_locations (name, slug, city, display_order)
      VALUES ('Your Area', 'your-area', 'Your City', 100);

-- Update cleaner information
- [ ] UPDATE cleaners SET bio = 'Updated bio', rating = 4.9 
      WHERE cleaner_id = 'natasha-m';

-- Adjust discounts
- [ ] UPDATE frequency_options 
      SET discount_percentage = 20.00, display_label = 'Save 20%'
      WHERE frequency_id = 'weekly';

-- Update settings
- [ ] UPDATE system_settings 
      SET setting_value = 'Your Value'
      WHERE setting_key = 'default_city';
```

## Rollback Plan

If issues occur:

### Immediate Rollback (Keep Running)
- [ ] App will automatically use fallback data
- [ ] No user-facing issues expected
- [ ] Investigate errors in logs

### Full Rollback (If Necessary)
```bash
- [ ] Revert code deployment: git revert <commit-hash>
- [ ] Push rollback: git push
- [ ] Redeploy previous version
```

### Database Rollback (If Necessary)
```sql
-- Only if you need to remove tables
- [ ] DROP TABLE IF EXISTS service_locations CASCADE;
- [ ] DROP TABLE IF EXISTS additional_services CASCADE;
- [ ] DROP TABLE IF EXISTS time_slots CASCADE;
- [ ] DROP TABLE IF EXISTS cleaners CASCADE;
- [ ] DROP TABLE IF EXISTS frequency_options CASCADE;
- [ ] DROP TABLE IF EXISTS system_settings CASCADE;
```

## Success Criteria

All items should be checked ✅:

- [ ] Migration applied without errors
- [ ] All 6 tables created
- [ ] 73 records inserted
- [ ] RLS policies active
- [ ] Quote form loads dynamic locations
- [ ] Service details loads dynamic extras
- [ ] Service details loads dynamic time slots
- [ ] Schedule page loads dynamic cleaners
- [ ] Schedule page loads dynamic frequencies
- [ ] System settings applied
- [ ] Fallback works when offline
- [ ] No console errors
- [ ] No performance degradation
- [ ] Mobile responsive
- [ ] Cross-browser compatible

## Issues Found?

If you encounter issues:

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Verify .env.local** has correct credentials
4. **Test fallback** by disconnecting internet
5. **Review documentation** in `DYNAMIC_BOOKING_DATA.md`
6. **Check RLS policies** allow public read access

## Contact & Support

- Documentation: `DYNAMIC_BOOKING_DATA.md`
- Quick Start: `QUICK_START_DYNAMIC_DATA.md`
- Summary: `CHANGES_SUMMARY.md`
- Supabase Docs: https://supabase.com/docs

## Final Notes

- ✅ Zero downtime deployment possible
- ✅ Backward compatible with fallback data
- ✅ No breaking changes to user experience
- ✅ Data changes don't require code deployment
- ✅ Easy to manage and update

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Production URL**: _______________
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete | ⬜ Rolled Back

---

Good luck with your deployment! 🚀
