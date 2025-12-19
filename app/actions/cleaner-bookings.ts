"use server";

import { updateCleanerBookingStatus } from "@/lib/storage/cleaner-bookings-supabase";
import { Booking } from "@/lib/types/booking";

export async function updateBookingStatusAction(
  reference: string,
  status: Booking["status"]
): Promise<{ success: boolean; message: string }> {
  try {
    await updateCleanerBookingStatus(reference, status);
    return {
      success: true,
      message: "Booking status updated successfully",
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update booking status",
    };
  }
}
