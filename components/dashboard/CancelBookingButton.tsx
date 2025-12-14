"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { cancelBooking } from "@/app/actions/cancel-booking";
import { useRouter } from "next/navigation";

interface CancelBookingButtonProps {
  booking: Booking;
  onSuccess?: () => void;
}

export default function CancelBookingButton({ booking, onSuccess }: CancelBookingButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show cancel button if booking is already cancelled or completed
  if (booking.status === "cancelled" || booking.status === "completed") {
    return null;
  }

  const handleCancel = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const result = await cancelBooking(booking.bookingReference);

      if (result.success) {
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCancel}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
        Cancel Booking
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={isCancelling}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
