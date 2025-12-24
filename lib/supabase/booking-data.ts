/**
 * Booking Dynamic Data Functions
 * Fetches dynamic booking configuration from Supabase
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ServiceLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  suburb?: string;
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
  working_areas?: string[];
  carpet_cleaning_skill?: boolean;
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

export interface ServiceCategoryPricing {
  id: string;
  category_id: string;
  category_name: string;
  display_price: number;
  description?: string;
  display_order: number;
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

export interface LocationContent {
  id: string;
  location_slug: string;
  intro_paragraph?: string;
  main_content?: string;
  closing_paragraph?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch all active service locations
 */
export async function getServiceLocations(): Promise<ServiceLocation[]> {
  try {
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
 * Optionally filter by selected date, suburb, and service type
 * @param selectedDate - Customer's selected booking date (e.g., "2024-12-15")
 * @param selectedSuburb - Customer's selected suburb (e.g., "Sea Point")
 * @param serviceType - Service type to filter cleaners by (e.g., "carpet-cleaning")
 */
export async function getCleaners(selectedDate?: string, selectedSuburb?: string, serviceType?: string): Promise<Cleaner[]> {
  try {
    const supabase = await createServerClient();
    const query = supabase
      .from('cleaners')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('display_order', { ascending: true });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cleaners:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Apply carpet cleaning skill filter first (before other filters)
    // This ensures cleaners without the skill are filtered out even when no date/suburb is selected
    let filteredCleaners = data;
    if (serviceType === 'carpet-cleaning') {
      console.log(`[getCleaners] Filtering cleaners for carpet cleaning service`);
      console.log(`[getCleaners] Before carpet cleaning skill filter: ${filteredCleaners.length} cleaners`);
      
      filteredCleaners = filteredCleaners.filter(cleaner => {
        // Always include "no-preference" option - it means "any available cleaner"
        if (cleaner.cleaner_id === 'no-preference') {
          console.log(`[getCleaners] ✅ Keeping ${cleaner.name} - special case: no-preference (always included)`);
          return true;
        }
        
        // Only show cleaners who have carpet cleaning skill
        const hasCarpetCleaningSkill = cleaner.carpet_cleaning_skill === true;
        
        if (!hasCarpetCleaningSkill) {
          console.log(`[getCleaners] ❌ Filtering out ${cleaner.name} - does not have carpet cleaning skill`);
          return false;
        }
        
        console.log(`[getCleaners] ✅ Keeping ${cleaner.name} - has carpet cleaning skill`);
        return true;
      });
      
      console.log(`[getCleaners] After carpet cleaning skill filter: ${filteredCleaners.length} cleaners`);
    }

    // If no other filters provided, return filtered cleaners (with carpet cleaning filter applied if applicable)
    if (!selectedDate && !selectedSuburb) {
      return filteredCleaners;
    }

    // Continue filtering cleaners based on provided criteria (date, suburb)
    // filteredCleaners already has carpet cleaning filter applied if applicable

    // Filter by availability days if date is provided
    if (selectedDate) {
      try {
        // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
        // This matches the DatePicker component's approach
        const parts = selectedDate.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          
          // Extract day name using consistent locale
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          
          console.log(`[getCleaners] Filtering cleaners for date: ${selectedDate} (${dayName})`);
          console.log(`[getCleaners] Before date filter: ${filteredCleaners.length} cleaners`);
          
          // STRICT FILTER: Only show cleaners who explicitly have the selected day in their availability_days
          filteredCleaners = filteredCleaners.filter(cleaner => {
            // Handle null, undefined, or invalid availability_days
            let availabilityDays: string[] = [];
            if (cleaner.availability_days) {
              if (Array.isArray(cleaner.availability_days)) {
                availabilityDays = cleaner.availability_days.filter(day => day != null && typeof day === 'string');
              } else {
                console.warn(`[getCleaners] ${cleaner.name} has invalid availability_days format:`, cleaner.availability_days);
                return false; // Filter out cleaners with invalid data
              }
            }
            
            // STRICT RULE: Cleaner must have at least one day marked AND Sunday must be in the list
            // If availability_days is empty/null, cleaner is NOT available
            if (availabilityDays.length === 0) {
              console.log(`[getCleaners] ❌ Filtering out ${cleaner.name} - availability_days is empty or null`);
              return false;
            }
            
            // Check if the selected day (Sunday) is in the availability_days array
            // Normalize both the day from the array and the selected day for comparison
            const normalizedSelectedDay = dayName.trim().toLowerCase();
            const hasSelectedDay = availabilityDays.some(day => {
              if (!day || typeof day !== 'string') return false;
              return day.trim().toLowerCase() === normalizedSelectedDay;
            });
            
            if (!hasSelectedDay) {
              console.log(`[getCleaners] ❌ Filtering out ${cleaner.name} - availability_days: [${availabilityDays.join(', ')}], selected day: ${dayName} (NOT FOUND)`);
              return false;
            }
            
            console.log(`[getCleaners] ✅ Keeping ${cleaner.name} - availability_days: [${availabilityDays.join(', ')}], selected day: ${dayName} (FOUND)`);
            return true;
          });
          
          console.log(`[getCleaners] After date filter: ${filteredCleaners.length} cleaners`);
          
          // Check for existing bookings on this date and filter out cleaners who are already booked
          try {
            const cleanerIds = filteredCleaners.map(c => c.cleaner_id);
            if (cleanerIds.length > 0) {
              const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('assigned_cleaner_id')
                .eq('scheduled_date', selectedDate)
                .in('assigned_cleaner_id', cleanerIds)
                .in('status', ['pending', 'confirmed', 'in-progress']); // Only count active bookings
              
              if (bookingsError) {
                console.error('Error checking cleaner bookings:', bookingsError);
              } else {
                const bookedCleanerIds = new Set(
                  (bookings || [])
                    .map(b => b.assigned_cleaner_id)
                    .filter(id => id !== null)
                );
                
                console.log(`[getCleaners] Found ${bookedCleanerIds.size} cleaners with existing bookings on ${selectedDate}`);
                
                const beforeBookingFilter = filteredCleaners.length;
                filteredCleaners = filteredCleaners.filter(cleaner => {
                  const isBooked = bookedCleanerIds.has(cleaner.cleaner_id);
                  if (isBooked) {
                    console.log(`[getCleaners] Filtering out ${cleaner.name} - already has a booking on ${selectedDate}`);
                  }
                  return !isBooked;
                });
                
                console.log(`[getCleaners] After booking conflict filter: ${filteredCleaners.length} cleaners (removed ${beforeBookingFilter - filteredCleaners.length})`);
              }
            }
          } catch (bookingCheckError) {
            console.error('Error checking cleaner booking conflicts:', bookingCheckError);
            // Continue with filtered cleaners even if booking check fails
          }
        } else {
          console.error('Invalid date format:', selectedDate);
        }
      } catch (dateError) {
        console.error('Error parsing selected date:', dateError);
        // If date parsing fails, don't filter by date
      }
    }

    // Filter by working areas if suburb is provided
    if (selectedSuburb) {
      const normalizedSuburb = selectedSuburb.trim().toLowerCase();
      console.log(`[getCleaners] Filtering cleaners for suburb: ${selectedSuburb}`);
      console.log(`[getCleaners] Before location filter: ${filteredCleaners.length} cleaners`);
      
      filteredCleaners = filteredCleaners.filter(cleaner => {
        // Always include "no-preference" option - it means "any available cleaner"
        if (cleaner.cleaner_id === 'no-preference') {
          console.log(`[getCleaners] ✅ Keeping ${cleaner.name} - special case: no-preference (always included)`);
          return true;
        }
        
        const workingAreas = cleaner.working_areas || [];
        
        // STRICT RULE: Cleaner must have working areas defined AND the suburb must be in the list
        // If working_areas is empty/null, cleaner is NOT available for this location
        if (workingAreas.length === 0) {
          console.log(`[getCleaners] ❌ Filtering out ${cleaner.name} - working_areas is empty or null`);
          return false;
        }
        
        // Check if the suburb exists in working_areas array (case-insensitive)
        const hasMatchingArea = workingAreas.some(area => {
          if (!area || typeof area !== 'string') return false;
          return area.trim().toLowerCase() === normalizedSuburb;
        });
        
        if (!hasMatchingArea) {
          console.log(`[getCleaners] ❌ Filtering out ${cleaner.name} - working_areas: [${workingAreas.join(', ')}], selected suburb: ${selectedSuburb} (NOT FOUND)`);
          return false;
        }
        
        console.log(`[getCleaners] ✅ Keeping ${cleaner.name} - working_areas: [${workingAreas.join(', ')}], selected suburb: ${selectedSuburb} (FOUND)`);
        return true;
      });
      
      console.log(`[getCleaners] After location filter: ${filteredCleaners.length} cleaners`);
    }

    return filteredCleaners;
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
 * Fetch all active service category pricing (Server-side)
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getServiceCategoryPricing(): Promise<ServiceCategoryPricing[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('service_category_pricing')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      // Check if table doesn't exist (common error code: 42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn(
          'service_category_pricing table does not exist. Please run migration 057_service_category_pricing.sql'
        );
      } else {
        console.error('Error fetching service category pricing:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      }
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching service category pricing:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      error: error,
    });
    return [];
  }
}


