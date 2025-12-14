"use server";

import { BookingFormData } from "@/lib/types/booking";
import { getBookingByReference, updatePaymentStatus, updateBookingStatus } from "@/lib/storage/bookings-supabase";
import { verifyPayment } from "@/lib/paystack";

export interface RebookPaymentResult {
  success: boolean;
  message: string;
  bookingReference?: string;
}

/**
 * Update an existing rebooked booking with payment information
 * This is called after payment is successful
 */
export async function updateRebookedBookingPayment(
  bookingReference: string,
  paymentReference: string
): Promise<RebookPaymentResult> {
  try {
    // Verify the booking exists
    const booking = await getBookingByReference(bookingReference);
    
    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Verify payment
    let paymentStatus: "pending" | "completed" | "failed" = "pending";
    if (process.env.PAYSTACK_SECRET_KEY) {
      const verified = await verifyPayment(paymentReference, process.env.PAYSTACK_SECRET_KEY);
      paymentStatus = verified ? "completed" : "failed";
    }

    // Update payment status and reference
    await updatePaymentStatus(bookingReference, paymentStatus, paymentReference);

    // Update booking status if payment completed
    if (paymentStatus === "completed") {
      await updateBookingStatus(bookingReference, "confirmed");
    }

    return {
      success: true,
      message: "Payment updated successfully",
      bookingReference: booking.bookingReference,
    };
  } catch (error) {
    console.error("Error updating rebooked booking payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to update payment: ${errorMessage}`,
    };
  }
}
