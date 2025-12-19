"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/lib/types/booking";
import { updateBookingStatusAction } from "@/app/actions/cleaner-bookings";
import { Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface BookingStatusActionsProps {
  booking: Booking;
}

export default function BookingStatusActions({
  booking,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: Booking["status"]) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateBookingStatusAction(booking.bookingReference, newStatus);
      if (!result.success) {
        throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update booking status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const canStartJob =
    booking.status === "pending" || booking.status === "confirmed";
  const canCompleteJob = booking.status === "in-progress";
  const canMarkIssue = booking.status === "in-progress";

  if (!canStartJob && !canCompleteJob && !canMarkIssue) {
    return (
      <div className="text-sm text-gray-600">
        No actions available for this booking status
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canStartJob && (
          <button
            onClick={() => handleStatusUpdate("in-progress")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Job
          </button>
        )}

        {canCompleteJob && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Complete Job
          </button>
        )}

        {canMarkIssue && (
          <button
            onClick={() => {
              // For now, just show an alert. In the future, this could open a modal
              alert(
                "Issue reporting feature coming soon. Please contact support if you encounter any issues."
              );
            }}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <AlertCircle className="w-4 h-4" />
            Report Issue
          </button>
        )}
      </div>
    </div>
  );
}
