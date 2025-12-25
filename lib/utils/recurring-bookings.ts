import { FrequencyType } from "@/lib/types/booking";

/**
 * Generate a unique recurring group ID for linking bookings in a series
 */
export function generateRecurringGroupId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REC-${timestamp}-${random}`;
}

/**
 * Calculate how many bookings to create for a given frequency over a period
 */
export function getRecurringBookingCount(
  frequency: FrequencyType,
  months: number = 3
): number {
  if (frequency === "one-time") {
    return 0;
  }

  const daysInPeriod = months * 30; // Approximate

  switch (frequency) {
    case "weekly":
      // Weekly: approximately 4 bookings per month
      return Math.floor((daysInPeriod / 7));
    case "bi-weekly":
      // Bi-weekly: approximately 2 bookings per month
      return Math.floor((daysInPeriod / 14));
    case "monthly":
      // Monthly: 1 booking per month
      return months;
    default:
      return 0;
  }
}

/**
 * Calculate all recurring dates for a given frequency starting from a start date
 * Returns an array of date strings in YYYY-MM-DD format
 */
export function calculateRecurringDates(
  frequency: FrequencyType,
  startDate: string,
  months: number = 3
): string[] {
  if (frequency === "one-time") {
    return [];
  }

  const dates: string[] = [];
  const start = new Date(startDate);
  
  // Validate start date
  if (isNaN(start.getTime())) {
    console.error("Invalid start date:", startDate);
    return [];
  }

  const count = getRecurringBookingCount(frequency, months);

  switch (frequency) {
    case "weekly": {
      // Weekly: add 7 days for each occurrence
      for (let i = 0; i < count; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + (i * 7));
        dates.push(formatDate(date));
      }
      break;
    }
    case "bi-weekly": {
      // Bi-weekly: add 14 days for each occurrence
      for (let i = 0; i < count; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + (i * 14));
        dates.push(formatDate(date));
      }
      break;
    }
    case "monthly": {
      // Monthly: same day of month, next month
      for (let i = 0; i < count; i++) {
        const date = new Date(start);
        date.setMonth(date.getMonth() + i);
        
        // Handle edge case: if start date is 31st and next month has fewer days
        // Adjust to last day of month
        const originalDay = start.getDate();
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        date.setDate(Math.min(originalDay, lastDayOfMonth));
        
        dates.push(formatDate(date));
      }
      break;
    }
  }

  return dates;
}

/**
 * Format a Date object to YYYY-MM-DD string format
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validate that a date string is in YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === formatDate(date);
}










