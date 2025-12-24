import { ServiceType, FrequencyType } from "./types/booking";
import { 
  getServiceTypePricing, 
  getAdditionalServices, 
  getFrequencyOptions, 
  getSystemSettings,
  getRoomPricing,
} from "./supabase/booking-data";
import { PricingConfig, FALLBACK_PRICING_CONFIG } from "./pricing";

/**
 * Fetch all pricing configuration from the database
 * This should be called once and cached/passed around
 * 
 * NOTE: This function uses server-side Supabase client and should only be used
 * in Server Components, Server Actions, and Route Handlers
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

