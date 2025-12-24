"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Helper function to create or update a user profile
 * This replaces the database trigger approach
 */
export async function ensureUserProfile(
  userId: string,
  options: {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    cleanerId?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createServiceRoleClient();

    // Use upsert to create or update profile
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: options.email || null,
          phone: options.phone || null,
          first_name: options.firstName || null,
          last_name: options.lastName || null,
          full_name: options.fullName || null,
          cleaner_id: options.cleanerId || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      // Handle specific error cases
      if (error.code === "23503") {
        // Foreign key violation - invalid cleaner_id
        console.warn(`Invalid cleaner_id ${options.cleanerId} for user ${userId}, creating profile without cleaner_id`);
        // Try again without cleaner_id
        const { error: retryError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              id: userId,
              email: options.email || null,
              phone: options.phone || null,
              first_name: options.firstName || null,
              last_name: options.lastName || null,
              full_name: options.fullName || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );
        if (retryError) {
          return { success: false, error: retryError.message };
        }
        return { success: true };
      }

      // For unique constraint violations (like phone conflicts), log but don't fail
      if (error.code === "23505") {
        console.warn(`Profile constraint violation for user ${userId}: ${error.message}`);
        // Profile might already exist with different data, that's okay
        return { success: true };
      }

      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error ensuring profile for user ${userId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}














