/**
 * Type definitions for booking data
 * These are safe to import in client components
 */

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

