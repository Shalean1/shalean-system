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
        "carpet_cleaning_price_per_fitted_room",
        "carpet_cleaning_price_per_loose_carpet",
        "carpet_cleaning_furniture_fee",
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
  updates: { price_modifier?: number; service_id?: string; name?: string; description?: string; icon_name?: string; is_active?: boolean }
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

/**
 * Create a new service type pricing
 */
export async function createServiceTypePricing(data: {
  service_type: string;
  service_name: string;
  base_price: number;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ success: boolean; error?: string; data?: ServiceTypePricing }> {
  try {
    const supabase = await createClient();
    
    // If display_order not provided, calculate it (put at the end)
    let displayOrder = data.display_order;
    if (displayOrder === undefined) {
      const { data: existingServices } = await supabase
        .from("service_type_pricing")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      
      displayOrder = existingServices && existingServices.length > 0
        ? (existingServices[0].display_order || 0) + 1
        : 1;
    }

    const { data: newService, error } = await supabase
      .from("service_type_pricing")
      .insert({
        service_type: data.service_type,
        service_name: data.service_name,
        base_price: data.base_price,
        description: data.description || null,
        display_order: displayOrder,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating service type pricing:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: newService };
  } catch (error) {
    console.error("Error creating service type pricing:", error);
    return { success: false, error: "Failed to create service type pricing" };
  }
}

/**
 * Delete a service type pricing
 */
export async function deleteServiceTypePricing(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_type_pricing")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting service type pricing:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting service type pricing:", error);
    return { success: false, error: "Failed to delete service type pricing" };
  }
}

/**
 * Create a new additional service
 */
export async function createAdditionalService(data: {
  service_id: string;
  name: string;
  description?: string;
  icon_name?: string;
  price_modifier: number;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ success: boolean; error?: string; data?: AdditionalService }> {
  try {
    const supabase = await createClient();
    
    // If display_order not provided, calculate it (put at the end)
    let displayOrder = data.display_order;
    if (displayOrder === undefined) {
      const { data: existingServices } = await supabase
        .from("additional_services")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      
      displayOrder = existingServices && existingServices.length > 0
        ? (existingServices[0].display_order || 0) + 1
        : 1;
    }

    const { data: newService, error } = await supabase
      .from("additional_services")
      .insert({
        service_id: data.service_id,
        name: data.name,
        description: data.description || null,
        icon_name: data.icon_name || null,
        price_modifier: data.price_modifier,
        display_order: displayOrder,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating additional service:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: newService };
  } catch (error) {
    console.error("Error creating additional service:", error);
    return { success: false, error: "Failed to create additional service" };
  }
}

/**
 * Delete an additional service
 */
export async function deleteAdditionalService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("additional_services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting additional service:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting additional service:", error);
    return { success: false, error: "Failed to delete additional service" };
  }
}
