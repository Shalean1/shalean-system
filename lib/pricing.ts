import { ServiceType, FrequencyType, BookingFormData, PriceBreakdown } from "./types/booking";
import { 
  getServiceTypePricing, 
  getAdditionalServices, 
  getFrequencyOptions, 
  getSystemSettings,
  getRoomPricing,
  FALLBACK_SERVICE_PRICING,
  FALLBACK_ROOM_PRICING
} from "./supabase/booking-data";

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

const FALLBACK_PRICING_CONFIG: PricingConfig = {
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

/**
 * Fetch all pricing configuration from the database
 * This should be called once and cached/passed around
 */
export async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    // Fetch all pricing data in parallel
    const [serviceTypePricing, additionalServices, frequencyOptions, systemSettings, roomPricingData] = await Promise.all([
      getServiceTypePricing(),
      getAdditionalServices(),
      getFrequencyOptions(),
      getSystemSettings([
        'service_fee_percentage',
        'carpet_cleaning_price_per_fitted_room',
        'carpet_cleaning_price_per_loose_carpet',
        'carpet_cleaning_furniture_fee'
      ]),
      getRoomPricing().catch(() => []), // Return empty array if it fails
    ]);

    // Build base prices from service type pricing
    const basePrices: Record<ServiceType, number> = { ...FALLBACK_PRICING_CONFIG.basePrices };
    if (serviceTypePricing && Array.isArray(serviceTypePricing)) {
      serviceTypePricing.forEach((pricing) => {
        basePrices[pricing.service_type as ServiceType] = Number(pricing.base_price);
      });
    }

    // Build room pricing from room_pricing table
    const roomPricing: Record<ServiceType, { bedroom: number; bathroom: number }> = { ...FALLBACK_PRICING_CONFIG.roomPricing };
    if (roomPricingData && Array.isArray(roomPricingData)) {
      roomPricingData.forEach((pricing) => {
        const serviceType = pricing.service_type as ServiceType;
        if (!roomPricing[serviceType]) {
          roomPricing[serviceType] = { bedroom: 30, bathroom: 40 };
        }
        if (pricing.room_type === 'bedroom') {
          roomPricing[serviceType].bedroom = Number(pricing.price_per_room);
        } else if (pricing.room_type === 'bathroom') {
          roomPricing[serviceType].bathroom = Number(pricing.price_per_room);
        }
      });
    }

    // Build extras pricing from additional services
    const extrasPricing: Record<string, number> = {};
    if (additionalServices && Array.isArray(additionalServices)) {
      additionalServices.forEach((service) => {
        extrasPricing[service.service_id] = Number(service.price_modifier);
      });
    }

    // Build frequency discounts from frequency options
    const frequencyDiscounts: Record<FrequencyType, number> = { ...FALLBACK_PRICING_CONFIG.frequencyDiscounts };
    if (frequencyOptions && Array.isArray(frequencyOptions)) {
      frequencyOptions.forEach((option) => {
        frequencyDiscounts[option.frequency_id as FrequencyType] = Number(option.discount_percentage) / 100;
      });
    }

    // Get service fee percentage
    const serviceFeePercentage = systemSettings.service_fee_percentage 
      ? Number(systemSettings.service_fee_percentage) / 100 
      : FALLBACK_PRICING_CONFIG.serviceFeePercentage;

    // Get carpet cleaning pricing
    const carpetCleaningPricing = {
      pricePerFittedRoom: systemSettings.carpet_cleaning_price_per_fitted_room
        ? Number(systemSettings.carpet_cleaning_price_per_fitted_room)
        : FALLBACK_PRICING_CONFIG.carpetCleaningPricing!.pricePerFittedRoom,
      pricePerLooseCarpet: systemSettings.carpet_cleaning_price_per_loose_carpet
        ? Number(systemSettings.carpet_cleaning_price_per_loose_carpet)
        : FALLBACK_PRICING_CONFIG.carpetCleaningPricing!.pricePerLooseCarpet,
      furnitureFee: systemSettings.carpet_cleaning_furniture_fee
        ? Number(systemSettings.carpet_cleaning_furniture_fee)
        : FALLBACK_PRICING_CONFIG.carpetCleaningPricing!.furnitureFee,
    };

    return {
      basePrices,
      roomPricing,
      extrasPricing,
      serviceFeePercentage,
      frequencyDiscounts,
      carpetCleaningPricing,
    };
  } catch (error) {
    console.error('Error fetching pricing config, using fallback:', error);
    return FALLBACK_PRICING_CONFIG;
  }
}

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
    roomPrice = bedrooms * servicePricing.bedroom + bathrooms * servicePricing.bathroom;

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
