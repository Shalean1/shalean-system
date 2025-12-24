"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Star, CheckCircle, XCircle, Eye, MessageSquare, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Cleaner } from "@/lib/supabase/booking-data";
import { useState } from "react";
import RateCleanerModal from "./RateCleanerModal";
import AvailabilityDays from "./AvailabilityDays";
import { getMostRecentBookingByCleaner, getBookingByReferenceAction } from "@/app/actions/get-booking-by-cleaner";
import RebookModal from "./RebookModal";
import { Booking } from "@/lib/types/booking";

interface CleanerCardProps {
  cleaner: Cleaner;
  isPreviouslyBooked?: boolean;
}

export default function CleanerCard({ cleaner, isPreviouslyBooked = false }: CleanerCardProps) {
  const [showRateModal, setShowRateModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-4">
          {/* Top Row: Avatar and Info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {cleaner.avatar_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={cleaner.avatar_url}
                    alt={cleaner.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {/* Availability Badge */}
              <div className="absolute -bottom-1 -right-1">
                {cleaner.is_available ? (
                  <div className="bg-blue-500 rounded-full p-1 border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="bg-gray-400 rounded-full p-1 border-2 border-white">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Cleaner Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {cleaner.name}
                  </h3>
                </div>
                {isPreviouslyBooked && (
                  <div className="flex items-center w-full">
                    <button
                      onClick={handleRebookClick}
                      disabled={loadingBooking}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingBooking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          Rebook
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio - Full Width Below Avatar */}
          {cleaner.bio && (
            <div className="w-full">
              <p className="text-sm text-gray-600 line-clamp-2 text-center">
                {cleaner.bio}
              </p>
            </div>
          )}

          {/* Availability Status - Full Width Below Avatar */}
          <div className="flex items-center justify-between w-full">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                cleaner.is_available
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {cleaner.is_available ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Available
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Unavailable
                </>
              )}
            </div>
            {cleaner.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {cleaner.rating.toFixed(1)}
                </span>
                {cleaner.total_jobs > 0 && (
                  <span className="text-sm text-gray-500">
                    ({cleaner.total_jobs} {cleaner.total_jobs === 1 ? "job" : "jobs"})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Availability Days - Full Width Below Avatar */}
          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-xs font-medium text-gray-600">Available Days:</span>
            <AvailabilityDays 
              availabilityDays={cleaner.availability_days} 
              isAvailable={cleaner.is_available}
            />
          </div>

          {/* Action Buttons - Full Width Below Avatar */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Link
              href={`/dashboard/cleaners/${cleaner.cleaner_id}`}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${
                isPreviouslyBooked ? "flex-1" : "w-full"
              }`}
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Link>
            {isPreviouslyBooked && (
              <button
                onClick={() => setShowRateModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Rate Cleaner
              </button>
            )}
          </div>
        </div>
      </div>

      {showRateModal && (
        <RateCleanerModal
          cleaner={cleaner}
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
        />
      )}

      {booking && (
        <RebookModal
          isOpen={showRebookModal}
          onClose={() => {
            setShowRebookModal(false);
            setBooking(null);
            setBookingError(null);
          }}
          booking={booking}
          onSuccess={() => {
            setShowRebookModal(false);
            setBooking(null);
            // Optionally refresh the page or update UI
            window.location.reload();
          }}
        />
      )}

      {bookingError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            </div>
            <p className="text-gray-700 mb-4">{bookingError}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setBookingError(null);
                  // Fallback to booking form if modal fails
                  window.location.href = `/booking/service/standard/details?cleaner=${cleaner.cleaner_id}`;
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Use Booking Form Instead
              </button>
              <button
                onClick={() => setBookingError(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  async function handleRebookClick() {
    setLoadingBooking(true);
    setBookingError(null);

    try {
      // Get the most recent booking reference for this cleaner
      const result = await getMostRecentBookingByCleaner(cleaner.cleaner_id);

      if (!result.success || !result.bookingReference) {
        throw new Error(result.message || "No booking found for this cleaner");
      }

      // Fetch the full booking details
      const bookingResult = await getBookingByReferenceAction(result.bookingReference);

      if (!bookingResult.success || !bookingResult.booking) {
        throw new Error(bookingResult.message || "Booking not found");
      }

      setBooking(bookingResult.booking);
      setShowRebookModal(true);
    } catch (err) {
      console.error("Error loading booking for rebook:", err);
      setBookingError(
        err instanceof Error 
          ? err.message 
          : "Failed to load booking. Please try again."
      );
    } finally {
      setLoadingBooking(false);
    }
  }
}
