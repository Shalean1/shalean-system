"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import DatePicker from "@/components/booking/DatePicker";
import { rescheduleBooking } from "@/app/actions/reschedule-booking";
import { getTimeSlots } from "@/app/actions/booking-data";
import { FALLBACK_TIME_SLOTS } from "@/lib/supabase/booking-data-fallbacks";
import { Booking } from "@/lib/types/booking";

export default function ReschedulePage() {
  const router = useRouter();
  const params = useParams();
  const bookingReference = params.reference as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<Array<{ value: string; label: string }>>(
    FALLBACK_TIME_SLOTS.map(time => ({ value: time, label: time }))
  );
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch booking via API
        const bookingResponse = await fetch(`/api/bookings/${encodeURIComponent(bookingReference)}`);
        if (!bookingResponse.ok) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        const bookingData = await bookingResponse.json();
        if (!bookingData.success || !bookingData.booking) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        const bookingInfo: Booking = bookingData.booking;
        setBooking(bookingInfo);
        
        // Set initial date and time from existing booking
        if (bookingInfo.scheduledDate) {
          setSelectedDate(bookingInfo.scheduledDate);
        }
        if (bookingInfo.scheduledTime) {
          setSelectedTime(bookingInfo.scheduledTime);
        }

        // Load time slots
        try {
          const timeSlotsData = await getTimeSlots();
          if (timeSlotsData.length > 0) {
            setTimeSlots(timeSlotsData.map(slot => ({
              value: slot.time_value,
              label: slot.display_label || slot.time_value
            })));
          }
        } catch (err) {
          console.error("Failed to load time slots:", err);
        }
      } catch (err) {
        console.error("Error loading booking data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingReference]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedDate || !selectedTime) {
      setSubmitError("Please select both a date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await rescheduleBooking(bookingReference, selectedDate, selectedTime);

      if (result.success) {
        setSubmitSuccess(true);
        // Redirect to booking detail page after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/bookings/${bookingReference}`);
        }, 2000);
      } else {
        setSubmitError(result.message);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href={`/dashboard/bookings/${bookingReference}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Booking
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Error</h2>
            </div>
            <p className="text-red-700">{error || "Failed to load booking"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">Booking Rescheduled!</h2>
            </div>
            <p className="text-green-700 mb-4">
              Your booking has been successfully rescheduled. Redirecting to booking details...
            </p>
            <Link
              href={`/dashboard/bookings/${bookingReference}`}
              className="text-green-700 hover:text-green-900 underline"
            >
              Go to booking details now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href={`/dashboard/bookings/${bookingReference}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Booking
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reschedule Booking
          </h1>
          <p className="text-gray-600">
            Select a new date and time for your cleaning service.
          </p>
        </div>

        {/* Current Schedule */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Current Schedule
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Date:</span> {formatDate(booking.scheduledDate)}
            </p>
            {booking.scheduledTime && (
              <p className="text-gray-700">
                <span className="font-medium">Time:</span> {formatTime(booking.scheduledTime)}
              </p>
            )}
          </div>
        </div>

        {/* Reschedule Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select New Date & Time</h2>

          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label htmlFor="rescheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <DatePicker
                id="rescheduleDate"
                value={selectedDate}
                onChange={setSelectedDate}
                min={getMinDate()}
                error={!!submitError && !selectedDate}
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="rescheduleTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time *
              </label>
              <div className="relative">
                <select
                  id="rescheduleTime"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                    submitError && !selectedTime ? "border-red-500" : "border-gray-300"
                  } ${!selectedDate ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {selectedDate ? "Select a time" : "Select date first"}
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              href={`/dashboard/bookings/${bookingReference}`}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
