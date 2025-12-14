import { Booking, normalizeCleanerPreference } from "@/lib/types/booking";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Save a booking to Supabase
 * Uses service role client to bypass RLS and ensure booking is always created
 */
export async function saveBooking(booking: Booking): Promise<void> {
  // Use service role client for inserts to ensure they always succeed
  // Falls back to regular client if service role key is not configured
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
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
      extras: booking.extras || [],
      street_address: booking.streetAddress,
      apt_unit: booking.aptUnit || null,
      suburb: booking.suburb,
      city: booking.city,
      cleaner_preference: normalizeCleanerPreference(booking.cleanerPreference),
      special_instructions: booking.specialInstructions || null,
      contact_first_name: booking.firstName,
      contact_last_name: booking.lastName,
      contact_email: booking.email,
      contact_phone: booking.phone,
      discount_code: booking.discountCode || null,
      tip_amount: booking.tip || 0,
      total_amount: booking.totalAmount,
      status: booking.status,
      payment_status: booking.paymentStatus,
      payment_reference: booking.paymentReference || null,
      created_at: booking.createdAt,
    })
    .select();

  if (error) {
    console.error("Supabase insert error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        service: booking.service,
        cleanerPreference: booking.cleanerPreference,
        normalizedCleanerPreference: normalizeCleanerPreference(booking.cleanerPreference),
      },
    });
    throw new Error(`Failed to save booking: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("No data returned from insert:", booking);
    throw new Error("Failed to save booking: No data returned from database");
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
 * Find booking by payment reference
 * Used to check if a booking already exists for a payment
 */
export async function getBookingByPaymentReference(paymentReference: string): Promise<Booking | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("payment_reference", paymentReference)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch booking by payment reference: ${error.message}`);
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
 * Get upcoming bookings for current user
 */
export async function getUpcomingBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch upcoming bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get booking counts for current user
 */
export async function getBookingCounts(): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("status, scheduled_date")
    .eq("contact_email", user.email);

  if (error) {
    throw new Error(`Failed to fetch booking counts: ${error.message}`);
  }

  const bookings = data || [];
  const today = new Date().toISOString().split('T')[0];

  const counts = {
    total: bookings.length,
    upcoming: bookings.filter(
      (b) => 
        (b.status === "pending" || b.status === "confirmed") && 
        b.scheduled_date >= today
    ).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return counts;
}

/**
 * Get spending analytics for current user
 */
export async function getSpendingAnalytics(): Promise<{
  totalSpent: number;
  averageBookingValue: number;
  totalPaid: number;
  pendingPayments: number;
  completedBookings: number;
  mostBookedService: string | null;
  favoriteFrequency: string | null;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      totalSpent: 0,
      averageBookingValue: 0,
      totalPaid: 0,
      pendingPayments: 0,
      completedBookings: 0,
      mostBookedService: null,
      favoriteFrequency: null,
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("total_amount, payment_status, status, service_type, frequency")
    .eq("contact_email", user.email);

  if (error) {
    throw new Error(`Failed to fetch spending analytics: ${error.message}`);
  }

  const bookings = data || [];
  
  // Calculate totals
  const totalSpent = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const totalPaid = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const pendingPayments = bookings
    .filter((b) => b.payment_status === "pending" && (b.status === "pending" || b.status === "confirmed"))
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  
  const paidBookings = bookings.filter((b) => b.payment_status === "completed");
  const averageBookingValue = paidBookings.length > 0
    ? totalPaid / paidBookings.length
    : 0;
  
  // Find most booked service
  const serviceCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.service_type) {
      serviceCounts[b.service_type] = (serviceCounts[b.service_type] || 0) + 1;
    }
  });
  const mostBookedService = Object.keys(serviceCounts).length > 0
    ? Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  
  // Find favorite frequency
  const frequencyCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.frequency) {
      frequencyCounts[b.frequency] = (frequencyCounts[b.frequency] || 0) + 1;
    }
  });
  const favoriteFrequency = Object.keys(frequencyCounts).length > 0
    ? Object.entries(frequencyCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return {
    totalSpent,
    averageBookingValue,
    totalPaid,
    pendingPayments,
    completedBookings,
    mostBookedService,
    favoriteFrequency,
  };
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
    tip: data.tip_amount || 0,
    totalAmount: data.total_amount,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    createdAt: data.created_at,
  };
}

