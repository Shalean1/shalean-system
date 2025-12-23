import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Base icon component interface
 * Custom icons should follow this pattern to be compatible with lucide-react icons
 */
export interface CustomIconComponent extends React.FC<IconProps> {}

/**
 * Example: Custom Cleaning Service Icon
 * Replace the SVG path with your custom design
 */
export const CustomCleaningIcon: CustomIconComponent = ({ 
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
      {/* Custom SVG paths - replace with your design */}
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
};

/**
 * Example: Custom Booking Icon
 */
export const CustomBookingIcon: CustomIconComponent = ({ 
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
      {/* Calendar with checkmark - customize as needed */}
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
};

/**
 * Example: Custom Service Type Icons
 */
export const CustomStandardCleaningIcon: CustomIconComponent = ({ 
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
      {/* House icon with cleaning elements */}
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <circle cx="12" cy="7" r="1" />
      <path d="M7 13h10" />
    </svg>
  );
};

export const CustomDeepCleaningIcon: CustomIconComponent = ({ 
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
      {/* Sparkle/star icon for deep cleaning */}
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
};

/**
 * Icon registry - organize all custom icons here
 */
export const CustomIcons = {
  cleaning: CustomCleaningIcon,
  booking: CustomBookingIcon,
  standardCleaning: CustomStandardCleaningIcon,
  deepCleaning: CustomDeepCleaningIcon,
};

/**
 * Helper function to create icon components from SVG paths
 * Use this to quickly convert SVG designs to React components
 */
export function createIcon(
  paths: string | string[],
  viewBox: string = "0 0 24 24"
): CustomIconComponent {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  
  return ({ size = 24, className = '', ...props }) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {pathArray.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}

