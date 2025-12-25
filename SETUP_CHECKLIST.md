# Setup Checklist for Dynamic Popular Services

Follow these steps in order to get the dynamic popular services feature working.

## ✅ Pre-Flight Checklist

- [ ] Supabase project is set up
- [ ] Environment variables are configured (`.env.local`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] You have access to Supabase SQL Editor
- [ ] You can log in to your application

## 📋 Installation Steps

### Step 1: Database Setup
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents from `supabase/migrations/001_popular_services.sql`
- [ ] Paste and execute the SQL
- [ ] Verify table creation:
  ```sql
  SELECT * FROM popular_services;
  ```
- [ ] You should see 4 default services

### Step 2: Verify Files
Check that these files were created:
- [ ] `app/actions/popular-services.ts` ✓
- [ ] `app/admin/layout.tsx` ✓
- [ ] `app/admin/page.tsx` ✓
- [ ] `app/admin/popular-services/page.tsx` ✓
- [ ] `components/AdminLink.tsx` ✓

Check that these files were modified:
- [ ] `components/Hero.tsx` ✓
- [ ] `components/Header.tsx` ✓
- [ ] `supabase/schema.sql` ✓

### Step 3: Test Authentication
- [ ] Navigate to `/auth/login`
- [ ] Log in with your credentials
- [ ] Verify you're successfully logged in
- [ ] Check if "Admin" link appears in header (desktop)

### Step 4: Test Admin Panel
- [ ] Navigate to `/admin`
- [ ] You should see the Admin Dashboard
- [ ] Click on "Popular Services" card
- [ ] You should see the management interface
- [ ] Verify the 4 default services are displayed

### Step 5: Test CRUD Operations

#### Add a Service
- [ ] Click "Add Service" button
- [ ] Enter name: "Spring Cleaning"
- [ ] Verify slug auto-generates: "spring-cleaning"
- [ ] Click "Save"
- [ ] Verify new service appears in list
- [ ] Check it's marked as "Active"

#### Edit a Service
- [ ] Click edit icon (pencil) on any service
- [ ] Change the name
- [ ] Verify slug updates
- [ ] Click save (checkmark)
- [ ] Verify changes persisted

#### Reorder Services
- [ ] Grab the grip handle (≡) on any service
- [ ] Drag to a new position
- [ ] Drop the service
- [ ] Verify order numbers update
- [ ] Refresh page - order should persist

#### Toggle Active/Inactive
- [ ] Click the green "Active" badge on any service
- [ ] It should turn red "Inactive"
- [ ] Click it again
- [ ] It should turn green "Active"

#### Delete a Service
- [ ] Click delete icon (trash) on "Spring Cleaning"
- [ ] Confirm deletion in popup
- [ ] Verify service is removed from list

### Step 6: Test Homepage Integration
- [ ] Open homepage in new tab: `/`
- [ ] Scroll to hero section
- [ ] Look for "Popular:" label
- [ ] Verify you see the blue service tags
- [ ] Count the tags - should match active services count

#### Test Real-Time Updates
- [ ] Keep homepage tab open
- [ ] In admin tab, add a new service
- [ ] Refresh homepage
- [ ] New service should appear

- [ ] In admin tab, deactivate a service
- [ ] Refresh homepage
- [ ] Service should disappear

- [ ] In admin tab, reorder services
- [ ] Refresh homepage
- [ ] Order should match

### Step 7: Test Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test admin panel on mobile view
- [ ] Test homepage on mobile view
- [ ] Verify everything is readable and functional

### Step 8: Test Security
#### Unauthenticated Access
- [ ] Log out of your account
- [ ] Try to access `/admin`
- [ ] Should redirect to `/auth/login`
- [ ] Try to access `/admin/popular-services`
- [ ] Should redirect to `/auth/login`

#### Public Access
- [ ] While logged out, visit homepage
- [ ] Should still see active popular services
- [ ] Should NOT see inactive services

## 🐛 Troubleshooting

### Issue: SQL migration fails
**Error:** "relation already exists"
**Solution:** Table already exists. Check data with `SELECT * FROM popular_services;`

**Error:** "function update_updated_at_column does not exist"
**Solution:** Run the full `supabase/schema.sql` file

### Issue: Can't access admin panel
**Error:** Redirects to login
**Solution:** Make sure you're logged in. Check auth state in DevTools console.

**Error:** 404 Not Found
**Solution:** Make sure the files are in the correct location. Check `app/admin/` directory.

### Issue: Services not showing on homepage
**Symptom:** No tags appear under "Popular:"
**Checks:**
1. [ ] Are services marked as "Active" in admin?
2. [ ] Open DevTools console - any errors?
3. [ ] Check Network tab - is the API call succeeding?
4. [ ] Try hard refresh (Ctrl+Shift+R)

**Symptom:** Shows wrong services
**Solution:** Check `display_order` and `is_active` in database

### Issue: Can't add/edit/delete services
**Error:** "Unauthorized"
**Solution:** Check that you're logged in. Verify auth token in DevTools.

**Error:** Database error
**Solution:** Check Supabase logs. Verify RLS policies are correct.

### Issue: Drag & drop not working
**Solution:** 
1. Make sure you're clicking the grip handle (≡)
2. Check browser console for JavaScript errors
3. Try in a different browser

## 🎉 Success Criteria

You've successfully completed setup when:

- [x] Database table exists with default data
- [x] Admin panel is accessible when logged in
- [x] Can perform all CRUD operations
- [x] Homepage shows active services dynamically
- [x] Changes in admin panel reflect on homepage
- [x] Unauthenticated users can't access admin
- [x] Mobile view works correctly
- [x] No console errors

## 📚 Next Steps

After successful setup:

1. **Customize Services**
   - Replace default services with your actual offerings
   - Adjust order to feature most popular services first

2. **Train Your Team**
   - Show staff how to use the admin panel
   - Create internal documentation if needed

3. **Monitor Usage**
   - Track which services get clicked most
   - Adjust order based on popularity

4. **Consider Enhancements**
   - Add service icons
   - Implement analytics
   - Create seasonal variations

## 🆘 Need Help?

**Documentation:**
- Full guide: `POPULAR_SERVICES_README.md`
- Quick start: `QUICK_START_POPULAR_SERVICES.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

**Key Files:**
- Server actions: `app/actions/popular-services.ts`
- Admin UI: `app/admin/popular-services/page.tsx`
- Database: `supabase/migrations/001_popular_services.sql`

**Support:**
- Check Supabase logs for database issues
- Check browser console for frontend issues
- Review RLS policies if having permission issues






















