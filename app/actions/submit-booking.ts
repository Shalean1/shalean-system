"use server";

import { BookingFormData, Booking, normalizeCleanerPreference } from "@/lib/types/booking";
import { calculatePrice, fetchPricingConfig, calculateCleanerEarnings } from "@/lib/pricing";
import { saveBooking, generateBookingId, generateBookingReference, getBookingByPaymentReference } from "@/lib/storage/bookings-supabase";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";
import { verifyPayment } from "@/lib/paystack";
import { validateDiscountCode, recordDiscountCodeUsage } from "@/app/actions/discount";
import { useCreditsForBooking } from "@/app/actions/credits";
import { createClient } from "@/lib/supabase/server";
import { getSystemSettings } from "@/lib/supabase/booking-data";
import { generateRecurringGroupId, calculateRecurringDates } from "@/lib/utils/recurring-bookings";

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

    // Determine assigned cleaner ID
    const normalizedPreference = normalizeCleanerPreference(data.cleanerPreference);
    const assignedCleanerId = normalizedPreference !== "no-preference" ? normalizedPreference : null;

    // Calculate cleaner earnings if cleaner is assigned
    let cleanerEarnings: number | undefined;
    let cleanerEarningsPercentage: number | undefined;
    
    if (assignedCleanerId) {
      try {
        const supabase = await createClient();
        
        // Get cleaner information
        const { data: cleanerData } = await supabase
          .from("cleaners")
          .select("total_jobs")
          .eq("cleaner_id", assignedCleanerId)
          .single();

        // Get old cleaner threshold from system settings
        const systemSettings = await getSystemSettings(['old_cleaner_job_threshold']);
        const oldCleanerThreshold = systemSettings.old_cleaner_job_threshold 
          ? parseInt(systemSettings.old_cleaner_job_threshold, 10) 
          : 50;

        // Calculate cleaner earnings
        const cleanerTotalJobs = cleanerData?.total_jobs || 0;
        const earningsResult = calculateCleanerEarnings(
          priceBreakdown,
          cleanerTotalJobs,
          oldCleanerThreshold
        );

        cleanerEarnings = earningsResult.totalEarnings;
        cleanerEarningsPercentage = earningsResult.earningsPercentage;
      } catch (error) {
        console.error("Failed to calculate cleaner earnings (non-critical):", error);
        // Continue without earnings calculation if it fails
      }
    }

    // Determine if this is a recurring booking
    const isRecurring = data.frequency !== "one-time";
    const recurringGroupId = isRecurring ? generateRecurringGroupId() : undefined;

    // Create booking object
    const booking: Booking = {
      ...data,
      cleanerPreference: normalizedPreference,
      id: generateBookingId(),
      bookingReference,
      createdAt: new Date().toISOString(),
      totalAmount: priceBreakdown.total,
      paymentStatus,
      paymentReference: paymentMethod === "credits" ? `credits-${bookingReference}` : paymentReference,
      status: paymentStatus === "completed" ? "confirmed" : "pending",
      // Price breakdown fields
      subtotal: priceBreakdown.subtotal,
      frequencyDiscount: priceBreakdown.frequencyDiscount,
      discountCodeDiscount: priceBreakdown.discountCodeDiscount,
      serviceFee: priceBreakdown.serviceFee,
      // Cleaner earnings fields
      cleanerEarnings,
      cleanerEarningsPercentage,
      // Recurring booking fields
      recurringGroupId,
      recurringSequence: isRecurring ? 0 : undefined,
      isRecurring: isRecurring,
    };

    // Save first booking
    await saveBooking(booking);

    // Create recurring bookings if applicable
    if (isRecurring && data.scheduledDate) {
      try {
        const recurringDates = calculateRecurringDates(data.frequency, data.scheduledDate, 3);
        
        // Create recurring bookings for each date
        const recurringBookings: Booking[] = recurringDates.map((date, index) => {
          const recurringBookingId = generateBookingId();
          const recurringBookingReference = generateBookingReference();
          
          return {
            ...data,
            cleanerPreference: normalizedPreference,
            id: recurringBookingId,
            bookingReference: recurringBookingReference,
            scheduledDate: date, // Use calculated recurring date
            createdAt: new Date().toISOString(),
            totalAmount: priceBreakdown.total,
            paymentStatus: "pending" as const, // Not charged upfront
            status: "pending" as const, // Not confirmed yet
            // Price breakdown fields (same as first booking)
            subtotal: priceBreakdown.subtotal,
            frequencyDiscount: priceBreakdown.frequencyDiscount,
            discountCodeDiscount: priceBreakdown.discountCodeDiscount,
            serviceFee: priceBreakdown.serviceFee,
            // Cleaner earnings fields (will be calculated when booking is confirmed)
            cleanerEarnings: undefined,
            cleanerEarningsPercentage: undefined,
            // Recurring booking fields
            recurringGroupId,
            recurringSequence: index + 1, // 1, 2, 3, etc.
            parentBookingId: booking.id,
            isRecurring: true,
          };
        });

        // Save all recurring bookings
        // Use batch insert for efficiency if possible, otherwise save sequentially
        for (const recurringBooking of recurringBookings) {
          try {
            await saveBooking(recurringBooking);
          } catch (error) {
            // Log error but don't fail the main booking
            console.error(`Failed to create recurring booking ${recurringBooking.recurringSequence}:`, error);
          }
        }

        console.log(`Created ${recurringBookings.length} recurring bookings for group ${recurringGroupId}`);
      } catch (error) {
        // Log error but don't fail the main booking
        console.error("Failed to create recurring bookings (non-critical):", error);
      }
    }
    
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
