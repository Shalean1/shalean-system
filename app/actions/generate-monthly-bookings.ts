"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { calculateRecurringDates, generateRecurringGroupId } from "@/lib/utils/recurring-bookings";
import { saveBooking, generateBookingId, generateBookingReference } from "@/lib/storage/bookings-supabase";
import { Booking } from "@/lib/types/booking";
import { calculatePrice, calculateCleanerEarnings } from "@/lib/pricing";
import { fetchPricingConfig } from "@/lib/pricing-server";

/**
 * Generate bookings for the next month from all active recurring schedules
 * This should be run monthly (e.g., via cron job or scheduled task)
 */
export async function generateMonthlyBookingsFromSchedules(): Promise<{
  success: boolean;
  message: string;
  generated: number;
  errors: string[];
}> {
  const supabase = createServiceRoleClient();
  const errors: string[] = [];
  let generated = 0;

  try {
    // Get all active recurring schedules
    const { data: schedules, error: fetchError } = await supabase
      .from("recurring_schedules")
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch recurring schedules: ${fetchError.message}`);
    }

    if (!schedules || schedules.length === 0) {
      return {
        success: true,
        message: "No active recurring schedules found",
        generated: 0,
        errors: [],
      };
    }

    const pricingConfig = await fetchPricingConfig();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Process each schedule
    for (const schedule of schedules) {
      try {
        const customer = schedule.customers;
        if (!customer) {
          errors.push(`Schedule ${schedule.id}: Customer not found`);
          continue;
        }

        // Check if bookings have already been generated for this month
        if (schedule.last_generated_month === currentMonth) {
          continue; // Already generated this month
        }

        // Determine the start date for next month's bookings
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        // Calculate the booking date based on schedule pattern
        let bookingDate: Date;
        
        if (schedule.day_of_week) {
          // Weekly/bi-weekly: use day_of_week
          const dayOfWeek = parseInt(schedule.day_of_week);
          const firstDayOfMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
          const firstDayWeekday = firstDayOfMonth.getDay();
          let daysToAdd = dayOfWeek - firstDayWeekday;
          if (daysToAdd < 0) daysToAdd += 7;
          
          bookingDate = new Date(firstDayOfMonth);
          bookingDate.setDate(firstDayOfMonth.getDate() + daysToAdd);
        } else if (schedule.day_of_month) {
          // Monthly: use day_of_month
          bookingDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), schedule.day_of_month);
          
          // Handle edge case: if day_of_month is greater than days in month
          const lastDayOfMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
          if (schedule.day_of_month > lastDayOfMonth) {
            bookingDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
          }
        } else {
          // Fallback to first day of next month
          bookingDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
        }

        // Generate bookings for the next month (1 month worth)
        const startDateStr = bookingDate.toISOString().split("T")[0];
        const recurringDates = calculateRecurringDates(
          schedule.frequency as "weekly" | "bi-weekly" | "monthly",
          startDateStr,
          1 // Generate 1 month only
        );

        if (recurringDates.length === 0) {
          continue;
        }

        // Get existing bookings for this customer/address to use as template
        const { data: existingBookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("contact_email", customer.email)
          .eq("street_address", schedule.address_line1)
          .eq("frequency", schedule.frequency)
          .eq("is_recurring", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Prepare booking data
        const bookingFormData: any = {
          service: schedule.service_type.toLowerCase(),
          frequency: schedule.frequency,
          scheduledDate: startDateStr,
          scheduledTime: schedule.preferred_time,
          bedrooms: parseInt(schedule.bedrooms) || 0,
          bathrooms: parseInt(schedule.bathrooms) || 1,
          extras: schedule.extras || [],
          streetAddress: schedule.address_line1,
          suburb: schedule.address_suburb,
          city: schedule.address_city,
          firstName: customer.first_name || "",
          lastName: customer.last_name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          cleanerPreference: existingBookings?.cleaner_preference || "no-preference",
          specialInstructions: schedule.notes || "",
        };

        // Calculate pricing
        const priceBreakdown = calculatePrice(bookingFormData, pricingConfig, 0);

        // Get cleaner earnings if cleaner is assigned
        let cleanerEarnings: number | undefined;
        let cleanerEarningsPercentage: number | undefined;
        let assignedCleanerId: string | null = null;

        if (schedule.cleaner_id) {
          // Get cleaner data (schedule.cleaner_id is UUID from cleaners.id)
          const { data: cleanerData } = await supabase
            .from("cleaners")
            .select("total_jobs, cleaner_id")
            .eq("id", schedule.cleaner_id)
            .single();
          
          // Set the cleaner_id for the booking (not the UUID)
          assignedCleanerId = cleanerData?.cleaner_id || null;

          if (cleanerData) {
            const cleanerTotalJobs = cleanerData.total_jobs || 0;
            const { data: settings } = await supabase
              .from("system_settings")
              .select("value")
              .eq("key", "old_cleaner_job_threshold")
              .single();

            const oldCleanerThreshold = settings?.value ? parseInt(settings.value, 10) : 50;
            
            const earningsResult = calculateCleanerEarnings(
              priceBreakdown,
              cleanerTotalJobs,
              oldCleanerThreshold
            );

            cleanerEarnings = earningsResult.totalEarnings;
            cleanerEarningsPercentage = earningsResult.earningsPercentage;
          }
        } else if (schedule.cleaner_earnings) {
          // Use stored cleaner earnings
          cleanerEarnings = parseFloat(schedule.cleaner_earnings.toString()) / 100;
        }
        
        // Use assigned cleaner from schedule or from existing booking
        if (assignedCleanerId) {
          bookingFormData.cleanerPreference = assignedCleanerId;
        }

        // Use stored total amount if available, otherwise use calculated
        const totalAmount = schedule.total_amount 
          ? parseFloat(schedule.total_amount.toString()) / 100 
          : priceBreakdown.total;

        // Generate recurring group ID for linking
        const recurringGroupId = generateRecurringGroupId();

        // Create bookings for each date
        for (let i = 0; i < recurringDates.length; i++) {
          const bookingId = generateBookingId();
          const bookingReference = generateBookingReference();
          const bookingDateStr = recurringDates[i];

          const booking: Booking = {
            ...bookingFormData,
            id: bookingId,
            bookingReference,
            scheduledDate: bookingDateStr,
            createdAt: new Date().toISOString(),
            totalAmount,
            paymentStatus: "pending" as const,
            status: "pending" as const,
            subtotal: priceBreakdown.subtotal,
            frequencyDiscount: priceBreakdown.frequencyDiscount,
            discountCodeDiscount: priceBreakdown.discountCodeDiscount,
            serviceFee: priceBreakdown.serviceFee,
            cleanerEarnings,
            cleanerEarningsPercentage,
            recurringGroupId,
            recurringSequence: i,
            isRecurring: true,
            paymentReference: null,
          };

          try {
            await saveBooking(booking);
            generated++;
          } catch (saveError) {
            errors.push(`Failed to save booking for schedule ${schedule.id}, date ${bookingDateStr}: ${saveError instanceof Error ? saveError.message : "Unknown error"}`);
          }
        }

        // Update last_generated_month
        await supabase
          .from("recurring_schedules")
          .update({ last_generated_month: currentMonth })
          .eq("id", schedule.id);

      } catch (error) {
        errors.push(`Error processing schedule ${schedule.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Generated ${generated} bookings from ${schedules.length} schedules. ${errors.length > 0 ? `${errors.length} errors occurred.` : ""}`,
      generated,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to generate monthly bookings: ${error instanceof Error ? error.message : "Unknown error"}`,
      generated,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

