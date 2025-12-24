import { ServiceType, FrequencyType, BookingFormData, PriceBreakdown } from "./types/booking";

// ============================================================================
// PRICING CONFIGURATION TYPE
// ============================================================================

export interface PricingConfig {
  basePrices: Record<ServiceType, number>;
  roomPricing: Record<ServiceType, { bedroom: number; bathroom: number }>;
  extrasPricing: Record<string, number>;
  serviceFeePercentage: number;
  frequencyDiscounts: Record<FrequencyType, number>;
  // Carpet cleaning specific pricing
  carpetCleaningPricing?: {
    pricePerFittedRoom: number;
    pricePerLooseCarpet: number;
    furnitureFee: number;
  };
}

// ============================================================================
// FALLBACK PRICING (for backward compatibility or if DB fails)
// ============================================================================

export const FALLBACK_PRICING_CONFIG: PricingConfig = {
  basePrices: {
    standard: 250,
    deep: 400,
    "move-in-out": 500,
    airbnb: 350,
    office: 300,
    holiday: 450,
    "carpet-cleaning": 350,
  },
  roomPricing: {
    standard: { bedroom: 20, bathroom: 30 },
    deep: { bedroom: 180, bathroom: 250 },
    "move-in-out": { bedroom: 160, bathroom: 220 },
    airbnb: { bedroom: 18, bathroom: 26 },
    office: { bedroom: 30, bathroom: 40 },
    holiday: { bedroom: 30, bathroom: 40 },
    "carpet-cleaning": { bedroom: 0, bathroom: 0 },
  },
  extrasPricing: {
    "inside-fridge": 50,
    "inside-oven": 50,
    "inside-cabinets": 75,
    "interior-windows": 100,
    "interior-walls": 100,
    "ironing": 75,
    "laundry": 150,
  },
  serviceFeePercentage: 0.1, // 10%
  frequencyDiscounts: {
    "one-time": 0,
    weekly: 0.15, // 15%
    "bi-weekly": 0.1, // 10%
    monthly: 0.05, // 5%
  },
  carpetCleaningPricing: {
    pricePerFittedRoom: 180,
    pricePerLooseCarpet: 150,
    furnitureFee: 200,
  },
};

// ============================================================================
// FETCH PRICING CONFIGURATION FROM DATABASE
// ============================================================================
// NOTE: fetchPricingConfig() has been moved to lib/pricing-server.ts
// to avoid importing server-side code in client components.
// Import it from '@/lib/pricing-server' in Server Components, Server Actions, and Route Handlers.

// ============================================================================
// PRICE CALCULATION
// ============================================================================

/**
 * Calculate the price breakdown for a booking
 * @param data - Booking form data
 * @param config - Optional pricing configuration (fetched from DB). If not provided, uses fallback.
 * @param discountCodeAmount - Optional discount amount from discount code (default: 0)
 */
export function calculatePrice(
  data: Partial<BookingFormData>, 
  config: PricingConfig = FALLBACK_PRICING_CONFIG,
  discountCodeAmount: number = 0
): PriceBreakdown {
  const service = data.service || "standard";
  const bedrooms = data.bedrooms || 0;
  const bathrooms = data.bathrooms || 1;
  const extras = data.extras || [];
  const frequency = data.frequency || "one-time";

  // Base price (from config)
  const basePrice = config.basePrices[service] || 0;

  let roomPrice = 0;
  let extrasPrice = 0;
  let furnitureFee = 0;

  // Special handling for carpet cleaning service
  if (service === "carpet-cleaning") {
    const carpetPricing = config.carpetCleaningPricing || FALLBACK_PRICING_CONFIG.carpetCleaningPricing!;
    const fittedRoomsCount = data.fittedRoomsCount || 0;
    const looseCarpetsCount = data.looseCarpetsCount || 0;
    
    // Calculate fitted rooms price (stored in roomPrice)
    roomPrice = fittedRoomsCount * carpetPricing.pricePerFittedRoom;
    
    // Calculate loose carpets price (stored in extrasPrice)
    extrasPrice = looseCarpetsCount * carpetPricing.pricePerLooseCarpet;
    
    // Calculate furniture fee if rooms have furniture
    if (data.roomsFurnitureStatus === 'furnished') {
      furnitureFee = carpetPricing.furnitureFee;
    }
  } else {
    // Standard room pricing for other services
    const roomPricing = config.roomPricing || FALLBACK_PRICING_CONFIG.roomPricing;
    const servicePricing = roomPricing[service] || { bedroom: 30, bathroom: 40 };
    
    // Special handling for office service: map office size to bedroom count
    let effectiveBedrooms = bedrooms;
    if (service === "office" && data.officeSize && ['small', 'medium', 'large'].includes(data.officeSize)) {
      const officeSizeMapping: Record<'small' | 'medium' | 'large', number> = {
        small: 2,
        medium: 5,
        large: 8,
      };
      effectiveBedrooms = officeSizeMapping[data.officeSize as 'small' | 'medium' | 'large'];
    }
    
    roomPrice = effectiveBedrooms * servicePricing.bedroom + bathrooms * servicePricing.bathroom;

    // Extras pricing (from config)
    extrasPrice = extras.reduce((total, extra) => {
      return total + (config.extrasPricing[extra] || 0);
    }, 0);
  }

  // Subtotal before discounts
  const subtotal = basePrice + roomPrice + extrasPrice + furnitureFee;

  // Frequency discount (from config)
  const frequencyDiscountRate = config.frequencyDiscounts[frequency] || 0;
  const frequencyDiscount = subtotal * frequencyDiscountRate;

  // Discount code discount (from parameter)
  const discountCodeDiscount = Math.max(0, Math.min(discountCodeAmount, subtotal - frequencyDiscount));

  // Subtotal after discounts
  const discountedSubtotal = subtotal - frequencyDiscount - discountCodeDiscount;

  // Service fee (calculated on discounted subtotal, from config)
  const serviceFee = Math.round(discountedSubtotal * config.serviceFeePercentage);

  // Tip (optional, from form data)
  const tip = data.tip || 0;

  // Total (includes tip)
  const total = discountedSubtotal + serviceFee + tip;

  return {
    basePrice,
    roomPrice,
    extrasPrice,
    furnitureFee: furnitureFee > 0 ? furnitureFee : undefined,
    subtotal,
    frequencyDiscount: Math.round(frequencyDiscount),
    discountCodeDiscount: Math.round(discountCodeDiscount),
    serviceFee,
    tip: Math.round(tip),
    total,
  };
}

