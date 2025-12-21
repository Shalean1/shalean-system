import { createServiceRoleClient } from "@/lib/supabase/server";
import { Booking } from "@/lib/types/booking";

/**
 * Admin data fetching functions
 * Uses service role client to bypass RLS for admin access
 */

export type DateRange = "today" | "last7days" | "last30days" | "lastyear" | "custom";

export interface AdminDashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  activeCustomers: number;
  avgBookingValue: number;
  revenueChange: number; // percentage change vs previous period
  bookingsChange: number;
  customersChange: number;
  avgBookingValueChange: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface BookingsTrend {
  date: string;
  bookings: number;
}

export interface ServiceBreakdown {
  service: string;
  count: number;
  percentage: number;
}

export interface BookingPipeline {
  status: string;
  count: number;
}

export interface PendingCounts {
  pendingQuotes: number;
  pendingApplications: number;
  pendingBookings: number;
}

/**
 * Get date range boundaries
 */
function getDateRange(dateRange: DateRange, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start = new Date();
  
  switch (dateRange) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "last7days":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "last30days":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "lastyear":
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (customStart && customEnd) {
        start = customStart;
        end.setTime(customEnd.getTime());
        end.setHours(23, 59, 59, 999);
      }
      break;
  }
  
  return { start, end };
}

/**
 * Get previous period for comparison
 */
function getPreviousPeriod(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

/**
 * Format date as ISO string for database queries
 */
function formatDateForDB(date: Date): string {
  return date.toISOString();
}

/**
 * Get admin dashboard metrics
 */
export async function getAdminDashboardMetrics(
  dateRange: DateRange = "today",
  customStart?: Date,
  customEnd?: Date
): Promise<AdminDashboardMetrics> {
  const supabase = createServiceRoleClient();
  const { start, end } = getDateRange(dateRange, customStart, customEnd);
  const { start: prevStart, end: prevEnd } = getPreviousPeriod(start, end);
  
  const startStr = formatDateForDB(start);
  const endStr = formatDateForDB(end);
  const prevStartStr = formatDateForDB(prevStart);
  const prevEndStr = formatDateForDB(prevEnd);
  
  // Current period queries
  const [revenueResult, bookingsResult, customersResult, prevRevenueResult, prevBookingsResult, prevCustomersResult] = await Promise.all([
    // Current period revenue (completed payments)
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("payment_status", "completed")
      .gte("created_at", startStr)
      .lte("created_at", endStr),
    
    // Current period bookings count
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startStr)
      .lte("created_at", endStr),
    
    // Current period unique customers
    supabase
      .from("bookings")
      .select("contact_email")
      .gte("created_at", startStr)
      .lte("created_at", endStr),
    
    // Previous period revenue
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("payment_status", "completed")
      .gte("created_at", prevStartStr)
      .lte("created_at", prevEndStr),
    
    // Previous period bookings count
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevStartStr)
      .lte("created_at", prevEndStr),
    
    // Previous period unique customers
    supabase
      .from("bookings")
      .select("contact_email")
      .gte("created_at", prevStartStr)
      .lte("created_at", prevEndStr),
  ]);
  
  // Calculate current period metrics
  const totalRevenue = (revenueResult.data || []).reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const totalBookings = bookingsResult.count || 0;
  const uniqueEmails = new Set((customersResult.data || []).map(b => b.contact_email));
  const activeCustomers = uniqueEmails.size;
  const avgBookingValue = totalRevenue > 0 && revenueResult.data ? totalRevenue / revenueResult.data.length : 0;
  
  // Calculate previous period metrics
  const prevRevenue = (prevRevenueResult.data || []).reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const prevBookings = prevBookingsResult.count || 0;
  const prevUniqueEmails = new Set((prevCustomersResult.data || []).map(b => b.contact_email));
  const prevCustomers = prevUniqueEmails.size;
  const prevAvgBookingValue = prevRevenue > 0 && prevRevenueResult.data ? prevRevenue / prevRevenueResult.data.length : 0;
  
  // Calculate percentage changes
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const bookingsChange = prevBookings > 0 ? ((totalBookings - prevBookings) / prevBookings) * 100 : 0;
  const customersChange = prevCustomers > 0 ? ((activeCustomers - prevCustomers) / prevCustomers) * 100 : 0;
  const avgBookingValueChange = prevAvgBookingValue > 0 ? ((avgBookingValue - prevAvgBookingValue) / prevAvgBookingValue) * 100 : 0;
  
  return {
    totalRevenue,
    totalBookings,
    activeCustomers,
    avgBookingValue,
    revenueChange,
    bookingsChange,
    customersChange,
    avgBookingValueChange,
  };
}

/**
 * Get revenue trends over time
 */
export async function getRevenueTrends(
  dateRange: DateRange = "today",
  customStart?: Date,
  customEnd?: Date
): Promise<RevenueTrend[]> {
  const supabase = createServiceRoleClient();
  const { start, end } = getDateRange(dateRange, customStart, customEnd);
  
  const startStr = formatDateForDB(start);
  const endStr = formatDateForDB(end);
  
  const { data, error } = await supabase
    .from("bookings")
    .select("total_amount, created_at")
    .eq("payment_status", "completed")
    .gte("created_at", startStr)
    .lte("created_at", endStr)
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("Error fetching revenue trends:", error);
    return [];
  }
  
  // Group by date (date only, not time)
  const dateMap = new Map<string, number>();
  
  (data || []).forEach((booking) => {
    const date = new Date(booking.created_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const current = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, current + parseFloat(booking.total_amount || 0));
  });
  
  // Convert to array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get bookings trends over time
 */
