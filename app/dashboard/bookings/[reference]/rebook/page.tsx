"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, User, Phone, Mail, Home, Shield, Loader2, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { rebookBooking } from "@/app/actions/rebook";
import { initializePaymentWithAmount } from "@/app/actions/payment";
import { initializePaystack } from "@/lib/paystack";
import { formatPrice, getServiceName, getFrequencyName } from "@/lib/pricing";
import { getAdditionalServices } from "@/app/actions/booking-data";

export default function RebookPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const originalReference = params.reference as string;
  
  const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
  const [rebookedBookingReference, setRebookedBookingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch original booking via API
        const bookingResponse = await fetch(`/api/bookings/${encodeURIComponent(originalReference)}`);
        if (!bookingResponse.ok) {
          setError("Original booking not found");
          setLoading(false);
          return;
        }
        
        const bookingData = await bookingResponse.json();
        if (!bookingData.success || !bookingData.booking) {
          setError("Original booking not found");
          setLoading(false);
          return;
        }

        setOriginalBooking(bookingData.booking);

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

    loadData();
  }, [originalReference]);

  const handlePayment = async () => {
    if (!originalBooking || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // First, create the duplicate booking
      const rebookResult = await rebookBooking(originalReference);
      
      if (!rebookResult.success || !rebookResult.newBookingReference) {
        throw new Error(rebookResult.message || "Failed to create duplicate booking");
      }

      setRebookedBookingReference(rebookResult.newBookingReference);

      // Initialize payment with the original booking's total amount (fixed amount)
      const paymentInit = await initializePaymentWithAmount(
        originalBooking.totalAmount,
        originalBooking.email
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
        callback_url: `${window.location.origin}/dashboard/bookings/${rebookResult.newBookingReference}/payment-success?ref=${paymentInit.reference}`,
        metadata: {
          booking_reference: rebookResult.newBookingReference,
          original_booking_reference: originalReference,
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
              <p className="text-gray-600">Preparing your booking...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !originalBooking) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href={`/dashboard/bookings/${originalReference}`}
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

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href={`/dashboard/bookings/${originalReference}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Booking
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rebook Service
          </h1>
          <p className="text-gray-600">
            Review your booking details and complete payment to confirm your rebooking.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Service Type</p>
              <p className="font-medium text-gray-900">{formatServiceType(originalBooking.service)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Schedule</p>
              <p className="font-medium text-gray-900">
                {formatDate(originalBooking.scheduledDate)} {originalBooking.scheduledTime && `at ${formatTime(originalBooking.scheduledTime)}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">{getFrequencyName(originalBooking.frequency)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Property Details</p>
              <p className="font-medium text-gray-900">
                {originalBooking.bedrooms} bedroom{originalBooking.bedrooms !== 1 ? "s" : ""}, {originalBooking.bathrooms} bathroom{originalBooking.bathrooms !== 1 ? "s" : ""}
              </p>
              {originalBooking.extras && originalBooking.extras.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {originalBooking.extras.map((extraId) => (
                    <li key={extraId} className="text-sm text-gray-700">
                      • {extrasMap[extraId] || extraId}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Service Address</p>
              <p className="font-medium text-gray-900">
                {originalBooking.streetAddress}
                {originalBooking.aptUnit && `, ${originalBooking.aptUnit}`}
              </p>
              <p className="text-sm text-gray-600">
                {originalBooking.suburb}, {originalBooking.city}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPrice(originalBooking.totalAmount)}
            </div>
            <p className="text-sm text-gray-600">Same amount as your previous booking</p>
          </div>

          {originalBooking.discountCode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Discount Code Applied</p>
              <p className="font-medium text-blue-700">{originalBooking.discountCode}</p>
            </div>
          )}

          {originalBooking.tip && originalBooking.tip > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Tip for Cleaner</p>
              <p className="font-medium text-blue-700">{formatPrice(originalBooking.tip)}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure payment powered by Paystack
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <div className="flex justify-end">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatPrice(originalBooking.totalAmount)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
