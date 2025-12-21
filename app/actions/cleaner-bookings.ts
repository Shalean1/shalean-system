"use server";

import { updateCleanerBookingStatus, acceptBooking, declineBooking, updateJobProgress, completeJob } from "@/lib/storage/cleaner-bookings-supabase";
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

export async function acceptBookingAction(
  reference: string
): Promise<{ success: boolean; message: string }> {
  try {
    await acceptBooking(reference);
    return {
      success: true,
      message: "Booking accepted successfully",
    };
  } catch (error) {
    console.error("Error accepting booking:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to accept booking",
    };
  }
}

export async function declineBookingAction(
  reference: string
): Promise<{ success: boolean; message: string }> {
  try {
    await declineBooking(reference);
    return {
      success: true,
      message: "Booking declined successfully",
    };
  } catch (error) {
    console.error("Error declining booking:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to decline booking",
    };
  }
}

export async function updateJobProgressAction(
  reference: string,
  progress: "on-my-way" | "arrived" | "started"
): Promise<{ success: boolean; message: string }> {
  try {
    await updateJobProgress(reference, progress);
    return {
      success: true,
      message: "Job progress updated successfully",
    };
  } catch (error) {
    console.error("Error updating job progress:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update job progress",
    };
  }
}

export async function completeJobAction(
  reference: string
): Promise<{ success: boolean; message: string }> {
  try {
    await completeJob(reference);
    return {
      success: true,
      message: "Job completed successfully",
    };
  } catch (error) {
    console.error("Error completing job:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to complete job",
    };
  }
}
