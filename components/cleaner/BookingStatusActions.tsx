"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/lib/types/booking";
import { 
  updateBookingStatusAction, 
  acceptBookingAction, 
  declineBookingAction,
  updateJobProgressAction,
  completeJobAction
} from "@/app/actions/cleaner-bookings";
import { Play, CheckCircle, AlertCircle, Loader2, Check, X, Navigation, MapPin, Star } from "lucide-react";

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

  const handleAccept = async () => {
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

  const handleDecline = async () => {
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

  const handleJobProgress = async (progress: "on-my-way" | "arrived" | "started") => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateJobProgressAction(booking.bookingReference, progress);
      if (!result.success) {
        throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update job progress"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteJob = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await completeJobAction(booking.bookingReference);
      if (!result.success) {
        throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete job"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if booking needs acceptance (pending status with no cleaner response)
  const needsAcceptance = booking.status === "pending" && !booking.cleanerResponse;
  const canStartJob = booking.status === "confirmed";
  const canCompleteJob = booking.status === "in-progress";
  const canMarkIssue = booking.status === "in-progress";

  // Sequential workflow button visibility based on job progress
  const showOnMyWay = booking.status === "confirmed" && !booking.jobProgress;
  const showArrived = booking.jobProgress === "on-my-way";
  const showStartJob = booking.jobProgress === "arrived" && booking.status !== "completed";
  const showCompleteJob = booking.jobProgress === "started" || (booking.status === "in-progress" && booking.jobProgress !== null);
  const showCompleted = booking.status === "completed";

  if (!needsAcceptance && !canStartJob && !canCompleteJob && !canMarkIssue && !showOnMyWay && !showArrived && !showStartJob && !showCompleteJob && !showCompleted) {
    return (
      <div className="text-sm text-gray-600">
        {booking.cleanerResponse === "declined" 
          ? "This booking has been declined"
          : "No actions available for this booking status"}
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
        {needsAcceptance && (
          <>
            <button
              onClick={handleAccept}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept Booking
            </button>
            <button
              onClick={handleDecline}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Decline Booking
            </button>
          </>
        )}

        {/* Sequential workflow buttons - only one visible at a time */}
        {showOnMyWay && (
          <button
            onClick={() => handleJobProgress("on-my-way")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            On My Way
          </button>
        )}

        {showArrived && (
          <button
            onClick={() => handleJobProgress("arrived")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            Arrived
          </button>
        )}

        {showStartJob && (
          <button
            onClick={() => handleJobProgress("started")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Job
          </button>
        )}

        {showCompleteJob && (
          <button
            onClick={handleCompleteJob}
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

        {showCompleted && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completed
            </div>
            <button
              onClick={() => {
                // TODO: Navigate to review page or open review modal
                alert("Review feature coming soon!");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <Star className="w-4 h-4" />
              Review
            </button>
          </div>
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
