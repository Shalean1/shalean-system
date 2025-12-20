/**
 * Booking Dynamic Data Functions
 * Fetches dynamic booking configuration from Supabase
 */

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ServiceLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  display_order: number;
  is_active: boolean;
}

export interface AdditionalService {
  id: string;
  service_id: string;
  name: string;
  description?: string;
  icon_name?: string;
  price_modifier: number;
  display_order: number;
  is_active: boolean;
}

export interface TimeSlot {
  id: string;
  time_value: string;
  display_label: string;
  display_order: number;
  is_active: boolean;
}

export interface Cleaner {
  id: string;
  cleaner_id: string;
  name: string;
  bio?: string;
  rating?: number;
  total_jobs: number;
  avatar_url?: string;
  display_order: number;
  is_active: boolean;
  is_available: boolean;
  availability_days?: string[]; // Array of day names: ['monday', 'tuesday', etc.]
}

export interface FrequencyOption {
  id: string;
  frequency_id: string;
  name: string;
  description?: string;
  discount_percentage: number;
  display_label?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceTypePricing {
  id: string;
  service_type: string;
  service_name: string;
  base_price: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  is_public: boolean;
}

export interface RoomPricing {
  id: string;
  service_type: string;
  room_type: 'bedroom' | 'bathroom';
  price_per_room: number;
  is_active: boolean;
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch all active service locations
 */
export async function getServiceLocations(): Promise<ServiceLocation[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('service_locations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching service locations:', error);
    return [];
  }
}

/**
 * Fetch all active additional services/extras
 */
export async function getAdditionalServices(): Promise<AdditionalService[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('additional_services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching additional services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching additional services:', error);
    return [];
  }
}

/**
 * Fetch all active time slots
 */
export async function getTimeSlots(): Promise<TimeSlot[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }
}

/**
 * Fetch all active and available cleaners
 */
export async function getCleaners(): Promise<Cleaner[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cleaners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching cleaners:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching cleaners:', error);
    return [];
  }
}

/**
 * Check cleaner availability for a specific date and time slot
 * Returns the number of available cleaners for that slot
 */
export interface TimeSlotAvailability {
  timeSlot: string;
  availableCleaners: number;
  isAvailable: boolean;
}

export async function checkTimeSlotAvailability(
  date: string,
  timeSlot: string
): Promise<number> {
  try {
    const supabase = createClient();
    
    // Get all active cleaners
    const { data: cleaners, error: cleanersError } = await supabase
      .from('cleaners')
      .select('cleaner_id')
      .eq('is_active', true)
      .eq('is_available', true);

    if (cleanersError) {
      console.error('Error fetching cleaners:', cleanersError);
      return 0;
    }

    if (!cleaners || cleaners.length === 0) {
      return 0;
    }

    const cleanerIds = cleaners.map(c => c.cleaner_id);

    // Check which cleaners are already booked for this date/time
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('assigned_cleaner_id')
      .eq('scheduled_date', date)
      .eq('scheduled_time', timeSlot)
      .in('status', ['pending', 'confirmed'])
      .in('assigned_cleaner_id', cleanerIds);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return cleaners.length; // Assume all are available if we can't check
    }

    const bookedCleanerIds = new Set(
      (bookings || [])
        .map(b => b.assigned_cleaner_id)
        .filter(id => id !== null)
    );

    // Return count of available cleaners (total - booked)
    return cleaners.length - bookedCleanerIds.size;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return 0;
  }
}

/**
 * Check availability for all time slots on a specific date
 * Returns availability information for each time slot
 */
