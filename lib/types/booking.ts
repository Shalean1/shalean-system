export type ServiceType = "standard" | "deep" | "move-in-out" | "airbnb" | "office" | "holiday" | "carpet-cleaning";

export type FrequencyType = "one-time" | "weekly" | "bi-weekly" | "monthly";

export type CleanerPreference = "no-preference" | "natasha-m" | "estery-p" | "beaul" | "team-a" | "team-b" | "team-c";

/**
 * Valid cleaner preference values
 */
const VALID_CLEANER_PREFERENCES: CleanerPreference[] = [
  "no-preference",
  "natasha-m",
  "estery-p",
  "beaul",
  "team-a",
  "team-b",
  "team-c",
];

/**
 * Normalize and validate cleaner preference value
 * Ensures the value is always one of the valid options
 */
export function normalizeCleanerPreference(
  value: any
): CleanerPreference {
  // Handle null, undefined, or empty string
  if (!value || typeof value !== "string") {
    return "no-preference";
  }

  // Trim whitespace
  const trimmed = value.trim().toLowerCase();

  // Check if it's a valid preference
  if (VALID_CLEANER_PREFERENCES.includes(trimmed as CleanerPreference)) {
    return trimmed as CleanerPreference;
  }

  // Default to no-preference for any invalid value
  return "no-preference";
}

export interface BookingFormData {
  // Step 1: Service & Details
  service: ServiceType;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  scheduledDate: string | null;
  scheduledTime: string | null;
  specialInstructions?: string;
  // Carpet cleaning specific fields
  fittedRoomsCount?: number;
  looseCarpetsCount?: number;
  roomsFurnitureStatus?: 'furnished' | 'empty';

  // Step 2: Schedule & Cleaner
  streetAddress: string;
  aptUnit?: string;
  suburb: string;
  city: string;
  cleanerPreference: CleanerPreference;
  frequency: FrequencyType;

  // Step 3: Contact & Review
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  discountCode?: string;
  tip?: number;
}

export type JobProgress = "on-my-way" | "arrived" | "started" | null;

export interface Booking extends BookingFormData {
  id: string;
  bookingReference: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentReference?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  cleanerResponse?: "accepted" | "declined" | null;
  jobProgress?: JobProgress;
  // Price breakdown fields (for cleaner earnings calculation)
  subtotal?: number;
  frequencyDiscount?: number;
  discountCodeDiscount?: number;
  serviceFee?: number;
  // Cleaner earnings fields
  cleanerEarnings?: number;
  cleanerEarningsPercentage?: number;
  // Recurring booking fields
  recurringGroupId?: string;
  recurringSequence?: number;
  parentBookingId?: string;
  isRecurring?: boolean;
  // Team booking fields
  teamId?: string;
  assignedCleanerIds?: string[];
}

export interface PriceBreakdown {
  basePrice: number;
  roomPrice: number;
  extrasPrice: number;
  furnitureFee?: number; // For carpet cleaning service when rooms have furniture
  subtotal: number;
  frequencyDiscount: number;
  discountCodeDiscount: number;
  serviceFee: number;
  tip: number;
  total: number;
}
