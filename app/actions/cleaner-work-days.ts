"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { revalidatePath } from "next/cache";

export interface WorkDaysData {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export async function updateWorkDays(
  workDays: WorkDaysData
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
        error: "You must be logged in to update work days",
      };
    }

    // Get current cleaner
    const cleaner = await getCurrentCleaner();
    
    if (!cleaner) {
      return {
        success: false,
        message: "Cleaner not found",
        error: "You must be a cleaner to update work days",
      };
    }

    // Update work days in database
    const { error } = await supabase
      .from("cleaners")
      .update({
        available_monday: workDays.monday,
        available_tuesday: workDays.tuesday,
        available_wednesday: workDays.wednesday,
        available_thursday: workDays.thursday,
        available_friday: workDays.friday,
        available_saturday: workDays.saturday,
        available_sunday: workDays.sunday,
        updated_at: new Date().toISOString(),
      })
      .eq("cleaner_id", cleaner.cleanerId);

    if (error) {
      console.error("Error updating work days:", error);
      return {
        success: false,
        message: "Failed to update work days",
        error: error.message,
      };
    }

    // Revalidate the work days page
    revalidatePath("/cleaner/work-days");

    return {
      success: true,
      message: "Work days updated successfully",
    };
  } catch (error) {
    console.error("Error in updateWorkDays:", error);
    return {
      success: false,
      message: "An error occurred while updating work days",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWorkDays(): Promise<{
  success: boolean;
  data?: WorkDaysData;
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

    // Fetch work days from database
    const { data, error } = await supabase
      .from("cleaners")
      .select(
        "available_monday, available_tuesday, available_wednesday, available_thursday, available_friday, available_saturday, available_sunday"
      )
      .eq("cleaner_id", cleaner.cleanerId)
      .single();

    if (error) {
      console.error("Error fetching work days:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        monday: data.available_monday ?? false,
        tuesday: data.available_tuesday ?? false,
        wednesday: data.available_wednesday ?? false,
        thursday: data.available_thursday ?? false,
        friday: data.available_friday ?? false,
        saturday: data.available_saturday ?? false,
        sunday: data.available_sunday ?? false,
      },
    };
  } catch (error) {
    console.error("Error in getWorkDays:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
