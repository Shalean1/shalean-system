"use server";

import { createClient } from "@/lib/supabase/server";
import type { SystemSetting } from "@/lib/supabase/booking-data";

/**
 * Fetch all system settings (including non-public) for admin
 */
export async function getAllSystemSettingsAdmin(): Promise<SystemSetting[]> {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key", { ascending: true });

    if (error) {
      console.error("Error fetching system settings:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error;
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
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("system_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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