export async function checkDateAvailability(
  date: string,
  timeSlots: string[]
): Promise<TimeSlotAvailability[]> {
  try {
    const supabase = createClient();
    
    // Get all active cleaners
    const { data: cleaners, error: cleanersError } = await supabase
      .from('cleaners')
      .select('cleaner_id')
      .eq('is_active', true)
      .eq('is_available', true);

    if (cleanersError) {
      console.error('Error fetching cleaners:', cleanersError);
      return timeSlots.map(slot => ({
        timeSlot: slot,
        availableCleaners: 0,
        isAvailable: false,
      }));
    }

    if (!cleaners || cleaners.length === 0) {
      return timeSlots.map(slot => ({
        timeSlot: slot,
        availableCleaners: 0,
        isAvailable: false,
      }));
    }

    const cleanerIds = cleaners.map(c => c.cleaner_id);
    const totalCleaners = cleaners.length;

    // Get all bookings for this date with pending/confirmed status
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('scheduled_time, assigned_cleaner_id')
      .eq('scheduled_date', date)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      // Assume all slots are available if we can't check
      return timeSlots.map(slot => ({
        timeSlot: slot,
        availableCleaners: totalCleaners,
        isAvailable: totalCleaners > 0,
      }));
    }

    // Group bookings by time slot
    const bookingsByTimeSlot = new Map<string, Set<string>>();
    (bookings || []).forEach(booking => {
      if (booking.assigned_cleaner_id && booking.scheduled_time) {
        if (!bookingsByTimeSlot.has(booking.scheduled_time)) {
          bookingsByTimeSlot.set(booking.scheduled_time, new Set());
        }
        bookingsByTimeSlot.get(booking.scheduled_time)!.add(booking.assigned_cleaner_id);
      }
    });

    // Calculate availability for each time slot
    return timeSlots.map(slot => {
      const bookedCleaners = bookingsByTimeSlot.get(slot)?.size || 0;
      const availableCleaners = totalCleaners - bookedCleaners;
      
      return {
        timeSlot: slot,
        availableCleaners,
        isAvailable: availableCleaners > 0,
      };
    });
  } catch (error) {
    console.error('Error checking date availability:', error);
    return timeSlots.map(slot => ({
      timeSlot: slot,
      availableCleaners: 0,
      isAvailable: false,
    }));
  }
}

/**
 * Fetch all active frequency options
 */
export async function getFrequencyOptions(): Promise<FrequencyOption[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('frequency_options')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching frequency options:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching frequency options:', error);
    return [];
  }
}

/**
 * Fetch all active service type pricing
 */
export async function getServiceTypePricing(): Promise<ServiceTypePricing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('service_type_pricing')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service type pricing:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching service type pricing:', error);
    return [];
  }
}

/**
 * Fetch a specific service type pricing by service type
 */
export async function getServiceTypePricingByType(serviceType: string): Promise<ServiceTypePricing | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('service_type_pricing')
      .select('*')
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching service type pricing for ${serviceType}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching service type pricing for ${serviceType}:`, error);
    return null;
  }
}

/**
 * Fetch a specific system setting by key
 */
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error(`Error fetching system setting ${key}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error);
    return null;
  }
}

/**
 * Fetch multiple system settings
 */
export async function getSystemSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', keys)
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching system settings:', error);
      return {};
    }

    const settings: Record<string, string> = {};
    data?.forEach((setting) => {
      settings[setting.setting_key] = setting.setting_value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return {};
  }
}

/**
 * Fetch all public system settings
 */
export async function getAllSystemSettings(): Promise<SystemSetting[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching all system settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all system settings:', error);
    return [];
  }
}

/**
 * Fetch all active room pricing
 */
export async function getRoomPricing(): Promise<RoomPricing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('room_pricing')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching room pricing:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching room pricing:', error);
    return [];
  }
}

/**
 * Fetch room pricing for a specific service type
 */
export async function getRoomPricingByServiceType(serviceType: string): Promise<{ bedroom: number; bathroom: number }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('room_pricing')
      .select('*')
      .eq('service_type', serviceType)
      .eq('is_active', true);

    if (error) {
      console.error(`Error fetching room pricing for ${serviceType}:`, error);
      return { bedroom: 30, bathroom: 40 }; // Fallback
    }

    const pricing = { bedroom: 30, bathroom: 40 }; // Defaults
    data?.forEach((row) => {
      if (row.room_type === 'bedroom') {
        pricing.bedroom = Number(row.price_per_room);
      } else if (row.room_type === 'bathroom') {
        pricing.bathroom = Number(row.price_per_room);
      }
    });

    return pricing;
  } catch (error) {
    console.error(`Error fetching room pricing for ${serviceType}:`, error);
    return { bedroom: 30, bathroom: 40 }; // Fallback
  }
}

// ============================================================================
// FALLBACK DATA (for backward compatibility)
// ============================================================================

