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

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  is_public: boolean;
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
