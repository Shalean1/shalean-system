"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings, updateBookingStatus } from "@/lib/storage/bookings-supabase";

export interface CancelBookingResult {
  success: boolean;
  message: string;
}

/**
 * Cancel a booking by updating its status to 'cancelled'
 */
export async function cancelBooking(bookingReference: string): Promise<CancelBookingResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to cancel a booking",
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
        message: "You don't have permission to cancel this booking",
      };
    }

    // Check if booking is already cancelled or completed
    if (booking.status === "cancelled") {
      return {
        success: false,
        message: "This booking is already cancelled",
      };
    }

    if (booking.status === "completed") {
      return {
        success: false,
        message: "Cannot cancel a completed booking",
      };
    }

    // Update booking status to cancelled
    await updateBookingStatus(bookingReference, "cancelled");

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to cancel booking: ${errorMessage}`,
    };
  }
}
