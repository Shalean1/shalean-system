import { NextRequest, NextResponse } from "next/server";
import { getBookingByReference } from "../../../../lib/storage/bookings-supabase";

/**
 * API route to fetch a booking by reference
 * This allows client components to fetch bookings without importing server-only modules
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Booking reference is required" },
        { status: 400 }
      );
    }

    const booking = await getBookingByReference(reference);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

















