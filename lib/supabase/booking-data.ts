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
  availability_days?: string[];
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

export interface Team {
  id: string;
  team_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  cleaner_id: string;
  cleaner_name?: string;
  display_order: number;
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

/**
 * Fetch all active teams
 */
export async function getTeams(): Promise<Team[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

/**
 * Fetch all cleaners assigned to a specific team
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        team_id,
        cleaner_id,
        display_order,
        cleaners:cleaner_id (
          name
        )
      `)
      .eq('team_id', teamId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error(`Error fetching team members for ${teamId}:`, error);
      return [];
    }

    return (data || []).map((member: any) => ({
      id: member.id,
      team_id: member.team_id,
      cleaner_id: member.cleaner_id,
      cleaner_name: member.cleaners?.name,
      display_order: member.display_order,
    }));
  } catch (error) {
    console.error(`Error fetching team members for ${teamId}:`, error);
    return [];
  }
}

/**
 * Check if a team is available on a specific date
 * Returns true if team has no bookings on that date, false otherwise
 */
export async function checkTeamAvailability(teamId: string, date: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('team_id', teamId)
      .eq('scheduled_date', date)
      .in('status', ['pending', 'confirmed', 'in-progress']); // Only count active bookings

    if (error) {
      console.error(`Error checking team availability for ${teamId} on ${date}:`, error);
      // On error, assume unavailable to be safe
      return false;
    }

    // Team is available if no bookings found
    return (data || []).length === 0;
  } catch (error) {
    console.error(`Error checking team availability for ${teamId} on ${date}:`, error);
    // On error, assume unavailable to be safe
    return false;
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

export const FALLBACK_TEAMS = [
  { id: "team-a", name: "Team A" },
  { id: "team-b", name: "Team B" },
  { id: "team-c", name: "Team C" },
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
