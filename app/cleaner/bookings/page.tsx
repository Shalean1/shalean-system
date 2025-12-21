import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getCleanerBookings } from "@/lib/storage/cleaner-bookings-supabase";
import BookingList from "@/components/cleaner/BookingList";

export default async function CleanerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
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
  const params = await searchParams;

  // Filter bookings by status if provided
  let filteredBookings = bookings;
  if (params.status) {
    const statuses = params.status.split(",");
    filteredBookings = bookings.filter((b) => statuses.includes(b.status));
  }

  // Filter by search term if provided
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.bookingReference.toLowerCase().includes(searchTerm) ||
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchTerm) ||
        b.streetAddress.toLowerCase().includes(searchTerm) ||
        b.suburb.toLowerCase().includes(searchTerm)
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bookings
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View and manage all your assigned cleaning jobs
          </p>
        </div>

        <BookingList
          bookings={filteredBookings}
          initialStatus={params.status}
          initialSearch={params.search}
        />
      </div>
    </div>
  );
}
