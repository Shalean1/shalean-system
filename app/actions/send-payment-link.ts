"use server";

import { getBookingByReference } from "@/app/actions/admin-bookings";
import { sendPaymentLinkEmail } from "@/lib/email";

export interface SendPaymentLinkResult {
  success: boolean;
  message: string;
}

/**
 * Send payment link email to customer for a failed payment booking
 */
export async function sendPaymentLink(bookingReference: string): Promise<SendPaymentLinkResult> {
  try {
    // Get booking details
    const booking = await getBookingByReference(bookingReference);
    
    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Only send payment link if payment status is failed
    if (booking.paymentStatus !== "failed") {
      return {
        success: false,
        message: `Payment link can only be sent for failed payments. Current status: ${booking.paymentStatus}`,
      };
    }

    // Send payment link email
    await sendPaymentLinkEmail(booking);

    return {
      success: true,
      message: "Payment link sent successfully to customer",
    };
  } catch (error) {
    console.error("Error sending payment link:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send payment link",
    };
  }
}
