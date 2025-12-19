/**
 * Utility functions for phone number handling
 */

/**
 * Normalize a phone number by removing all non-digit characters
 * @param phone - Phone number in any format (e.g., "+27 12 345 6789")
 * @returns Normalized phone number with only digits (e.g., "27123456789")
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Construct a cleaner email address from a phone number
 * Format: {normalized-phone}@shalean.co.za
 * @param phone - Phone number in any format
 * @returns Email address for cleaner authentication
 */
export function constructCleanerEmail(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return `${normalized}@shalean.co.za`;
}

/**
 * Check if an input string looks like a phone number (doesn't contain @)
 * @param input - Input string to check
 * @returns true if input appears to be a phone number
 */
export function isPhoneNumber(input: string): boolean {
  return !input.includes('@');
}

/**
 * Extract phone number from input that might contain email domain
 * Handles cases where user accidentally enters email format (e.g., "27792022648@shalean.co.za")
 * @param input - Input string that might be phone number or email format
 * @returns Phone number without email domain
 */
export function extractPhoneNumber(input: string): string {
  // If input contains @, extract the part before @
  if (input.includes('@')) {
    return input.split('@')[0].trim();
  }
  return input.trim();
}
