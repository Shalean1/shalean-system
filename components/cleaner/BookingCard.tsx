"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, DollarSign, Check, X, Loader2 } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import StatusBadge from "./StatusBadge";
import { acceptBookingAction, declineBookingAction } from "@/app/actions/cleaner-bookings";

interface BookingCardProps {
  booking: Booking;
  showCustomer?: boolean;
}

export default function BookingCard({ booking, showCustomer = true }: BookingCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpdating(true);
    setError(null);

    try {
      const result = await acceptBookingAction(booking.bookingReference);
      if (!result.success) {
        throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept booking"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to decline this booking? This will unassign you from the booking.")) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const result = await declineBookingAction(booking.bookingReference);
      if (!result.success) {
        throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline booking"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if booking needs acceptance (pending status with no cleaner response)
  const needsAcceptance = booking.status === "pending" && !booking.cleanerResponse;

  return (
    <div className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
      <Link
        href={`/cleaner/bookings/${booking.bookingReference}`}
        className="block"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {formatServiceType(booking.service)}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={booking.status} size="sm" />
              <span className="text-sm font-semibold text-gray-900">
                R{booking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              {formatDate(booking.scheduledDate)}
              {booking.scheduledTime && ` at ${formatTime(booking.scheduledTime)}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {booking.streetAddress}
              {booking.aptUnit && `, ${booking.aptUnit}`}, {booking.suburb}
            </span>
          </div>

          {showCustomer && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {booking.firstName} {booking.lastName}
              </span>
            </div>
          )}

          {booking.specialInstructions && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 line-clamp-2">
                {booking.specialInstructions}
              </p>
            </div>
          )}
        </div>
      </Link>

      {/* Accept/Decline Buttons */}
      {needsAcceptance && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept
            </button>
            <button
              onClick={handleDecline}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
