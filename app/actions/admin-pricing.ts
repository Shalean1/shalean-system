"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ServiceTypePricing,
  AdditionalService,
  FrequencyOption,
  RoomPricing,
  SystemSetting,
} from "@/lib/supabase/booking-data";

/**
 * Fetch all service type pricing
 */
export async function getServiceTypePricing(): Promise<ServiceTypePricing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_type_pricing")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching service type pricing:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching service type pricing:", error);
    return [];
  }
}

/**
 * Fetch all room pricing
 */
export async function getRoomPricing(): Promise<RoomPricing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_pricing")
      .select("*")
      .order("service_type", { ascending: true })
      .order("room_type", { ascending: true });

    if (error) {
      console.error("Error fetching room pricing:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching room pricing:", error);
    return [];
  }
}

/**
 * Fetch all additional services
 */
export async function getAdditionalServices(): Promise<AdditionalService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("additional_services")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching additional services:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching additional services:", error);
    return [];
  }
}

/**
 * Fetch all frequency options
 */
export async function getFrequencyOptions(): Promise<FrequencyOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("frequency_options")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching frequency options:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching frequency options:", error);
    return [];
  }
}

/**
 * Fetch pricing-related system settings
 */
export async function getPricingSettings(): Promise<SystemSetting[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .in("setting_key", [
        "service_fee_percentage",
        "price_per_bedroom",
        "price_per_bathroom",
      ])
      .order("setting_key", { ascending: true });

    if (error) {
      console.error("Error fetching pricing settings:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching pricing settings:", error);
    return [];
  }
}

/**
 * Fetch all pricing data
 */
export async function getAllPricingData() {
  try {
    const [servicePricing, roomPricing, additionalServices, frequencyOptions, pricingSettings] =
      await Promise.all([
        getServiceTypePricing(),
        getRoomPricing(),
        getAdditionalServices(),
        getFrequencyOptions(),
        getPricingSettings(),
      ]);

    return {
      servicePricing,
      roomPricing,
      additionalServices,
      frequencyOptions,
      pricingSettings,
    };
  } catch (error) {
    console.error("Error fetching all pricing data:", error);
    return {
      servicePricing: [],
      roomPricing: [],
      additionalServices: [],
      frequencyOptions: [],
      pricingSettings: [],
    };
  }
}

/**
 * Update service type pricing
 */
export async function updateServiceTypePricing(
  id: string,
  updates: { base_price?: number; service_name?: string; description?: string; is_active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_type_pricing")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating service type pricing:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating service type pricing:", error);
    return { success: false, error: "Failed to update service type pricing" };
  }
}

/**
 * Update room pricing
 */
export async function updateRoomPricing(
  id: string,
  updates: { price_per_room?: number; is_active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("room_pricing")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating room pricing:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating room pricing:", error);
    return { success: false, error: "Failed to update room pricing" };
  }
}

/**
 * Update additional service pricing
 */
export async function updateAdditionalService(
  id: string,
  updates: { price_modifier?: number; name?: string; description?: string; is_active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("additional_services")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating additional service:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating additional service:", error);
    return { success: false, error: "Failed to update additional service" };
  }
}

/**
 * Update frequency option discount
 */
export async function updateFrequencyOption(
  id: string,
  updates: { discount_percentage?: number; name?: string; description?: string; is_active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("frequency_options")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating frequency option:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating frequency option:", error);
    return { success: false, error: "Failed to update frequency option" };
  }
}

/**
 * Update system setting value
 */
export async function updateSystemSetting(
  id: string,
  updates: { setting_value?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("system_settings")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating system setting:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating system setting:", error);
    return { success: false, error: "Failed to update system setting" };
  }
}
