import Link from "next/link";
import { Booking } from "@/lib/types/booking";
import StatusBadge from "./StatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { Calendar, MapPin, Clock } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    // Convert 24h format to 12h format
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
    <Link
      href={`/dashboard/bookings/${booking.bookingReference}`}
      className="group block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {formatServiceType(booking.service)}
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            {booking.bookingReference}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <StatusBadge status={booking.status} />
          <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <div className="p-1 bg-blue-50 rounded group-hover:bg-blue-100 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <span className="break-words pt-0.5">
            {formatDate(booking.scheduledDate)}{" "}
            {booking.scheduledTime && formatTime(booking.scheduledTime)}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <div className="p-1 bg-blue-50 rounded group-hover:bg-blue-100 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <span className="break-words pt-0.5">
            {booking.streetAddress}
            {booking.aptUnit && `, ${booking.aptUnit}`}, {booking.suburb}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="p-1 bg-blue-50 rounded group-hover:bg-blue-100 transition-colors">
            <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <span>
            {booking.service === 'carpet-cleaning' ? (
              <>
                {((booking.fittedRoomsCount ?? 0) > 0 || (booking.looseCarpetsCount ?? 0) > 0) && (
                  <>
                    {(booking.fittedRoomsCount ?? 0) > 0 && (
                      <>{booking.fittedRoomsCount} fitted room{(booking.fittedRoomsCount ?? 0) !== 1 ? 's' : ''}</>
                    )}
                    {(booking.fittedRoomsCount ?? 0) > 0 && (booking.looseCarpetsCount ?? 0) > 0 && ', '}
                    {(booking.looseCarpetsCount ?? 0) > 0 && (
                      <>{booking.looseCarpetsCount} loose carpet{(booking.looseCarpetsCount ?? 0) !== 1 ? 's' : ''}</>
                    )}
                    {' • '}
                  </>
                )}
              </>
            ) : (
              <>
                {booking.bedrooms} bed, {booking.bathrooms} bath •{" "}
              </>
            )}
            {booking.frequency === "one-time"
              ? "One-time"
              : booking.frequency.charAt(0).toUpperCase() +
                booking.frequency.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 group-hover:border-blue-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Total Amount</span>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            R{booking.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
