"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getBookingByReference } from "@/app/actions/admin-bookings";
import { Booking } from "@/lib/types/booking";

export interface AdminUpdateBookingStatusResult {
  success: boolean;
  message: string;
}

/**
 * Update booking status (admin access - no user restriction)
 */
export async function adminUpdateBookingStatusAction(
  bookingReference: string,
  status: Booking["status"]
): Promise<AdminUpdateBookingStatusResult> {
  try {
    const supabase = createServiceRoleClient();

    // Fetch the booking
    const booking = await getBookingByReference(bookingReference);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Update booking status
    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_reference", bookingReference);

    if (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    return {
      success: true,
      message: "Booking status updated successfully",
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to update booking status: ${errorMessage}`,
    };
  }
}
