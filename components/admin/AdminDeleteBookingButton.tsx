"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { adminDeleteBooking } from "@/app/actions/admin-delete-booking";
import { useRouter } from "next/navigation";

interface AdminDeleteBookingButtonProps {
  booking: Booking;
  onSuccess?: () => void;
}

export default function AdminDeleteBookingButton({ booking, onSuccess }: AdminDeleteBookingButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await adminDeleteBooking(booking.bookingReference);

      if (result.success) {
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/bookings");
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Booking
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Booking</h2>
            </div>

            <p className="text-gray-700 mb-2">
              Are you sure you want to permanently delete this booking? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Booking Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