/**
 * Fetch a specific service category pricing by category ID (Server-side)
 */
export async function getServiceCategoryPricingByCategoryId(categoryId: string): Promise<ServiceCategoryPricing | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('service_category_pricing')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching service category pricing for ${categoryId}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching service category pricing for ${categoryId}:`, error);
    return null;
  }
}

/**
 * Fetch all active teams
 */
export async function getTeams(): Promise<Team[]> {
  try {
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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

/**
 * Fetch location-specific content by slug
 * Returns null if no custom content exists for the location
 */
export async function getLocationContent(slug: string): Promise<LocationContent | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('location_content')
      .select('*')
      .eq('location_slug', slug)
      .single();

    if (error) {
      // If no content found (PGRST116), return null (not an error - expected behavior)
      if (error.code === 'PGRST116') {
        return null;
      }
      
      // Check if table doesn't exist (common error code: 42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        // Table doesn't exist yet - migration not run. Return null silently.
        return null;
      }
      
      // Only log actual errors (not "not found" cases)
      console.error(`Error fetching location content for ${slug}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    return data;
  } catch (error: any) {
    // Only log unexpected errors
    console.error(`Error fetching location content for ${slug}:`, {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
    return null;
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

export const FALLBACK_SERVICE_CATEGORY_PRICING: Record<string, number> = {
  "residential-cleaning": 500,
  "commercial-cleaning": 800,
  "specialized-cleaning": 900,
};
