import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBookings } from "@/lib/storage/bookings-supabase";
import { MapPin, Calendar, Building2 } from "lucide-react";
import Link from "next/link";

interface UniqueAddress {
  streetAddress: string;
  aptUnit?: string;
  suburb: string;
  city: string;
  bookingCount: number;
  lastUsed?: string;
}

function getUniqueAddresses(bookings: any[]): UniqueAddress[] {
  const addressMap = new Map<string, UniqueAddress>();

  bookings.forEach((booking) => {
    // Create a unique key for each address
    const addressKey = `${booking.streetAddress}|${booking.aptUnit || ""}|${booking.suburb}|${booking.city}`.toLowerCase().trim();
    
    if (!addressMap.has(addressKey)) {
      addressMap.set(addressKey, {
        streetAddress: booking.streetAddress,
        aptUnit: booking.aptUnit,
        suburb: booking.suburb,
        city: booking.city,
        bookingCount: 0,
        lastUsed: booking.createdAt,
      });
    }

    const address = addressMap.get(addressKey)!;
    address.bookingCount += 1;
    
    // Update last used date if this booking is more recent
    if (booking.createdAt && (!address.lastUsed || booking.createdAt > address.lastUsed)) {
      address.lastUsed = booking.createdAt;
    }
  });

  // Sort by last used date (most recent first), then by booking count
  return Array.from(addressMap.values()).sort((a, b) => {
    if (a.lastUsed && b.lastUsed) {
      return b.lastUsed.localeCompare(a.lastUsed);
    }
    return b.bookingCount - a.bookingCount;
  });
}

export default async function LocationsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user bookings to extract addresses
  let addresses: UniqueAddress[] = [];
  try {
    const bookings = await getUserBookings();
    addresses = getUniqueAddresses(bookings);
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Saved Addresses
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            All addresses where you've booked cleaning services
          </p>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No saved addresses yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Your addresses will appear here after you make your first booking.
              </p>
              <Link
                href="/booking/service/standard/details"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Book a Service
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {address.streetAddress}
                        {address.aptUnit && (
                          <span className="text-gray-600 font-normal">, {address.aptUnit}</span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        {address.suburb}, {address.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>
                      <span className="font-semibold text-gray-900">{address.bookingCount}</span>{" "}
                      {address.bookingCount === 1 ? "booking" : "bookings"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      Last used: <span className="font-medium text-gray-900">{formatDate(address.lastUsed)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

