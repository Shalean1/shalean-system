# Custom Icons Guide for Shalean Booking System

## ✅ Yes, Custom Icons Are Possible!

Your booking system can absolutely use custom-designed icons. I've set up a complete custom icon system that works seamlessly with your existing `lucide-react` icons.

## What I've Created

1. **`components/icons/CustomIcon.tsx`** - Base icon components and helper functions
2. **`components/icons/index.ts`** - Central export file for easy imports
3. **`components/icons/README.md`** - Detailed documentation
4. **`components/icons/INTEGRATION_EXAMPLE.tsx`** - Practical usage examples

## Quick Start

### Option 1: Use Existing Custom Icons

```tsx
import { CustomStandardCleaningIcon } from "@/components/icons";

// Use just like lucide-react icons
<CustomStandardCleaningIcon className="w-8 h-8 text-blue-500" />
```

### Option 2: Create Your Own Custom Icon

```tsx
import { createIcon } from "@/components/icons";

// Simple icon from SVG path
export const MyCustomIcon = createIcon(
  "M12 2L2 7l10 5 10-5-10-5z"
);
```

### Option 3: Full Custom Component

```tsx
import { CustomIconComponent } from "@/components/icons";

export const MyIcon: CustomIconComponent = ({ 
  size = 24, 
  className = '',
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      {...props}
    >
      {/* Your custom SVG paths */}
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  );
};
```

## Design Workflow

### Step 1: Design Your Icon
- Use **Figma**, **Adobe Illustrator**, or **Inkscape**
- Design at 24x24px (or scale to 24x24 viewBox)
- Keep style consistent with your brand

### Step 2: Export SVG
- Export as SVG
- Copy the `<path>` elements

### Step 3: Create Component
- Use `createIcon()` helper for simple icons
- Or create full component for complex icons

### Step 4: Use in Your App
- Import and use like any lucide-react icon
- Works with all existing Tailwind classes

## Integration Examples

### Replace Icons in ServiceCard

**Current code** (`components/booking/ServiceCard.tsx`):
```tsx
import { Home, Star } from "lucide-react";
```

**With custom icons**:
```tsx
import { CustomStandardCleaningIcon, CustomDeepCleaningIcon } from "@/components/icons";
import { Package, Calendar } from "lucide-react"; // Keep some lucide icons

const serviceIcons = {
  standard: CustomStandardCleaningIcon,
  deep: CustomDeepCleaningIcon,
  "move-in-out": Package, // Mix custom and lucide
  // ...
};
```

### Mix Custom and Lucide Icons

You don't have to replace everything! Mix and match:

```tsx
import { Calendar, User } from "lucide-react";
import { CustomCleaningIcon } from "@/components/icons";

const icons = {
  calendar: Calendar,        // lucide-react
  user: User,               // lucide-react  
  cleaning: CustomCleaningIcon, // custom
};
```

## Design Guidelines

### Size & ViewBox
- ✅ Standard viewBox: `0 0 24 24` (matches lucide-react)
- ✅ Icons should be centered
- ✅ Use `size` prop for scaling

### Styling
- ✅ Use `stroke="currentColor"` for outline icons
- ✅ Use `fill="currentColor"` for filled icons
- ✅ Icons inherit text color via `className`
- ✅ Standard stroke width: 2px

### Consistency
- ✅ Match visual style of existing icons
- ✅ Keep line weights consistent
- ✅ Use rounded corners
- ✅ Maintain visual balance

## Recommended Design Tools

1. **Figma** (Free) - Best for web-based design
2. **Adobe Illustrator** - Professional vector graphics
3. **Inkscape** (Free) - Open-source alternative
4. **IconJar** - Icon management

## Icon Ideas for Your Booking System

Consider creating custom icons for:

- 🏠 **Service Types**: Standard cleaning, deep cleaning, move-in/out, etc.
- 📅 **Booking Features**: Calendar, scheduling, recurring bookings
- 💳 **Payment**: ShalCred, vouchers, payment methods
- 👥 **User Roles**: Customer, cleaner, admin
- 📍 **Location**: Service areas, addresses
- ⭐ **Features**: Ratings, reviews, referrals

## Benefits of Custom Icons

1. **Brand Consistency** - Icons match your brand identity
2. **Unique Design** - Stand out from competitors
3. **Flexibility** - Design exactly what you need
4. **Compatibility** - Works seamlessly with existing code
5. **Performance** - No external dependencies

## Next Steps

1. **Design your icons** in your preferred tool
2. **Create icon components** using the provided helpers
3. **Test at different sizes** (16px, 24px, 32px, 48px)
4. **Replace gradually** - Start with key icons, expand over time
5. **Export from index.ts** - Keep all icons organized

## Files Created

- ✅ `components/icons/CustomIcon.tsx` - Base components
- ✅ `components/icons/index.ts` - Exports
- ✅ `components/icons/README.md` - Documentation
- ✅ `components/icons/INTEGRATION_EXAMPLE.tsx` - Examples
- ✅ `CUSTOM_ICONS_GUIDE.md` - This guide

## Questions?

- See `components/icons/README.md` for detailed documentation
- Check `components/icons/INTEGRATION_EXAMPLE.tsx` for code examples
- All custom icons follow the same API as `lucide-react` icons

---

**Ready to start?** Design your first icon and use the `createIcon()` helper to add it to your system!

