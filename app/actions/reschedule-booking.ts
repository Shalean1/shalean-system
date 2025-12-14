"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings } from "@/lib/storage/bookings-supabase";

export interface RescheduleBookingResult {
  success: boolean;
  message: string;
}

/**
 * Reschedule a booking by updating its scheduled date and time
 */
export async function rescheduleBooking(
  bookingReference: string,
  newDate: string,
  newTime: string
): Promise<RescheduleBookingResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to reschedule a booking",
      };
    }

    // Validate inputs
    if (!newDate || !newTime) {
      return {
        success: false,
        message: "Both date and time are required",
      };
    }

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      return {
        success: false,
        message: "Invalid date format",
      };
    }

    // Validate time format (should be HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(newTime)) {
      return {
        success: false,
        message: "Invalid time format",
      };
    }

    // Check if date is in the past
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return {
        success: false,
        message: "Cannot reschedule to a past date",
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
        message: "You don't have permission to reschedule this booking",
      };
    }

    // Check if booking can be rescheduled
    if (booking.status === "cancelled") {
      return {
        success: false,
        message: "Cannot reschedule a cancelled booking",
      };
    }

    if (booking.status === "completed") {
      return {
        success: false,
        message: "Cannot reschedule a completed booking",
      };
    }

    // Update booking with new date and time
    const { error } = await supabase
      .from("bookings")
      .update({
        scheduled_date: newDate,
        scheduled_time: newTime,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_reference", bookingReference);

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return {
      success: true,
      message: "Booking rescheduled successfully",
    };
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to reschedule booking: ${errorMessage}`,
    };
  }
}
