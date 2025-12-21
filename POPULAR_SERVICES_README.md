# Popular Services Management System

This system allows administrators to dynamically manage the popular service tags displayed on the homepage hero section.

## Features

✅ **Dynamic Database-Driven Content** - Services are fetched from Supabase database
✅ **Admin Interface** - Full CRUD operations (Create, Read, Update, Delete)
✅ **Drag & Drop Reordering** - Easily reorder services with drag and drop
✅ **Active/Inactive Toggle** - Show or hide services without deleting them
✅ **Auto-Slug Generation** - Automatically generates URL-friendly slugs
✅ **Authentication Protected** - Only authenticated users can access admin panel

## Setup Instructions

### 1. Run Database Migration

You need to create the `popular_services` table in your Supabase database. You have two options:

#### Option A: Run the SQL directly in Supabase
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/001_popular_services.sql`
4. Paste and execute the SQL

#### Option B: Use the schema.sql file
The `popular_services` table definition has already been added to `supabase/schema.sql`. If you're setting up a fresh database, simply run the entire schema file.

### 2. Verify the Table

After running the migration, verify that:
- The `popular_services` table exists
- Default services are inserted (Holiday Cleaning, Office Cleaning, etc.)
- Row Level Security is enabled

### 3. Access the Admin Panel

1. Make sure you're logged in to your application
2. Navigate to `/admin` to see the admin dashboard
3. Click on "Popular Services" or go directly to `/admin/popular-services`

## File Structure

```
app/
├── actions/
│   └── popular-services.ts       # Server actions for CRUD operations
├── admin/
│   ├── layout.tsx                # Admin layout with authentication
│   ├── page.tsx                  # Admin dashboard
│   └── popular-services/
│       └── page.tsx              # Popular services management page
components/
└── Hero.tsx                      # Updated to fetch from database

supabase/
├── schema.sql                    # Updated with popular_services table
└── migrations/
    └── 001_popular_services.sql  # Standalone migration file
```

## Admin Interface Guide

### Adding a New Service

1. Click the "Add Service" button
2. Enter the service name (e.g., "Spring Cleaning")
3. The slug is auto-generated but can be edited
4. Click "Save"

### Editing a Service

1. Click the edit icon (pencil) next to any service
2. Modify the name or slug
3. Click the save icon (checkmark) or cancel (X)

### Reordering Services

1. Click and drag the grip handle (≡) on the left of any service
2. Drop it in the desired position
3. The order is automatically saved

### Activating/Deactivating Services

1. Click the "Active" or "Inactive" badge
2. The service visibility toggles immediately
3. Inactive services won't appear on the homepage

### Deleting a Service

1. Click the delete icon (trash) next to any service
2. Confirm the deletion in the popup
3. The service is permanently removed

## API Functions

All functions are located in `app/actions/popular-services.ts`:

### Public Functions
- `getPopularServices()` - Get all active services (used on homepage)

### Admin Functions (requires authentication)
- `getAllPopularServices()` - Get all services including inactive
- `addPopularService(name, slug)` - Add a new service
- `updatePopularService(id, updates)` - Update a service
- `deletePopularService(id)` - Delete a service
- `reorderPopularServices(services)` - Reorder services

## Security

- **Row Level Security (RLS)** is enabled on the `popular_services` table
- Public users can only view active services
- Only authenticated users can manage services
- The admin routes are protected by authentication in the layout

## Customization

### Changing the Hero Display

The services are displayed in the Hero component at `components/Hero.tsx`. To customize:

```tsx
{popularCategories.map((category) => (
  <Link
    key={category.id}
    href={`#services?category=${encodeURIComponent(category.slug)}`}
    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium transition-colors"
  >
    {category.name}
  </Link>
))}
```

### Adding More Fields

To add more fields to services (e.g., icon, color):

1. Update the database schema in `popular_services` table
2. Update the TypeScript interface in `app/actions/popular-services.ts`
3. Update the admin form in `app/admin/popular-services/page.tsx`
4. Update the display in `components/Hero.tsx`

## Troubleshooting

### Services Not Showing on Homepage

- Check that services are marked as "Active" in the admin panel
- Verify the database table exists and has data
- Check browser console for any JavaScript errors
- Try refreshing the page (cache may need to clear)

### Can't Access Admin Panel

- Make sure you're logged in
- Check that your Supabase authentication is configured correctly
- Verify the middleware is properly set up

### Database Connection Issues

- Verify your Supabase credentials in `.env.local`
- Check that the table exists in your Supabase project
- Ensure RLS policies are properly configured

## Next Steps

Consider adding:
- [ ] Icons for each service
- [ ] Custom colors for service badges
- [ ] Analytics tracking for service clicks
- [ ] A/B testing for different service combinations
- [ ] Scheduling (show different services at different times)

## Support

For issues or questions, refer to:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs














