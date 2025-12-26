# Custom Icons Guide

This directory contains custom icon components for the Bokkie booking system.

## Overview

Custom icons can be used alongside or instead of `lucide-react` icons. They follow the same interface pattern, making them drop-in replacements.

## Creating Custom Icons

### Method 1: Using the Base Component

Create a new icon component following this pattern:

```tsx
import { CustomIconComponent } from './CustomIcon';

export const MyCustomIcon: CustomIconComponent = ({ 
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Your SVG paths here */}
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  );
};
```

### Method 2: Using the createIcon Helper

For simple icons, use the helper function:

```tsx
import { createIcon } from './CustomIcon';

export const SimpleIcon = createIcon(
  "M12 2L2 7l10 5 10-5-10-5z",
  "0 0 24 24"
);
```

### Method 3: Converting SVG Files

1. Design your icon in Figma, Illustrator, or any SVG editor
2. Export as SVG
3. Extract the `<path>` elements
4. Create a component using Method 1 or 2

## Design Guidelines

### Size & ViewBox
- Standard viewBox: `0 0 24 24` (matches lucide-react)
- Icons should be centered in the viewBox
- Use `size` prop for scaling (default: 24)

### Styling
- Use `stroke="currentColor"` for outline icons
- Use `fill="currentColor"` for filled icons
- Icons inherit text color via `className`
- Stroke width: 2px (standard)

### Consistency
- Match the visual style of existing icons
- Keep line weights consistent
- Use rounded corners (`strokeLinecap="round"`)
- Maintain visual balance

## Using Custom Icons

### Replace Lucide Icons

```tsx
// Before
import { Home } from "lucide-react";

// After
import { CustomStandardCleaningIcon as Home } from "@/components/icons/CustomIcon";
```

### Mix Custom and Lucide Icons

```tsx
import { Calendar, User } from "lucide-react";
import { CustomCleaningIcon } from "@/components/icons/CustomIcon";

const icons = {
  calendar: Calendar,
  user: User,
  cleaning: CustomCleaningIcon,
};
```

### In Service Cards

```tsx
import { CustomStandardCleaningIcon } from "@/components/icons/CustomIcon";

const serviceIcons: Record<ServiceType, typeof CustomStandardCleaningIcon> = {
  standard: CustomStandardCleaningIcon,
  // ... other services
};
```

## Icon Design Tools

### Recommended Tools:
- **Figma**: Free, web-based, great for icon design
- **Adobe Illustrator**: Professional vector graphics
- **Inkscape**: Free, open-source alternative
- **IconJar**: Icon management and organization

### Online Resources:
- **Heroicons**: Great reference for icon styles
- **Lucide Icons**: Current icon library (good reference)
- **Feather Icons**: Similar style reference

## Best Practices

1. **Naming**: Use descriptive names (e.g., `CustomStandardCleaningIcon` not `Icon1`)
2. **Export**: Export all icons from `index.ts` for easy imports
3. **Documentation**: Add comments explaining what each icon represents
4. **Testing**: Test icons at different sizes (16px, 24px, 32px, 48px)
5. **Accessibility**: Ensure icons have proper `aria-label` when used without text

## File Structure

```
components/icons/
├── CustomIcon.tsx          # Base components and helpers
├── ServiceIcons.tsx        # Service-specific icons
├── BookingIcons.tsx        # Booking-related icons
├── DashboardIcons.tsx       # Dashboard icons
└── index.ts                # Export all icons
```

## Examples

See `CustomIcon.tsx` for example implementations.

