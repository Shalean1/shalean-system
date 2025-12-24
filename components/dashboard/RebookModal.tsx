"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Loader2, AlertCircle, CheckCircle2, Shield, ChevronDown } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { getTimeSlots } from "@/app/actions/booking-data";
import { FALLBACK_TIME_SLOTS } from "@/lib/supabase/booking-data-fallbacks";
import { rebookBookingWithSchedule } from "@/app/actions/rebook-schedule";
import { initializePaymentWithAmount } from "@/app/actions/payment";
import { initializePaystack } from "@/lib/paystack";
import { formatPrice, getServiceName, getFrequencyName } from "@/lib/pricing";
import DatePicker from "@/components/booking/DatePicker";

interface RebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess?: () => void;
}

type Step = "schedule" | "payment" | "success";

export default function RebookModal({ isOpen, onClose, booking, onSuccess }: RebookModalProps) {
  const [step, setStep] = useState<Step>("schedule");
  const [selectedDate, setSelectedDate] = useState<string>(booking.scheduledDate || "");
  const [selectedTime, setSelectedTime] = useState<string>(booking.scheduledTime || "");
  const [timeSlots, setTimeSlots] = useState<string[]>(FALLBACK_TIME_SLOTS);
  const [rebookedBookingReference, setRebookedBookingReference] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});

  // Load time slots on mount
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        const slots = await getTimeSlots();
        if (slots.length > 0) {
          setTimeSlots(slots.map(slot => slot.time_value));
        }
      } catch (err) {
        console.error("Failed to load time slots:", err);
      }
    };
    loadTimeSlots();
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("schedule");
      setSelectedDate(booking.scheduledDate || "");
      setSelectedTime(booking.scheduledTime || "");
      setError(null);
      setRebookedBookingReference(null);
    }
  }, [isOpen, booking]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // Handle schedule step - continue to payment
  const handleContinueToPayment = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create duplicate booking with new schedule
      const result = await rebookBookingWithSchedule(
        booking.bookingReference,
        selectedDate,
        selectedTime
      );

      if (!result.success || !result.newBookingReference) {
        throw new Error(result.message || "Failed to create duplicate booking");
      }

      setRebookedBookingReference(result.newBookingReference);
      setStep("payment");
    } catch (err) {
      console.error("Error creating rebook:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!rebookedBookingReference || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Initialize payment with fixed amount
      const paymentInit = await initializePaymentWithAmount(
        booking.totalAmount,
        booking.email
      );

      if (!paymentInit.success || !paymentInit.publicKey || !paymentInit.amount || !paymentInit.reference) {
        throw new Error(paymentInit.message || "Failed to initialize payment");
      }

      // Initialize Paystack payment
      // Note: Paystack redirects to callback_url on success, so the modal will close
      // The payment-success page will handle updating the booking
      initializePaystack({
        publicKey: paymentInit.publicKey,
        amount: paymentInit.amount,
        email: paymentInit.email!,
        reference: paymentInit.reference,
        callback_url: `${window.location.origin}/dashboard/bookings/${rebookedBookingReference}/payment-success?ref=${paymentInit.reference}&modal=true`,
        metadata: {
          booking_reference: rebookedBookingReference,
          original_booking_reference: booking.bookingReference,
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });

      // Reset processing state after payment popup opens
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Rebook Service</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Schedule</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose a new date and time for your service. All other details will remain the same.
                </p>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate}
                    className={`w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                      !selectedDate ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">
                      {selectedDate ? "Select a time" : "Select date first"}
                    </option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Schedule Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Current schedule:</strong> {formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime)}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinueToPayment}
                  disabled={isProcessing || !selectedDate || !selectedTime}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Confirmation</h3>
                <p className="text-sm text-gray-600">
                  Review your booking details and complete payment to confirm your rebooking.
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium text-gray-900">{getServiceName(booking.service)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">New Schedule</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedDate)} at {formatTime(selectedTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Frequency</p>
                  <p className="font-medium text-gray-900">{getFrequencyName(booking.frequency)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Property</p>
                  <p className="font-medium text-gray-900">
                    {booking.bedrooms} bed, {booking.bathrooms} bath
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {booking.streetAddress}
                    {booking.aptUnit && `, ${booking.aptUnit}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.suburb}, {booking.city}
                  </p>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h4 className="text-lg font-semibold text-gray-900">Total Amount</h4>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(booking.totalAmount)}
                </div>
                <p className="text-sm text-gray-600">Same amount as your previous booking</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setStep("schedule")}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatPrice(booking.totalAmount)}`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your booking has been confirmed. You will receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500">Closing automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
