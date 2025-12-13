import { Booking } from "@/lib/types/booking";
import { createClient } from "@/lib/supabase/server";

/**
 * Save a booking to Supabase
 */
export async function saveBooking(booking: Booking): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bookings")
    .insert({
      id: booking.id,
      booking_reference: booking.bookingReference,
      service_type: booking.service,
      frequency: booking.frequency,
      scheduled_date: booking.scheduledDate,
      scheduled_time: booking.scheduledTime,
      bedrooms: booking.bedrooms,
      bathrooms: booking.bathrooms,
      extras: booking.extras,
      street_address: booking.streetAddress,
      apt_unit: booking.aptUnit,
      suburb: booking.suburb,
      city: booking.city,
      cleaner_preference: booking.cleanerPreference,
      special_instructions: booking.specialInstructions,
      contact_first_name: booking.firstName,
      contact_last_name: booking.lastName,
      contact_email: booking.email,
      contact_phone: booking.phone,
      discount_code: booking.discountCode,
      total_amount: booking.totalAmount,
      status: booking.status,
      payment_status: booking.paymentStatus,
      payment_reference: booking.paymentReference,
      created_at: booking.createdAt,
    });

  if (error) {
    throw new Error(`Failed to save booking: ${error.message}`);
  }
}

/**
 * Get all bookings from Supabase
 */
export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Find booking by reference
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_reference", reference)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data ? mapDatabaseToBooking(data) : null;
}

/**
 * Get bookings for current user
 */
export async function getUserBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get bookings for a specific email (for non-authenticated users)
 */
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  reference: string,
  status: Booking["status"]
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  reference: string,
  paymentStatus: Booking["paymentStatus"],
  paymentReference?: string
): Promise<void> {
  const supabase = await createClient();
  
  const updates: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentReference) {
    updates.payment_reference = paymentReference;
  }

  const { error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
}

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SHL-${timestamp}-${random}`;
}

/**
 * Generate a unique booking ID
 */
export function generateBookingId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Map database record to Booking type
 */
function mapDatabaseToBooking(data: any): Booking {
  return {
    id: data.id,
    bookingReference: data.booking_reference,
    service: data.service_type,
    frequency: data.frequency,
    scheduledDate: data.scheduled_date,
    scheduledTime: data.scheduled_time,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    extras: data.extras || [],
    streetAddress: data.street_address,
    aptUnit: data.apt_unit,
    suburb: data.suburb,
    city: data.city,
    cleanerPreference: data.cleaner_preference,
    specialInstructions: data.special_instructions,
    firstName: data.contact_first_name,
    lastName: data.contact_last_name,
    email: data.contact_email,
    phone: data.contact_phone,
    discountCode: data.discount_code,
    totalAmount: data.total_amount,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    createdAt: data.created_at,
  };
}