export async function getBookingsTrends(
  dateRange: DateRange = "today",
  customStart?: Date,
  customEnd?: Date
): Promise<BookingsTrend[]> {
  const supabase = createServiceRoleClient();
  const { start, end } = getDateRange(dateRange, customStart, customEnd);
  
  const startStr = formatDateForDB(start);
  const endStr = formatDateForDB(end);
  
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at")
    .gte("created_at", startStr)
    .lte("created_at", endStr)
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("Error fetching bookings trends:", error);
    return [];
  }
  
  // Group by date (date only, not time)
  const dateMap = new Map<string, number>();
  
  (data || []).forEach((booking) => {
    const date = new Date(booking.created_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const current = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, current + 1);
  });
  
  // Convert to array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, bookings]) => ({ date, bookings }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get service breakdown
 */
export async function getServiceBreakdown(): Promise<ServiceBreakdown[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("service_type");
  
  if (error) {
    console.error("Error fetching service breakdown:", error);
    return [];
  }
  
  // Count by service type
  const serviceMap = new Map<string, number>();
  const total = (data || []).length;
  
  (data || []).forEach((booking) => {
    const service = booking.service_type || "unknown";
    const current = serviceMap.get(service) || 0;
    serviceMap.set(service, current + 1);
  });
  
  // Convert to array with percentages
  return Array.from(serviceMap.entries())
    .map(([service, count]) => ({
      service: service.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get booking pipeline (status distribution)
 */
export async function getBookingPipeline(): Promise<BookingPipeline[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("status, cleaner_response");
  
  if (error) {
    console.error("Error fetching booking pipeline:", error);
    return [];
  }
  
  // Count by status, separating "confirmed" and "accepted"
  const statusMap = new Map<string, number>();
  
  (data || []).forEach((booking) => {
    const status = booking.status || "unknown";
    let displayStatus = status;
    
    // If status is "confirmed" and cleaner_response is "accepted", display as "accepted"
    if (status === "confirmed" && booking.cleaner_response === "accepted") {
      displayStatus = "accepted";
    } else if (status === "confirmed") {
      // Keep as "confirmed" if cleaner_response is not "accepted"
      displayStatus = "confirmed";
    }
    
    const current = statusMap.get(displayStatus) || 0;
    statusMap.set(displayStatus, current + 1);
  });
  
  // Convert to array
  return Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status: status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      count,
    }))
    .sort((a, b) => {
      // Sort by status order: pending, confirmed, accepted, in-progress, completed
      const order = ["Pending", "Confirmed", "Accepted", "In Progress", "Completed", "Cancelled"];
      const aIndex = order.indexOf(a.status);
      const bIndex = order.indexOf(b.status);
      if (aIndex === -1 && bIndex === -1) return a.status.localeCompare(b.status);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
}

/**
 * Get recent bookings
 */
export async function getRecentBookings(limit: number = 10): Promise<Booking[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
  
  // Map to Booking type
  return (data || []).map((booking: any) => ({
    id: booking.id,
    bookingReference: booking.booking_reference,
    service: booking.service_type,
    frequency: booking.frequency,
    scheduledDate: booking.scheduled_date,
    scheduledTime: booking.scheduled_time,
    bedrooms: booking.bedrooms,
    bathrooms: booking.bathrooms,
    extras: booking.extras || [],
    streetAddress: booking.street_address,
    aptUnit: booking.apt_unit,
    suburb: booking.suburb,
    city: booking.city,
    cleanerPreference: booking.cleaner_preference,
    specialInstructions: booking.special_instructions,
    firstName: booking.contact_first_name,
    lastName: booking.contact_last_name,
    email: booking.contact_email,
    phone: booking.contact_phone,
    discountCode: booking.discount_code,
    tip: booking.tip_amount || 0,
    totalAmount: parseFloat(booking.total_amount || 0),
    subtotal: booking.subtotal ?? undefined,
    frequencyDiscount: booking.frequency_discount ?? undefined,
    discountCodeDiscount: booking.discount_code_discount ?? undefined,
    serviceFee: booking.service_fee ?? undefined,
    cleanerEarnings: booking.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: booking.cleaner_earnings_percentage ?? undefined,
    status: booking.status,
    paymentStatus: booking.payment_status,
    paymentReference: booking.payment_reference,
    cleanerResponse: booking.cleaner_response || null,
    jobProgress: booking.job_progress || null,
    createdAt: booking.created_at,
  }));
}

/**
 * Get pending counts
 */
export async function getPendingCounts(): Promise<PendingCounts> {
  const supabase = createServiceRoleClient();
  
  const [pendingBookingsResult, pendingApplicationsResult] = await Promise.all([
    // Pending bookings (status = pending)
    supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
    
    // Pending applications (status = pending AND cleaner_response IS NULL)
    supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "pending")
      .is("cleaner_response", null),
  ]);
  
  return {
    pendingQuotes: pendingBookingsResult.count || 0, // Same as pending bookings for now
    pendingApplications: pendingApplicationsResult.count || 0,
    pendingBookings: pendingBookingsResult.count || 0,
  };
}
