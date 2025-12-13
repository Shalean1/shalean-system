import { NextRequest, NextResponse } from "next/server";
import { submitBooking } from "@/app/actions/submit-booking";
import { BookingFormData } from "@/lib/types/booking";

/**
 * Paystack webhook handler for payment verification
 * This endpoint can be used to verify payments server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Paystack sends payment verification data
    const { reference, status, metadata } = body;

    if (status === "success" && reference && metadata?.booking_data) {
      // Submit booking with payment reference
      const bookingData = metadata.booking_data as BookingFormData;
      const result = await submitBooking(bookingData, reference);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Booking confirmed",
          bookingReference: result.bookingReference,
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
