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
 * Default is now 1 month (bookings auto-generated monthly)
 */
export function getRecurringBookingCount(
  frequency: FrequencyType,
  months: number = 1
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
 * Get the last day of the month for a given date
 */
function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Check if a date is within the same calendar month as the start date
 */
function isInSameMonth(date: Date, startDate: Date): boolean {
  return date.getFullYear() === startDate.getFullYear() && 
         date.getMonth() === startDate.getMonth();
}

/**
 * Calculate all recurring dates for a given frequency starting from a start date
 * Returns an array of date strings in YYYY-MM-DD format
 * Only generates dates within the calendar month containing the start date
 */
export function calculateRecurringDates(
  frequency: FrequencyType,
  startDate: string,
  months: number = 1
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

  // Get the last day of the month containing the start date
  const lastDayOfMonth = getLastDayOfMonth(start);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  switch (frequency) {
    case "weekly": {
      // Weekly: add 7 days for each occurrence until we exceed the current month
      let i = 0;
      while (true) {
        const date = new Date(start);
        date.setDate(date.getDate() + (i * 7));
        
        // Stop if we've moved to the next month
        if (!isInSameMonth(date, start)) {
          break;
        }
        
        dates.push(formatDate(date));
        i++;
        
        // Safety check to prevent infinite loops
        if (i > 10) break;
      }
      break;
    }
    case "bi-weekly": {
      // Bi-weekly: add 14 days for each occurrence until we exceed the current month
      let i = 0;
      while (true) {
        const date = new Date(start);
        date.setDate(date.getDate() + (i * 14));
        
        // Stop if we've moved to the next month
        if (!isInSameMonth(date, start)) {
          break;
        }
        
        dates.push(formatDate(date));
        i++;
        
        // Safety check to prevent infinite loops
        if (i > 10) break;
      }
      break;
    }
    case "monthly": {
      // Monthly: only the start date (already in current month)
      dates.push(formatDate(start));
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

















