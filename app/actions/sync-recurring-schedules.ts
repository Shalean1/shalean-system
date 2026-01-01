"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateRecurringGroupId } from "@/lib/utils/recurring-bookings";

/**
 * Sync recurring bookings from bookings table to recurring_schedules table
 * This creates schedule templates from existing recurring bookings
 */
export async function syncRecurringBookingsToSchedules(): Promise<{
  success: boolean;
  message: string;
  created: number;
  errors: string[];
}> {
  const supabase = createServiceRoleClient();
  const errors: string[] = [];
  let created = 0;

  try {
    // Get all unique recurring booking groups
    const { data: recurringBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("is_recurring", true)
      .not("recurring_group_id", "is", null)
      .order("recurring_group_id")
      .order("recurring_sequence", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch recurring bookings: ${fetchError.message}`);
    }

    if (!recurringBookings || recurringBookings.length === 0) {
      return {
        success: true,
        message: "No recurring bookings found to sync",
        created: 0,
        errors: [],
      };
    }

    // Group bookings by recurring_group_id
    const groups = new Map<string, typeof recurringBookings>();
    recurringBookings.forEach((booking) => {
      const groupId = booking.recurring_group_id;
      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }
      groups.get(groupId)!.push(booking);
    });

    // For each group, create or update a recurring schedule
    for (const [groupId, bookings] of groups.entries()) {
      try {
        // Get the first booking (sequence 0) as the template
        const firstBooking = bookings.find((b) => b.recurring_sequence === 0) || bookings[0];
        
        if (!firstBooking) continue;

        // Find or create customer record
        let customerId: string;
        
        // Try to find customer by email
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", firstBooking.contact_email)
          .maybeSingle();

        if (existingCustomer && existingCustomer.id) {
          customerId = existingCustomer.id;
          
          // Check if a schedule already exists for this customer/service/frequency
          const { data: existingSchedule } = await supabase
            .from("recurring_schedules")
            .select("id")
            .eq("customer_id", customerId)
            .eq("service_type", firstBooking.service_type.charAt(0).toUpperCase() + firstBooking.service_type.slice(1))
            .eq("frequency", firstBooking.frequency)
            .maybeSingle();

          if (existingSchedule) {
            // Schedule already exists, skip
            continue;
          }
        } else {
          // Create customer record (generate UUID for id)
          const customerIdNew = crypto.randomUUID();
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              id: customerIdNew,
              first_name: firstBooking.contact_first_name || "Unknown",
              last_name: firstBooking.contact_last_name || "Customer",
              email: firstBooking.contact_email || null,
              phone: firstBooking.contact_phone || null,
              address_line1: firstBooking.street_address || null,
              address_suburb: firstBooking.suburb || null,
              address_city: firstBooking.city || null,
              role: "customer",
            })
            .select("id")
            .single();

          if (customerError || !newCustomer) {
            errors.push(`Failed to create customer for ${firstBooking.contact_email}: ${customerError?.message}`);
            continue;
          }

          customerId = newCustomer.id;
        }

        // Determine day_of_week from first booking date
        const firstDate = new Date(firstBooking.scheduled_date);
        const dayOfWeek = firstDate.getDay().toString(); // 0 = Sunday, 6 = Saturday
        const dayOfMonth = firstDate.getDate();

        // Convert time to proper format
        const preferredTime = firstBooking.scheduled_time.includes(":") 
          ? firstBooking.scheduled_time 
          : `${firstBooking.scheduled_time}:00`;

        // Create recurring schedule
        const { error: insertError } = await supabase
          .from("recurring_schedules")
          .insert({
            id: crypto.randomUUID(),
            customer_id: customerId,
            service_type: firstBooking.service_type.charAt(0).toUpperCase() + firstBooking.service_type.slice(1),
            frequency: firstBooking.frequency,
            day_of_week: dayOfWeek,
            day_of_month: dayOfMonth,
            preferred_time: preferredTime,
            bedrooms: firstBooking.bedrooms?.toString() || "0",
            bathrooms: firstBooking.bathrooms?.toString() || "1",
            extras: firstBooking.extras || [],
            address_line1: firstBooking.street_address,
            address_suburb: firstBooking.suburb,
            address_city: firstBooking.city,
            cleaner_id: firstBooking.assigned_cleaner_id ? 
              (await getCleanerIdFromCleanerId(firstBooking.assigned_cleaner_id)) : null,
            is_active: true,
            start_date: firstBooking.scheduled_date,
            total_amount: firstBooking.total_amount ? Math.round(parseFloat(firstBooking.total_amount) * 100) : null,
            cleaner_earnings: firstBooking.cleaner_earnings ? Math.round(parseFloat(firstBooking.cleaner_earnings) * 100) : null,
            notes: firstBooking.special_instructions || null,
          });

        if (insertError) {
          errors.push(`Failed to create schedule for group ${groupId}: ${insertError.message}`);
        } else {
          created++;
        }
      } catch (error) {
        errors.push(`Error processing group ${groupId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Synced ${created} recurring schedules. ${errors.length > 0 ? `${errors.length} errors occurred.` : ""}`,
      created,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to sync recurring schedules: ${error instanceof Error ? error.message : "Unknown error"}`,
      created,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Helper function to get cleaner UUID from cleaner_id (e.g., "natasha-m")
 */
async function getCleanerIdFromCleanerId(cleanerId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();
  
  const { data: cleaner } = await supabase
    .from("cleaners")
    .select("id")
    .eq("cleaner_id", cleanerId)
    .single();

  return cleaner?.id || null;
}