/**
 * Format price as currency (ZAR)
 * Uses deterministic formatting to avoid hydration mismatches
 */
export function formatPrice(amount: number): string {
  // Use deterministic formatting to ensure server and client match
  // Format: R 250.00 (period as decimal separator, consistent across environments)
  const formatted = amount.toFixed(2);
  return `R ${formatted}`;
}

/**
 * Get service name from type
 */
export function getServiceName(service: ServiceType): string {
  const names: Record<ServiceType, string> = {
    standard: "Standard Cleaning",
    deep: "Deep Cleaning",
    "move-in-out": "Move In / Out",
    airbnb: "Airbnb Cleaning",
    office: "Office Cleaning",
    holiday: "Holiday Cleaning",
    "carpet-cleaning": "Carpet Cleaning",
  };
  return names[service];
}

/**
 * Get frequency display name
 */
export function getFrequencyName(frequency: FrequencyType): string {
  const names: Record<FrequencyType, string> = {
    "one-time": "One-Time",
    weekly: "Weekly",
    "bi-weekly": "Bi-Weekly",
    monthly: "Monthly",
  };
  return names[frequency];
}

/**
 * Get frequency description
 */
export function getFrequencyDescription(frequency: FrequencyType): string {
  const descriptions: Record<FrequencyType, string> = {
    "one-time": "Single session",
    weekly: "Every week",
    "bi-weekly": "Every 2 weeks",
    monthly: "Once a month",
  };
  return descriptions[frequency];
}

/**
 * Get cleaner name
 */
export function getCleanerName(preference: string): string {
  const names: Record<string, string> = {
    "no-preference": "Best available",
    "natasha-m": "Natasha M.",
    "estery-p": "Estery P.",
    beaul: "Beaul",
  };
  return names[preference] || preference;
}

// ============================================================================
// CLEANER EARNINGS CALCULATION
// ============================================================================

export interface CleanerEarningsResult {
  earningsBase: number;
  earningsPercentage: number;
  earnings: number;
  tip: number;
  totalEarnings: number;
  isOldCleaner: boolean;
}

/**
 * Calculate cleaner earnings based on price breakdown and cleaner status
 * 
 * Earnings formula:
 * - Earnings Base = Subtotal - Frequency Discount - Service Fee
 * - Old Cleaner (70%): Earnings Base × 0.70
 * - New Cleaner (60%): Earnings Base × 0.60
 * - Total Earnings = Earnings + Tip (tips go 100% to cleaner)
 * 
 * Note: Discount codes do NOT affect cleaner earnings (only frequency discounts do)
 * 
 * @param priceBreakdown - Complete price breakdown from calculatePrice()
 * @param cleanerTotalJobs - Total number of completed jobs for the cleaner
 * @param oldCleanerThreshold - Minimum jobs to be considered "old" cleaner (default: 50)
 * @returns Cleaner earnings calculation result
 */
export function calculateCleanerEarnings(
  priceBreakdown: PriceBreakdown,
  cleanerTotalJobs: number,
  oldCleanerThreshold: number = 50
): CleanerEarningsResult {
  // Earnings base excludes discount codes but includes frequency discounts
  // Formula: subtotal - frequencyDiscount - serviceFee
  const earningsBase = priceBreakdown.subtotal - priceBreakdown.frequencyDiscount - priceBreakdown.serviceFee;
  
  // Ensure earnings base is not negative
  const safeEarningsBase = Math.max(0, earningsBase);
  
  // Determine if cleaner is old or new based on job count
  const isOldCleaner = cleanerTotalJobs >= oldCleanerThreshold;
  const earningsPercentage = isOldCleaner ? 0.70 : 0.60;
  
  // Calculate earnings (before tip)
  const earnings = Math.round(safeEarningsBase * earningsPercentage * 100) / 100;
  
  // Tips go 100% to cleaner
  const tip = priceBreakdown.tip || 0;
  
  // Total earnings = earnings + tip
  const totalEarnings = earnings + tip;
  
  return {
    earningsBase: Math.round(safeEarningsBase * 100) / 100,
    earningsPercentage,
    earnings: Math.round(earnings * 100) / 100,
    tip: Math.round(tip * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    isOldCleaner,
  };
}
