"use server";

import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/storage/profile-supabase";
import { revalidatePath } from "next/cache";

/**
 * Get areas for a specific cleaner (admin only)
 */
export async function getCleanerAreas(
  cleanerId: string
): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    // Verify admin status
    const adminCheck = await isUserAdmin();
    if (!adminCheck) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Fetch areas from database
    const { data, error } = await supabase
      .from("cleaners")
      .select("areas")
      .eq("cleaner_id", cleanerId)
      .single();

    if (error) {
      console.error("Error fetching cleaner areas:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data.areas || [],
    };
  } catch (error) {
    console.error("Error in getCleanerAreas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update areas for a specific cleaner (admin only)
 */
export async function updateCleanerAreas(
  cleanerId: string,
  areas: string[]
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Verify admin status
    const adminCheck = await isUserAdmin();
    if (!adminCheck) {
      return {
        success: false,
        message: "Unauthorized",
        error: "Admin access required to update cleaner areas",
      };
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to update areas",
      };
    }

    // Verify cleaner exists
    const { data: cleaner, error: fetchError } = await supabase
      .from("cleaners")
      .select("cleaner_id")
      .eq("cleaner_id", cleanerId)
      .single();

    if (fetchError || !cleaner) {
      return {
        success: false,
        message: "Cleaner not found",
        error: "The specified cleaner does not exist",
      };
    }

    // Update areas in database
    const { error } = await supabase
      .from("cleaners")
      .update({
        areas: areas.length > 0 ? areas : null,
        updated_at: new Date().toISOString(),
      })
      .eq("cleaner_id", cleanerId);

    if (error) {
      console.error("Error updating cleaner areas:", error);
      return {
        success: false,
        message: "Failed to update areas",
        error: error.message,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/cleaners");
    revalidatePath("/cleaner/areas");

    return {
      success: true,
      message: "Areas updated successfully",
    };
  } catch (error) {
    console.error("Error in updateCleanerAreas:", error);
    return {
      success: false,
      message: "An error occurred while updating areas",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

