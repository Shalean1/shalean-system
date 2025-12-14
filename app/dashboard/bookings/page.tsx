import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBookings } from "@/lib/storage/bookings-supabase";
import BookingList from "@/components/dashboard/BookingList";

export default async function BookingsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const bookings = await getUserBookings();

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View and manage all your cleaning service bookings
          </p>
        </div>

        <BookingList bookings={bookings} />
      </div>
    </div>
  );
}
