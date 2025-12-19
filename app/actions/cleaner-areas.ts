"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { revalidatePath } from "next/cache";

export async function updateAreas(
  areas: string[]
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
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

    // Get current cleaner
    const cleaner = await getCurrentCleaner();
    
    if (!cleaner) {
      return {
        success: false,
        message: "Cleaner not found",
        error: "You must be a cleaner to update areas",
      };
    }

    // Update areas in database
    const { error } = await supabase
      .from("cleaners")
      .update({
        areas: areas.length > 0 ? areas : null,
        updated_at: new Date().toISOString(),
      })
      .eq("cleaner_id", cleaner.cleanerId);

    if (error) {
      console.error("Error updating areas:", error);
      return {
        success: false,
        message: "Failed to update areas",
        error: error.message,
      };
    }

    // Revalidate the areas page
    revalidatePath("/cleaner/areas");

    return {
      success: true,
      message: "Areas updated successfully",
    };
  } catch (error) {
    console.error("Error in updateAreas:", error);
    return {
      success: false,
      message: "An error occurred while updating areas",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAreas(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
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

    // Get current cleaner
    const cleaner = await getCurrentCleaner();
    
    if (!cleaner) {
      return {
        success: false,
        error: "Cleaner not found",
      };
    }

    // Fetch areas from database
    const { data, error } = await supabase
      .from("cleaners")
      .select("areas")
      .eq("cleaner_id", cleaner.cleanerId)
      .single();

    if (error) {
      console.error("Error fetching areas:", error);
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
    console.error("Error in getAreas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
