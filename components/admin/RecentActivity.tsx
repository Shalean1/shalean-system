import Link from "next/link";
import { Booking } from "@/lib/types/booking";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

interface RecentActivityProps {
  bookings: Booking[];
}

export default function RecentActivity({ bookings }: RecentActivityProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
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

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600 mt-1">Latest bookings and updates</p>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings`}
              className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {booking.firstName} {booking.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatServiceType(booking.service)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(booking.scheduledDate)} • {formatTime(booking.scheduledTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    R{booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      {bookings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/admin/bookings"
            className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all bookings ({bookings.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
