"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference } from "@/lib/storage/bookings-supabase";
import { normalizeCleanerPreference } from "@/lib/types/booking";
import { Booking } from "@/lib/types/booking";

export interface GetBookingByCleanerResult {
  success: boolean;
  message?: string;
  bookingReference?: string;
}

export interface GetBookingResult {
  success: boolean;
  message?: string;
  booking?: Booking;
}

/**
 * Get the most recent completed booking for a specific cleaner
 */
export async function getMostRecentBookingByCleaner(
  cleanerId: string
): Promise<GetBookingByCleanerResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        success: false,
        message: "You must be logged in",
      };
    }

    // Normalize cleaner ID (handle cleaner preference format)
    const normalizedCleanerId = normalizeCleanerPreference(cleanerId);

    // Get the most recent completed booking with this cleaner preference
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_reference")
      .eq("contact_email", user.email)
      .eq("cleaner_preference", normalizedCleanerId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return {
          success: false,
          message: "No completed booking found for this cleaner",
        };
      }
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }

    if (!data || !data.booking_reference) {
      return {
        success: false,
        message: "No booking reference found",
      };
    }

    return {
      success: true,
      bookingReference: data.booking_reference,
    };
  } catch (error) {
    console.error("Error getting booking by cleaner:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to get booking: ${errorMessage}`,
    };
  }
}

/**
 * Get booking by reference (for client components)
 */
export async function getBookingByReferenceAction(
  bookingReference: string
): Promise<GetBookingResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in",
      };
    }

    const booking = await getBookingByReference(bookingReference);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Verify the booking belongs to the current user
    if (booking.email !== user.email) {
      return {
        success: false,
        message: "You don't have permission to access this booking",
      };
    }

    return {
      success: true,
      booking,
    };
  } catch (error) {
    console.error("Error getting booking by reference:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to get booking: ${errorMessage}`,
    };
  }
}























