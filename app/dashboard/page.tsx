import { createClient } from "@/lib/supabase/server";
import { getUserBookings, getBookingCounts, getUpcomingBookings, getSpendingAnalytics } from "@/lib/storage/bookings-supabase";
import { getUserDisplayName } from "@/lib/storage/profile-supabase";
import { Booking } from "@/lib/types/booking";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import AnalyticsSummary from "@/components/dashboard/AnalyticsSummary";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Note: Authentication is already handled in the layout
    // User is guaranteed to be authenticated at this point

  // Fetch user data with error handling
  let bookings: Booking[];
  let counts: { upcoming: number; today: number; new: number; past: number };
  let upcomingBookings: Booking[];
  let displayName: string;
  let spendingAnalytics: {
    totalSpent: number;
    averageBookingValue: number;
    totalPaid: number;
    pendingPayments: number;
    completedBookings: number;
    mostBookedService: string | null;
    favoriteFrequency: string | null;
  };
  
  try {
    [bookings, counts, upcomingBookings, displayName, spendingAnalytics] = await Promise.all([
      getUserBookings(),
      getBookingCounts(),
      getUpcomingBookings(),
      getUserDisplayName(),
      getSpendingAnalytics(),
    ]);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return default values on error
    bookings = [];
    counts = { upcoming: 0, today: 0, new: 0, past: 0 };
    upcomingBookings = [];
    displayName = user?.email?.split("@")[0] || "User";
    spendingAnalytics = {
      totalSpent: 0,
      averageBookingValue: 0,
      totalPaid: 0,
      pendingPayments: 0,
      completedBookings: 0,
      mostBookedService: null,
      favoriteFrequency: null,
    };
  }

  // Get next appointment for countdown
  const nextAppointment = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  return (
    <div className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Manage your cleaning service bookings and appointments
              </p>
            </div>
            {nextAppointment && nextAppointment.scheduledDate && nextAppointment.scheduledTime && (
              <CountdownTimer
                scheduledDate={nextAppointment.scheduledDate}
                scheduledTime={nextAppointment.scheduledTime}
              />
            )}
          </div>
          
          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <DashboardStats
            upcoming={counts.upcoming}
            today={counts.today}
            new={counts.new}
            past={counts.past}
            bookings={bookings}
          />
        </div>

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1">
            <RecentActivity bookings={bookings} />
          </div>
          <div className="lg:col-span-2">

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Upcoming Appointments
                </h2>
                {upcomingBookings.length > 0 && (
                  <Link
                    href="/dashboard/bookings"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    View all →
                  </Link>
                )}
              </div>
              
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 3).map((booking) => {
                const formatServiceType = (service: string) => {
                  return service
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                };

                const formatDate = (dateString: string | null) => {
                  if (!dateString) return "Not scheduled";
                  return new Date(dateString).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                };

                const formatTime = (timeString: string | null) => {
                  if (!timeString) return "";
                  const [hours, minutes] = timeString.split(":");
                  const hour = parseInt(hours, 10);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const displayHour = hour % 12 || 12;
                  return `${displayHour}:${minutes} ${ampm}`;
                };

                    return (
                      <Link
                        key={booking.id}
                        href={`/dashboard/bookings/${booking.bookingReference}`}
                        className="group block p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                              {formatServiceType(booking.service)}
                            </h3>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span className="truncate">
                                  {formatDate(booking.scheduledDate)}
                                  {booking.scheduledTime && ` at ${formatTime(booking.scheduledTime)}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span className="truncate">
                                  {booking.streetAddress}
                                  {booking.aptUnit && `, ${booking.aptUnit}`}, {booking.suburb}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              R{booking.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No upcoming appointments
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Schedule your next cleaning service
                  </p>
                  <Link
                    href="/booking/service/standard/details"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Service
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error("Dashboard page error:", error);
    // Re-throw to trigger error boundary
    throw error;
  }
}
