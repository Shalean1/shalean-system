import { ServiceType, FrequencyType, BookingFormData, PriceBreakdown } from "./types/booking";

// Base prices for each service type (in ZAR)
const BASE_PRICES: Record<ServiceType, number> = {
  standard: 250,
  deep: 400,
  "move-in-out": 500,
  airbnb: 350,
};

// Price per bedroom (in ZAR)
const PRICE_PER_BEDROOM = 30;

// Price per bathroom (in ZAR)
const PRICE_PER_BATHROOM = 40;

// Additional services pricing (in ZAR)
const EXTRAS_PRICING: Record<string, number> = {
  "inside-fridge": 50,
  "inside-oven": 50,
  "inside-cabinets": 40,
  "interior-windows": 60,
  "interior-walls": 80,
  "laundry": 70,
  "ironing": 50,
};

// Service fee percentage
const SERVICE_FEE_PERCENTAGE = 0.1; // 10%

// Frequency discounts
const FREQUENCY_DISCOUNTS: Record<FrequencyType, number> = {
  "one-time": 0,
  weekly: 0.15, // 15%
  "bi-weekly": 0.1, // 10%
  monthly: 0.05, // 5%
};

/**
 * Calculate the price breakdown for a booking
 */
export function calculatePrice(data: Partial<BookingFormData>): PriceBreakdown {
  const service = data.service || "standard";
  const bedrooms = data.bedrooms || 0;
  const bathrooms = data.bathrooms || 1;
  const extras = data.extras || [];
  const frequency = data.frequency || "one-time";

  // Base price
  const basePrice = BASE_PRICES[service];

  // Room pricing
  const roomPrice = bedrooms * PRICE_PER_BEDROOM + bathrooms * PRICE_PER_BATHROOM;

  // Extras pricing
  const extrasPrice = extras.reduce((total, extra) => {
    return total + (EXTRAS_PRICING[extra] || 0);
  }, 0);

  // Subtotal before discounts
  const subtotal = basePrice + roomPrice + extrasPrice;

  // Frequency discount
  const frequencyDiscountRate = FREQUENCY_DISCOUNTS[frequency];
  const frequencyDiscount = subtotal * frequencyDiscountRate;

  // Discount code discount (placeholder - implement discount code logic)
  const discountCodeDiscount = 0;

  // Subtotal after discounts
  const discountedSubtotal = subtotal - frequencyDiscount - discountCodeDiscount;

  // Service fee (calculated on discounted subtotal)
  const serviceFee = Math.round(discountedSubtotal * SERVICE_FEE_PERCENTAGE);

  // Total
  const total = discountedSubtotal + serviceFee;

  return {
    basePrice,
    roomPrice,
    extrasPrice,
    subtotal,
    frequencyDiscount: Math.round(frequencyDiscount),
    discountCodeDiscount,
    serviceFee,
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
