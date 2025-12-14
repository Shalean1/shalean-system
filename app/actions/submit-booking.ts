"use server";

import { BookingFormData, Booking, normalizeCleanerPreference } from "@/lib/types/booking";
import { calculatePrice, fetchPricingConfig } from "@/lib/pricing";
import { saveBooking, generateBookingId, generateBookingReference, getBookingByPaymentReference } from "@/lib/storage/bookings-supabase";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";
import { verifyPayment } from "@/lib/paystack";
import { validateDiscountCode, recordDiscountCodeUsage } from "@/app/actions/discount";
import { useCreditsForBooking } from "@/app/actions/credits";
import { createClient } from "@/lib/supabase/server";

export interface SubmitBookingResult {
  success: boolean;
  message: string;
  bookingId?: string;
  bookingReference?: string;
  errors?: Record<string, string>;
}

export async function submitBooking(
  data: BookingFormData,
  paymentReference?: string,
  paymentMethod?: "card" | "credits"
): Promise<SubmitBookingResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  if (!data.service) {
    errors.service = "Service is required";
  }

  if (data.bedrooms === undefined || data.bedrooms === null || data.bedrooms < 0) {
    errors.bedrooms = "Invalid number of bedrooms";
  }

  if (data.bathrooms === undefined || data.bathrooms === null || data.bathrooms < 1) {
    errors.bathrooms = "At least one bathroom is required";
  }

  if (!data.scheduledDate || (typeof data.scheduledDate === "string" && data.scheduledDate.trim() === "")) {
    errors.scheduledDate = "Please select a date";
  }

  if (!data.scheduledTime || (typeof data.scheduledTime === "string" && data.scheduledTime.trim() === "")) {
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
    // Fetch pricing configuration from database
    const pricingConfig = await fetchPricingConfig();
    
    // Calculate initial price breakdown (without discount code)
    const initialPriceBreakdown = calculatePrice(data, pricingConfig, 0);
    
    // Validate and apply discount code if provided
    let discountCodeAmount = 0;
    if (data.discountCode && data.discountCode.trim()) {
      const discountResult = await validateDiscountCode(
        data.discountCode.trim(),
        initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
      );
      
      if (discountResult.success) {
        discountCodeAmount = discountResult.discountAmount;
      } else {
        // Invalid discount code - return error
        return {
          success: false,
          message: discountResult.message || "Invalid discount code",
          errors: { discountCode: discountResult.message || "Invalid discount code" },
        };
      }
    }
    
    // Calculate final pricing with discount code
    const priceBreakdown = calculatePrice(data, pricingConfig, discountCodeAmount);

    // Handle payment based on payment method
    let paymentStatus: "pending" | "completed" | "failed" = "pending";
    
    if (paymentMethod === "credits") {
      // Deduct credits for booking payment
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: "User must be logged in to use credits",
          errors: { payment: "Please log in to use ShalCred credits" },
        };
      }

      // Generate booking reference first for credit transaction
      const bookingRef = generateBookingReference();
      
      const creditsResult = await useCreditsForBooking(
        priceBreakdown.total,
        bookingRef
      );

      if (!creditsResult.success) {
        return {
          success: false,
          message: creditsResult.error || "Failed to use credits",
          errors: { payment: creditsResult.error || "Insufficient credits" },
        };
      }

      paymentStatus = "completed";
      // Use booking reference as payment reference prefix
      paymentReference = `credits-${bookingRef}`;
    } else if (paymentReference && process.env.PAYSTACK_SECRET_KEY) {
      // Verify card payment
      const verified = await verifyPayment(paymentReference, process.env.PAYSTACK_SECRET_KEY);
      paymentStatus = verified ? "completed" : "failed";
    }

    // Check if booking already exists for this payment reference
    // This prevents duplicate bookings if webhook and client-side both try to create booking
    if (paymentReference) {
      const existingBooking = await getBookingByPaymentReference(paymentReference);
      if (existingBooking) {
        console.log("Booking already exists for payment reference:", paymentReference);
        return {
          success: true,
          message: "Booking already exists",
          bookingId: existingBooking.id,
          bookingReference: existingBooking.bookingReference,
        };
      }
    }

    // Generate booking reference (reuse if already generated for credits)
    let bookingReference: string;
    if (paymentMethod === "credits" && paymentReference?.startsWith("credits-")) {
      bookingReference = paymentReference.replace("credits-", "");
    } else {
      bookingReference = generateBookingReference();
    }

    // Create booking object
    const booking: Booking = {
      ...data,
      cleanerPreference: normalizeCleanerPreference(data.cleanerPreference),
      id: generateBookingId(),
      bookingReference,
      createdAt: new Date().toISOString(),
      totalAmount: priceBreakdown.total,
      paymentStatus,
      paymentReference: paymentMethod === "credits" ? `credits-${bookingReference}` : paymentReference,
      status: paymentStatus === "completed" ? "confirmed" : "pending",
    };

    // Save booking
    await saveBooking(booking);
    
    // Record discount code usage if applicable
    if (data.discountCode && discountCodeAmount > 0 && paymentStatus === "completed") {
      try {
        await recordDiscountCodeUsage(
          data.discountCode.trim(),
          booking.bookingReference,
          data.email,
          discountCodeAmount,
          priceBreakdown.total
        );
      } catch (error) {
        console.error("Failed to record discount code usage (non-critical):", error);
      }
    }

    // Process referral rewards if payment is completed
    if (paymentStatus === "completed") {
      try {
        const supabase = await createClient();
        
        // Find user by email (since bookings can be made without being logged in)
        // First try to get logged-in user
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        
        let userId: string | null = loggedInUser?.id || null;
        
        // If not logged in, try to find user by email from profiles
        if (!userId) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", data.email)
            .single();
          
          userId = profileData?.id || null;
        }
        
        // Only process referral rewards if we found a user
        if (userId) {
          // Check if this is the first booking for this user (by email)
          // We check BEFORE this booking was saved, so count should be 0 for first booking
          const { count: bookingCount } = await supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("contact_email", data.email)
            .eq("payment_status", "completed")
            .in("status", ["confirmed", "completed"]);

          // If this is the first completed booking (count is 0 before this one is saved),
          // process referral rewards
          // Note: The booking was just saved, so count will be 1, meaning this is the first
          if (bookingCount === 1) {
            const { error: referralError } = await supabase.rpc(
              "process_referral_rewards",
              {
                p_referee_id: userId,
                p_booking_reference: booking.bookingReference,
              }
            );

            if (referralError) {
              console.error("Failed to process referral rewards:", referralError);
              // Don't fail booking if referral processing fails
            } else {
              console.log("Referral rewards processed successfully");
            }
          }
        }
      } catch (error) {
        console.error("Error processing referral rewards (non-critical):", error);
        // Don't fail booking if referral processing fails
      }
    }

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