export const FALLBACK_LOCATIONS = [
  "Sea Point", "Camps Bay", "Claremont", "Green Point", "V&A Waterfront",
  "Constantia", "Newlands", "Rondebosch", "Observatory", "Woodstock",
  "City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht", "Vredehoek",
  "Devils Peak", "Mouille Point", "Three Anchor Bay", "Bantry Bay", "Fresnaye",
  "Bakoven", "Llandudno", "Hout Bay", "Wynberg", "Kenilworth",
  "Plumstead", "Diep River", "Bergvliet", "Tokai", "Steenberg",
  "Muizenberg", "Kalk Bay", "Fish Hoek", "Simons Town"
];

export const FALLBACK_EXTRAS = [
  { id: "inside-fridge", name: "Inside Fridge", icon: "Refrigerator" },
  { id: "inside-oven", name: "Inside Oven", icon: "ChefHat" },
  { id: "inside-cabinets", name: "Inside Cabinets", icon: "Boxes" },
  { id: "interior-windows", name: "Interior Windows", icon: "Grid" },
  { id: "interior-walls", name: "Interior Walls", icon: "Paintbrush" },
  { id: "laundry", name: "Laundry & Ironing", icon: "Shirt" },
];

export const FALLBACK_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export const FALLBACK_CLEANERS = [
  { id: "no-preference", name: "No preference", rating: undefined },
  { id: "natasha-m", name: "Natasha M.", rating: 4.7 },
  { id: "estery-p", name: "Estery P.", rating: 4.6 },
  { id: "beaul", name: "Beaul", rating: 3.1 },
];

export const FALLBACK_FREQUENCIES = [
  { id: "one-time", name: "One-time", discount: "" },
  { id: "weekly", name: "Weekly", discount: "Save 15%" },
  { id: "bi-weekly", name: "Bi-weekly", discount: "Save 10%" },
  { id: "monthly", name: "Monthly", discount: "Save 5%" },
];

export const FALLBACK_SERVICE_PRICING = {
  standard: 250,
  deep: 400,
  "move-in-out": 500,
  airbnb: 350,
  office: 300,
  holiday: 450,
};

export const FALLBACK_ROOM_PRICING: Record<string, { bedroom: number; bathroom: number }> = {
  standard: { bedroom: 20, bathroom: 30 },
  deep: { bedroom: 180, bathroom: 250 },
  "move-in-out": { bedroom: 160, bathroom: 220 },
  airbnb: { bedroom: 18, bathroom: 26 },
  office: { bedroom: 30, bathroom: 40 },
  holiday: { bedroom: 30, bathroom: 40 },
};

// ============================================================================
// DISCOUNT CODE FUNCTIONS
// ============================================================================

export interface DiscountCodeValidationResult {
  is_valid: boolean;
  discount_amount: number;
  discount_type: string | null;
  discount_value: number | null;
  message: string;
}

/**
 * Validate a discount code using the database function
 * This should be called from a server action or API route
 */
export async function validateDiscountCode(
  code: string,
  orderTotal: number
): Promise<DiscountCodeValidationResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('validate_discount_code', {
      p_code: code,
      p_order_total: orderTotal,
    });

    if (error) {
      console.error('Error validating discount code:', error);
      return {
        is_valid: false,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        message: 'Error validating discount code',
      };
    }

    if (!data || data.length === 0) {
      return {
        is_valid: false,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        message: 'Invalid discount code',
      };
    }

    const result = data[0];
    return {
      is_valid: result.is_valid,
      discount_amount: Number(result.discount_amount) || 0,
      discount_type: result.discount_type,
      discount_value: result.discount_value ? Number(result.discount_value) : null,
      message: result.message || '',
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return {
      is_valid: false,
      discount_amount: 0,
      discount_type: null,
      discount_value: null,
      message: 'Error validating discount code',
    };
  }
}

/**
 * Record discount code usage
 */
export async function recordDiscountCodeUsage(
  code: string,
  bookingReference: string,
  userEmail: string,
  discountAmount: number,
  orderTotal: number
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('record_discount_code_usage', {
      p_code: code,
      p_booking_reference: bookingReference,
      p_user_email: userEmail,
      p_discount_amount: discountAmount,
      p_order_total: orderTotal,
    });

    if (error) {
      console.error('Error recording discount code usage:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error recording discount code usage:', error);
    return false;
  }
}
