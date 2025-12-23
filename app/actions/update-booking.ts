"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingByReference, getUserBookings } from "@/lib/storage/bookings-supabase";
import { BookingFormData, normalizeCleanerPreference } from "@/lib/types/booking";
import { calculatePrice, fetchPricingConfig } from "@/lib/pricing";

export interface UpdateBookingResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

/**
 * Update a booking with new data
 */
export async function updateBooking(
  bookingReference: string,
  updates: Partial<BookingFormData>
): Promise<UpdateBookingResult> {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update a booking",
      };
    }

    // Fetch the booking
    const booking = await getBookingByReference(bookingReference);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Verify the booking belongs to the current user
    const userBookings = await getUserBookings();
    const userBookingIds = userBookings.map((b) => b.bookingReference);
    
    if (!userBookingIds.includes(booking.bookingReference)) {
      return {
        success: false,
        message: "You don't have permission to update this booking",
      };
    }

    // Check if booking can be updated
    if (booking.status === "cancelled") {
      return {
        success: false,
        message: "Cannot update a cancelled booking",
      };
    }

    if (booking.status === "completed") {
      return {
        success: false,
        message: "Cannot update a completed booking",
      };
    }

    // Validate updates
    const errors: Record<string, string> = {};

    // For office service, validate officeSize instead of bedrooms
    if (updates.service === 'office' || (booking.service === 'office' && updates.service === undefined)) {
      if (updates.officeSize !== undefined && (!updates.officeSize || !['small', 'medium', 'large'].includes(updates.officeSize))) {
        errors.officeSize = "Please select office size";
      }
    } else if (updates.bedrooms !== undefined && (updates.bedrooms < 0 || updates.bedrooms === null)) {
      errors.bedrooms = "Invalid number of bedrooms";
    }

    if (updates.bathrooms !== undefined && (updates.bathrooms < 1 || updates.bathrooms === null)) {
      errors.bathrooms = "At least one bathroom is required";
    }

    if (updates.email !== undefined && (!updates.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) {
      errors.email = "Valid email is required";
    }

    if (updates.scheduledDate !== undefined && (!updates.scheduledDate || (typeof updates.scheduledDate === "string" && updates.scheduledDate.trim() === ""))) {
      errors.scheduledDate = "Please select a valid date";
    }

    if (updates.scheduledTime !== undefined && (!updates.scheduledTime || (typeof updates.scheduledTime === "string" && updates.scheduledTime.trim() === ""))) {
      errors.scheduledTime = "Please select a valid time";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please fix the validation errors",
        errors,
      };
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map BookingFormData fields to database fields
    if (updates.service !== undefined) {
      updateData.service_type = updates.service;
    }
    if (updates.frequency !== undefined) {
      updateData.frequency = updates.frequency;
    }
    if (updates.scheduledDate !== undefined) {
      updateData.scheduled_date = updates.scheduledDate;
    }
    if (updates.scheduledTime !== undefined) {
      updateData.scheduled_time = updates.scheduledTime;
    }
    if (updates.bedrooms !== undefined) {
      updateData.bedrooms = updates.bedrooms;
    }
    if (updates.bathrooms !== undefined) {
      updateData.bathrooms = updates.bathrooms;
    }
    if (updates.officeSize !== undefined) {
      updateData.office_size = updates.officeSize || null;
    }
    if (updates.extras !== undefined) {
      updateData.extras = updates.extras || [];
    }
    if (updates.streetAddress !== undefined) {
      updateData.street_address = updates.streetAddress;
    }
    if (updates.aptUnit !== undefined) {
      updateData.apt_unit = updates.aptUnit || null;
    }
    if (updates.suburb !== undefined) {
      updateData.suburb = updates.suburb;
    }
    if (updates.city !== undefined) {
      updateData.city = updates.city;
    }
    if (updates.cleanerPreference !== undefined) {
      const normalizedPreference = normalizeCleanerPreference(updates.cleanerPreference);
      updateData.cleaner_preference = normalizedPreference;
      // Update assigned cleaner if preference is set
      updateData.assigned_cleaner_id = normalizedPreference !== "no-preference" ? normalizedPreference : null;
    }
    if (updates.specialInstructions !== undefined) {
      updateData.special_instructions = updates.specialInstructions || null;
    }
    if (updates.firstName !== undefined) {
      updateData.contact_first_name = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      updateData.contact_last_name = updates.lastName;
    }
    if (updates.email !== undefined) {
      updateData.contact_email = updates.email;
    }
    if (updates.phone !== undefined) {
      updateData.contact_phone = updates.phone;
    }
    if (updates.discountCode !== undefined) {
      updateData.discount_code = updates.discountCode || null;
    }
    if (updates.tip !== undefined) {
      updateData.tip_amount = updates.tip || 0;
    }

    // Recalculate price if relevant fields changed
    const needsPriceRecalculation = 
      updates.service !== undefined ||
      updates.bedrooms !== undefined ||
      updates.bathrooms !== undefined ||
      updates.officeSize !== undefined ||
      updates.extras !== undefined ||
      updates.frequency !== undefined ||
      updates.discountCode !== undefined;

    if (needsPriceRecalculation) {
      try {
        // Merge updates with existing booking data
        const updatedBookingData: BookingFormData = {
          service: updates.service ?? booking.service,
          bedrooms: updates.bedrooms ?? booking.bedrooms,
          bathrooms: updates.bathrooms ?? booking.bathrooms,
          officeSize: updates.officeSize ?? booking.officeSize,
          extras: updates.extras ?? booking.extras ?? [],
          scheduledDate: updates.scheduledDate ?? booking.scheduledDate,
          scheduledTime: updates.scheduledTime ?? booking.scheduledTime,
          streetAddress: updates.streetAddress ?? booking.streetAddress,
          aptUnit: updates.aptUnit ?? booking.aptUnit,
          suburb: updates.suburb ?? booking.suburb,
          city: updates.city ?? booking.city,
          cleanerPreference: updates.cleanerPreference ?? booking.cleanerPreference,
          frequency: updates.frequency ?? booking.frequency,
          firstName: updates.firstName ?? booking.firstName,
          lastName: updates.lastName ?? booking.lastName,
          email: updates.email ?? booking.email,
          phone: updates.phone ?? booking.phone,
          discountCode: updates.discountCode ?? booking.discountCode,
          tip: updates.tip ?? booking.tip,
          specialInstructions: updates.specialInstructions ?? booking.specialInstructions,
        };

        // Fetch pricing configuration and recalculate
        const pricingConfig = await fetchPricingConfig();
        const priceBreakdown = calculatePrice(updatedBookingData, pricingConfig, 0);
        
        updateData.total_amount = priceBreakdown.total;
        updateData.subtotal = priceBreakdown.subtotal;
        updateData.frequency_discount = priceBreakdown.frequencyDiscount;
        updateData.discount_code_discount = priceBreakdown.discountCodeDiscount;
        updateData.service_fee = priceBreakdown.serviceFee;
      } catch (error) {
        console.error("Failed to recalculate price (non-critical):", error);
        // Continue without price recalculation if it fails
      }
    }

    // Update booking
    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("booking_reference", bookingReference);

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return {
      success: true,
      message: "Booking updated successfully",
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to update booking: ${errorMessage}`,
    };
  }
}
