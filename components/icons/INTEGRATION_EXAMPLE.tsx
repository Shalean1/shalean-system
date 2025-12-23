/**
 * Integration Example: How to use custom icons in your booking system
 * 
 * This file shows practical examples of replacing lucide-react icons
 * with custom icons in your existing components.
 */

// ============================================
// EXAMPLE 1: Replace icons in ServiceCard.tsx
// ============================================

/*
BEFORE (using lucide-react):
---------------------------
import { Home, Star, Package, Calendar, Briefcase, Gift } from "lucide-react";

const serviceIcons: Record<ServiceType, typeof Home> = {
  standard: Home,
  deep: Star,
  "move-in-out": Package,
  airbnb: Calendar,
  office: Briefcase,
  holiday: Gift,
};

AFTER (using custom icons):
--------------------------
import { 
  CustomStandardCleaningIcon,
  CustomDeepCleaningIcon,
  CustomMoveInOutIcon,
  CustomAirbnbIcon,
  CustomOfficeIcon,
  CustomHolidayIcon
} from "@/components/icons";
import { Package, Calendar, Briefcase, Gift } from "lucide-react"; // Keep some lucide icons

const serviceIcons: Record<ServiceType, typeof CustomStandardCleaningIcon> = {
  standard: CustomStandardCleaningIcon,
  deep: CustomDeepCleaningIcon,
  "move-in-out": CustomMoveInOutIcon, // or keep Package from lucide
  airbnb: CustomAirbnbIcon, // or keep Calendar from lucide
  office: CustomOfficeIcon, // or keep Briefcase from lucide
  holiday: CustomHolidayIcon, // or keep Gift from lucide
};
*/

// ============================================
// EXAMPLE 2: Mix custom and lucide icons
// ============================================

/*
import { Calendar, User, Mail } from "lucide-react";
import { CustomCleaningIcon, CustomBookingIcon } from "@/components/icons";

// You can mix both types seamlessly
const dashboardIcons = {
  calendar: Calendar, // lucide-react
  user: User, // lucide-react
  cleaning: CustomCleaningIcon, // custom
  booking: CustomBookingIcon, // custom
};
*/

// ============================================
// EXAMPLE 3: Conditional icon selection
// ============================================

/*
import { Home } from "lucide-react";
import { CustomStandardCleaningIcon } from "@/components/icons";

// Use custom icons conditionally
const useCustomIcons = process.env.NEXT_PUBLIC_USE_CUSTOM_ICONS === 'true';

const StandardIcon = useCustomIcons 
  ? CustomStandardCleaningIcon 
  : Home;
*/

// ============================================
// EXAMPLE 4: Icon with custom styling
// ============================================

/*
import { CustomCleaningIcon } from "@/components/icons";

function MyComponent() {
  return (
    <div>
      {/* Custom icon with Tailwind classes */}
      <CustomCleaningIcon 
        className="text-blue-500 hover:text-blue-700 transition-colors"
        size={32}
      />
      
      {/* Same API as lucide-react icons */}
      <CustomCleaningIcon 
        className="w-8 h-8 text-gray-400"
      />
    </div>
  );
}
*/

// ============================================
// EXAMPLE 5: Creating icon from SVG file
// ============================================

/*
// Step 1: Get SVG path from your design tool
// Step 2: Use createIcon helper

import { createIcon } from "@/components/icons";

// Single path
export const MyIcon = createIcon(
  "M12 2L2 7l10 5 10-5-10-5z"
);

// Multiple paths
export const ComplexIcon = createIcon(
  [
    "M12 2L2 7l10 5 10-5-10-5z",
    "M2 17l10 5 10-5",
    "M2 12l10 5 10-5"
  ],
  "0 0 24 24"
);
*/

export {};

