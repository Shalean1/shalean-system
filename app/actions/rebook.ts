"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings, saveBooking, generateBookingId, generateBookingReference } from "@/lib/storage/bookings-supabase";
import { Booking } from "@/lib/types/booking";

export interface RebookResult {
  success: boolean;
  message: string;
  newBookingReference?: string;
  bookingId?: string;
}

/**
 * Rebook a previous booking by creating a duplicate with the same details
 * The new booking will have a new reference and ID, but same total amount
 */
export async function rebookBooking(originalReference: string): Promise<RebookResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to rebook",
      };
    }

    // Fetch the original booking
    const originalBooking = await getBookingByReference(originalReference);

    if (!originalBooking) {
      return {
        success: false,
        message: "Original booking not found",
      };
    }

    // Verify the booking belongs to the current user
    const userBookings = await getUserBookings();
    const userBookingIds = userBookings.map((b) => b.bookingReference);
    
    if (!userBookingIds.includes(originalBooking.bookingReference)) {
      return {
        success: false,
        message: "You don't have permission to rebook this booking",
      };
    }

    // Create duplicate booking with same details but new ID and reference
    const newBooking: Booking = {
      ...originalBooking,
      id: generateBookingId(),
      bookingReference: generateBookingReference(),
      createdAt: new Date().toISOString(),
      paymentStatus: "pending",
      status: "pending",
      paymentReference: undefined, // Clear payment reference for new booking
      // Keep all other details the same:
      // - service, bedrooms, bathrooms, extras
      // - scheduledDate, scheduledTime, frequency
      // - streetAddress, aptUnit, suburb, city
      // - cleanerPreference, specialInstructions
      // - firstName, lastName, email, phone
      // - discountCode, tip
      // - totalAmount (same as original)
    };

    // Save the new booking
    await saveBooking(newBooking);

    return {
      success: true,
      message: "Booking duplicated successfully",
      newBookingReference: newBooking.bookingReference,
      bookingId: newBooking.id,
    };
  } catch (error) {
    console.error("Error rebooking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to rebook: ${errorMessage}`,
    };
  }
}
