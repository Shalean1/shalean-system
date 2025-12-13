"use server";

import { BookingFormData, Booking } from "@/lib/types/booking";
import { calculatePrice } from "@/lib/pricing";
import { saveBooking, generateBookingId, generateBookingReference } from "@/lib/storage/bookings";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";
import { verifyPayment } from "@/lib/paystack";

export interface SubmitBookingResult {
  success: boolean;
  message: string;
  bookingId?: string;
  bookingReference?: string;
  errors?: Record<string, string>;
}

export async function submitBooking(
  data: BookingFormData,
  paymentReference?: string
): Promise<SubmitBookingResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  if (!data.service) {
    errors.service = "Service is required";
  }

  if (data.bedrooms < 0) {
    errors.bedrooms = "Invalid number of bedrooms";
  }

  if (data.bathrooms < 1) {
    errors.bathrooms = "At least one bathroom is required";
  }

  if (!data.scheduledDate) {
    errors.scheduledDate = "Please select a date";
  }

  if (!data.scheduledTime) {
    errors.scheduledTime = "Please select a time";
  }

  if (!data.streetAddress?.trim()) {
    errors.streetAddress = "Street address is required";
  }

  if (!data.suburb?.trim()) {
    errors.suburb = "Suburb is required";
  }

  if (!data.city?.trim()) {
    errors.city = "City is required";
  }

  if (!data.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    // Calculate pricing
    const priceBreakdown = calculatePrice(data);

    // Verify payment if reference provided
    let paymentStatus: "pending" | "completed" | "failed" = "pending";
    if (paymentReference && process.env.PAYSTACK_SECRET_KEY) {
      const verified = await verifyPayment(paymentReference, process.env.PAYSTACK_SECRET_KEY);
      paymentStatus = verified ? "completed" : "failed";
    }

    // Create booking object
    const booking: Booking = {
      ...data,
      id: generateBookingId(),
      bookingReference: generateBookingReference(),
      createdAt: new Date().toISOString(),
      totalAmount: priceBreakdown.total,
      paymentStatus,
      paymentReference: paymentReference,
      status: paymentStatus === "completed" ? "confirmed" : "pending",
    };

    // Save booking
    await saveBooking(booking);

    // Send emails (don't fail if email fails)
    try {
      await sendBookingConfirmationEmail(booking);
      console.log("Booking confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send booking confirmation email (non-critical):", emailError);
    }

    try {
      await sendBookingNotificationEmail(booking);
      console.log("Booking notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send booking notification email (non-critical):", emailError);
    }

    return {
      success: true,
      message: "Booking submitted successfully!",
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
    };
  } catch (error) {
    console.error("Error submitting booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `An error occurred: ${errorMessage}`,
    };
  }
}
