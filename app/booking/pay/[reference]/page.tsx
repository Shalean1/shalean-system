"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, Loader2, AlertCircle, Shield } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { initializePaymentWithAmount } from "@/app/actions/payment";
import { initializePaystack } from "@/lib/paystack";
import { formatPrice, getServiceName, getFrequencyName } from "@/lib/pricing";
import { getAdditionalServices } from "@/lib/supabase/booking-data";
import { updateRebookedBookingPayment } from "@/app/actions/rebook-payment";

export default function PayForFailedBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingReference = params.reference as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});

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

        const fetchedBooking = bookingData.booking;

        // Only allow payment for failed payments
        if (fetchedBooking.paymentStatus !== "failed") {
          setError(`This booking's payment status is "${fetchedBooking.paymentStatus}". Payment links can only be used for failed payments.`);
          setLoading(false);
          return;
        }

        setBooking(fetchedBooking);

        // Load extras mapping
        try {
          const additionalServices = await getAdditionalServices();
          const map: Record<string, string> = {};
          additionalServices.forEach((service) => {
            map[service.service_id] = service.name;
          });
          setExtrasMap(map);
        } catch (err) {
          console.error("Failed to load additional services:", err);
        }
      } catch (err) {
        console.error("Error loading booking data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (bookingReference) {
      loadData();
    }
  }, [bookingReference]);

  const handlePayment = async () => {
    if (!booking || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Initialize payment with the booking's total amount
      const paymentInit = await initializePaymentWithAmount(
        booking.totalAmount,
        booking.email
      );

      if (!paymentInit.success || !paymentInit.publicKey || !paymentInit.amount || !paymentInit.reference) {
        throw new Error(paymentInit.message || "Failed to initialize payment");
      }

      // Initialize Paystack payment
      initializePaystack({
        publicKey: paymentInit.publicKey,
        amount: paymentInit.amount,
        email: paymentInit.email!,
        reference: paymentInit.reference,
        callback_url: `${window.location.origin}/booking/pay/${booking.bookingReference}/success?ref=${paymentInit.reference}`,
        metadata: {
          booking_reference: booking.bookingReference,
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

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  if (error && !booking) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">
            Booking Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{formatServiceType(booking.service)}</p>
              </div>
            </div>

            {booking.scheduledDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date</p>
                  <p className="font-medium text-gray-900">{formatDate(booking.scheduledDate)}</p>
                </div>
              </div>
            )}

            {booking.scheduledTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled Time</p>
                  <p className="font-medium text-gray-900">{formatTime(booking.scheduledTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Service Address</p>
                <p className="font-medium text-gray-900">
                  {booking.streetAddress}
                  {booking.aptUnit && `, ${booking.aptUnit}`}, {booking.suburb}, {booking.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Amount</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total Amount</span>
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(booking.totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay Now
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Secure payment powered by Paystack
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Once your payment is successfully processed, your booking will be confirmed and you will receive a confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}
