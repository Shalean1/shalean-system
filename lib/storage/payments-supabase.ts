import { createClient } from "@/lib/supabase/server";
import { Booking } from "@/lib/types/booking";

export interface Payment {
  id: string;
  bookingReference: string;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentReference?: string;
  paymentMethod?: string;
  createdAt: string;
  booking: {
    service: string;
    scheduledDate: string;
    scheduledTime: string;
    status: Booking["status"];
  };
}

/**
 * Get all payments for the current user
 * Payments are derived from bookings
 */
export async function getUserPayments(): Promise<Payment[]> {
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
    console.error("Error fetching payments:", error);
    const errorMessage = error.message || error.details || "Unknown error";
    throw new Error(`Failed to fetch payments: ${errorMessage}`);
  }

  return (data || []).map(mapDatabaseToPayment);
}

/**
 * Map database booking record to Payment type
 */
function mapDatabaseToPayment(data: any): Payment {
  return {
    id: data.id,
    bookingReference: data.booking_reference,
    amount: data.total_amount,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    paymentMethod: data.payment_reference ? "Paystack" : undefined,
    createdAt: data.created_at,
    booking: {
      service: data.service_type,
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      status: data.status,
    },
  };
}
























