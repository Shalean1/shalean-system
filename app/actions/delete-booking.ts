"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings } from "@/lib/storage/bookings-supabase";

export interface DeleteBookingResult {
  success: boolean;
  message: string;
}

/**
 * Delete a booking permanently
 */
export async function deleteBooking(bookingReference: string): Promise<DeleteBookingResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to delete a booking",
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
        message: "You don't have permission to delete this booking",
      };
    }

    // Check if booking can be deleted
    // Allow deletion of cancelled bookings, but warn about completed ones
    if (booking.status === "completed" && booking.paymentStatus === "completed") {
      return {
        success: false,
        message: "Cannot delete a completed booking with completed payment. Consider cancelling instead.",
      };
    }

    // Delete booking
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_reference", bookingReference);

    if (error) {
      throw new Error(`Failed to delete booking: ${error.message}`);
    }

    return {
      success: true,
      message: "Booking deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to delete booking: ${errorMessage}`,
    };
  }
}
