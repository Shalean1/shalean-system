import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getCleanerBookings } from "@/lib/storage/cleaner-bookings-supabase";
import ScheduleCalendar from "@/components/cleaner/ScheduleCalendar";

export default async function CleanerSchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
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

  const bookings = await getCleanerBookings();

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Schedule
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View your assigned cleaning jobs on the calendar
          </p>
        </div>

        <ScheduleCalendar bookings={bookings} />
      </div>
    </div>
  );
}
