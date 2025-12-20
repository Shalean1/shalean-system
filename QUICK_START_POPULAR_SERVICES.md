# Quick Start: Dynamic Popular Services

## 🚀 Setup in 3 Steps

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/001_popular_services.sql
```

Or simply navigate to your Supabase project → SQL Editor → New Query, paste the migration, and click "Run".

### Step 2: Access Admin Panel

1. Make sure you're logged in: `/auth/login`
2. Navigate to: `/admin/popular-services`
3. You should see 4 default services already loaded

### Step 3: Test the Homepage

1. Go to the homepage: `/`
2. Look at the Hero section
3. You should see "Popular:" with the service tags below it
4. Any changes you make in the admin panel will reflect here

## ✅ Quick Test Checklist

- [ ] Database table created successfully
- [ ] Can access `/admin/popular-services` (while logged in)
- [ ] Can see 4 default services in admin panel
- [ ] Can add a new service
- [ ] Can edit a service name
- [ ] Can drag & drop to reorder
- [ ] Can toggle active/inactive
- [ ] Can delete a service
- [ ] Changes appear on homepage immediately

## 🎯 Common Actions

### Add a New Service
1. Click "Add Service"
2. Type name (slug auto-generates)
3. Click "Save"

### Change Order
1. Drag the grip icon (≡)
2. Drop in new position

### Hide a Service
1. Click the green "Active" badge
2. It turns red "Inactive"
3. Service disappears from homepage

## 📸 What You Should See

### Admin Interface
- Clean, modern interface with drag-and-drop
- Each service shows name, slug, order number, and status
- Edit, delete, and toggle buttons for each service

### Homepage Hero
- "Popular:" label followed by blue pill-shaped buttons
- Only active services are displayed
- Ordered by display_order (lowest to highest)

## 🔧 Troubleshooting

**Problem:** Can't access `/admin/popular-services`
- **Solution:** Make sure you're logged in first

**Problem:** Services not showing on homepage
- **Solution:** Check they're marked as "Active" in admin panel

**Problem:** Changes not appearing
- **Solution:** Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## 🎨 Customization Ideas

- Add icons to each service
- Change the colors of the tags
- Add analytics tracking
- Create categories or groups
- Add service descriptions

## 📚 Full Documentation

For complete details, see: `POPULAR_SERVICES_README.md`












