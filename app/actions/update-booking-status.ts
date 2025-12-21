"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings } from "@/lib/storage/bookings-supabase";
import { Booking } from "@/lib/types/booking";

export interface UpdateBookingStatusResult {
  success: boolean;
  message: string;
}

/**
 * Update booking status
 */
export async function updateBookingStatusAction(
  bookingReference: string,
  status: Booking["status"]
): Promise<UpdateBookingStatusResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update booking status",
      };
    }

    // Fetch the booking
    const booking = await getBookingByReference(bookingReference);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Verify the booking belongs to the current user
    const userBookings = await getUserBookings();
    const userBookingIds = userBookings.map((b) => b.bookingReference);
    
    if (!userBookingIds.includes(booking.bookingReference)) {
      return {
        success: false,
        message: "You don't have permission to update this booking",
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
