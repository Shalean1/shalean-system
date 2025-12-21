"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Booking } from "@/lib/types/booking";

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
    totalAmount: parseFloat(data.total_amount || 0),
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    cleanerEarnings: data.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: data.cleaner_earnings_percentage ?? undefined,
    recurringGroupId: data.recurring_group_id ?? undefined,
    recurringSequence: data.recurring_sequence ?? undefined,
    parentBookingId: data.parent_booking_id ?? undefined,
    isRecurring: data.is_recurring ?? false,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    cleanerResponse: data.cleaner_response || null,
    jobProgress: data.job_progress || null,
    createdAt: data.created_at,
  };
}

/**
 * Payment interface for the payments page
 */
export interface Payment {
  id: string;
  bookingReference: string;
  paymentReference: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  tip: number;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  bookingId: string;
}

/**
 * Get all payments (from bookings table)
 */
export async function getAllPayments(): Promise<Payment[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  return (data || []).map((booking: any) => ({
    id: booking.id,
    bookingReference: booking.booking_reference,
    paymentReference: booking.payment_reference || null,
    customerName: `${booking.contact_first_name} ${booking.contact_last_name}`,
    customerEmail: booking.contact_email,
    customerPhone: booking.contact_phone,
    amount: parseFloat(booking.total_amount || 0) - parseFloat(booking.tip_amount || 0),
    tip: parseFloat(booking.tip_amount || 0),
    totalAmount: parseFloat(booking.total_amount || 0),
    paymentStatus: booking.payment_status || "pending",
    createdAt: booking.created_at,
    bookingId: booking.id,
  }));
}

/**
 * Get payment statistics
 */
export async function getPaymentStats() {
  const supabase = createServiceRoleClient();
  
  const [totalResult, statusResult] = await Promise.all([
    // Total count
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true }),
    
    // Count by payment status
    supabase
      .from("bookings")
      .select("payment_status, total_amount, tip_amount"),
  ]);

  // Count by payment status
  const byStatus: Record<string, number> = {};
  let totalRevenue = 0;
  let totalTips = 0;
  
  (statusResult.data || []).forEach((booking) => {
    const status = booking.payment_status || "pending";
    byStatus[status] = (byStatus[status] || 0) + 1;
    
    // Calculate revenue (only for completed payments)
    if (status === "completed") {
      totalRevenue += parseFloat(booking.total_amount || 0);
      totalTips += parseFloat(booking.tip_amount || 0);
    }
  });

  return {
    total: totalResult.count || 0,
    byStatus,
    totalRevenue,
    totalTips,
    completedCount: byStatus.completed || 0,
    pendingCount: byStatus.pending || 0,
    failedCount: byStatus.failed || 0,
  };
}
