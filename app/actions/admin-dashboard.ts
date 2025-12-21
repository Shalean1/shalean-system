"use server";

import {
  getAdminDashboardMetrics,
  getRevenueTrends,
  getBookingsTrends,
  getServiceBreakdown,
  getBookingPipeline,
  getRecentBookings,
  getPendingCounts,
  type DateRange,
  type AdminDashboardMetrics,
  type RevenueTrend,
  type BookingsTrend,
  type ServiceBreakdown,
  type BookingPipeline,
  type PendingCounts,
} from "@/lib/storage/admin-supabase";
import { Booking } from "@/lib/types/booking";

/**
 * Get admin dashboard data
 */
export async function getAdminDashboardData(
  dateRange: DateRange = "today",
  customStart?: Date,
  customEnd?: Date
) {
  try {
    const [
      metrics,
      revenueTrends,
      bookingsTrends,
      serviceBreakdown,
      bookingPipeline,
      recentBookings,
      pendingCounts,
    ] = await Promise.all([
      getAdminDashboardMetrics(dateRange, customStart, customEnd),
      getRevenueTrends(dateRange, customStart, customEnd),
      getBookingsTrends(dateRange, customStart, customEnd),
      getServiceBreakdown(),
      getBookingPipeline(),
      getRecentBookings(10),
      getPendingCounts(),
    ]);

    return {
      metrics,
      revenueTrends,
      bookingsTrends,
      serviceBreakdown,
      bookingPipeline,
      recentBookings,
      pendingCounts,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
}
