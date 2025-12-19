import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import {
  getCleanerBookingStats,
  getCleanerBookings,
} from "@/lib/storage/cleaner-bookings-supabase";
import { Booking } from "@/lib/types/booking";
import CleanerStats from "@/components/cleaner/CleanerStats";
import QuickActions from "@/components/cleaner/QuickActions";

export const dynamic = "force-dynamic";

export default async function CleanerDashboardPage() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      redirect("/cleaner/login");
    }

    // Check if user is a cleaner
    const cleaner = await getCurrentCleaner();

    if (!cleaner) {
      redirect("/cleaner/login");
    }

    // Fetch cleaner data with error handling
    let stats: {
      upcoming: number;
      today: number;
      new: number;
      past: number;
    };
    let bookings: Booking[] = [];

    try {
      [stats, bookings] = await Promise.all([
        getCleanerBookingStats(),
        getCleanerBookings(),
      ]);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      stats = {
        upcoming: 0,
        today: 0,
        new: 0,
        past: 0,
      };
      bookings = [];
    }

    return (
      <div className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-6">
            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Stats */}
          <div className="mb-6">
            <CleanerStats
              upcoming={stats.upcoming}
              today={stats.today}
              new={stats.new}
              past={stats.past}
              bookings={bookings}
            />
          </div>

        </div>
      </div>
    );
  } catch (error) {
    console.error("Cleaner dashboard page error:", error);
    // Re-throw to trigger error boundary
    throw error;
  }
}
