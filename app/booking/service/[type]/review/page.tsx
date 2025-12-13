"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Calendar,
  Edit,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import { BookingFormData } from "@/lib/types/booking";
import { calculatePrice, getServiceName, formatPrice, getFrequencyName } from "@/lib/pricing";
import { initializePayment } from "@/app/actions/payment";
import { submitBooking } from "@/app/actions/submit-booking";
import { initializePaystack } from "@/lib/paystack";

const STORAGE_KEY = "shalean_booking_data";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const serviceType = params?.type as string;

  // Always start with empty object to avoid hydration mismatch
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isMounted, setIsMounted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    // Mark as mounted and load from localStorage
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const priceBreakdown = calculatePrice(formData as Partial<BookingFormData>);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "")) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmAndPay = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize payment
      const paymentInit = await initializePayment(
        formData as BookingFormData,
        formData.email || ""
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
        callback_url: `${window.location.origin}/booking/service/${serviceType}/confirmation?ref=${paymentInit.reference}`,
        metadata: {
          booking_data: formData,
        },
        onClose: () => {
          // Reset processing state when payment popup is closed
          setIsProcessing(false);
        },
      });

      // Reset processing state after payment popup opens
      // Small delay to ensure popup is fully opened
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);

      // Note: Paystack will handle the payment flow
      // After successful payment, Paystack redirects to callback_url
      // We'll handle the booking submission in the confirmation page or via webhook
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsProcessing(false);
      alert(error instanceof Error ? error.message : "Failed to initialize payment. Please try again.");
    }
  };

  // Handle payment callback (if redirected back from Paystack)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get("reference");
    const status = urlParams.get("status");

    if (paymentRef && status === "success" && formData.email) {
      // Submit booking with payment reference
      handleBookingSubmission(paymentRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, serviceType]);

  const handleBookingSubmission = async (paymentReference: string) => {
    try {
      setIsProcessing(true);
      const result = await submitBooking(formData as BookingFormData, paymentReference);

      if (result.success && result.bookingReference) {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        // Redirect to confirmation page
        router.push(`/booking/service/${serviceType}/confirmation?ref=${result.bookingReference}`);
      } else {
        throw new Error(result.message || "Failed to submit booking");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit booking. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(`/booking/service/${serviceType}/schedule`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const address = formData.streetAddress
    ? `${formData.streetAddress}${formData.aptUnit ? `, ${formData.aptUnit}` : ""}, ${formData.suburb || ""}, ${formData.city || ""}`
    : undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6 flex justify-center">
          <ProgressIndicator currentStep={3} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Review your booking</h1>
        <p className="text-lg text-gray-600 mb-8">Please review all details before confirming your booking</p>

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Please fix the following errors:</p>
              <ul className="list-disc list-inside mt-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Review Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service & Property */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-500" />
                  Service & Property
                </h2>
                <button
                  onClick={() => router.push(`/booking/service/${serviceType}/details`)}
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>
              <div className="space-y-2" suppressHydrationWarning>
                <p><strong>Service Type:</strong> {getServiceName(formData.service || "standard")}</p>
                <p><strong>Bedrooms:</strong> {formData.bedrooms ?? 0}</p>
                <p><strong>Bathrooms:</strong> {formData.bathrooms ?? 1}</p>
                {formData.extras && formData.extras.length > 0 && (
                  <p><strong>Extras:</strong> {formData.extras.length} selected</p>
                )}
              </div>
            </section>

            {/* Schedule */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Schedule
                </h2>
                <button
                  onClick={() => router.push(`/booking/service/${serviceType}/details`)}
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>
              <div className="space-y-2" suppressHydrationWarning>
                <p><strong>Date:</strong> {formatDate(formData.scheduledDate || null)}</p>
                <p><strong>Time:</strong> {formData.scheduledTime || "Not specified"}</p>
                <p><strong>Frequency:</strong> {getFrequencyName(formData.frequency || "one-time")}</p>
              </div>
            </section>

            {/* Contact & Address */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Contact & Address
                </h2>
                <button
                  onClick={() => router.push(`/booking/service/${serviceType}/schedule`)}
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Thabo"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Mokoena"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., thabo@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0821234567 or +27821234567"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Service Address */}
              <div suppressHydrationWarning>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Address
                </h3>
                <p className="text-gray-700">{address || "Not specified"}</p>
              </div>
            </section>

            {/* Total Amount & Payment */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Total Amount</h2>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(priceBreakdown.total)}
                </div>
                <p className="text-sm text-gray-600">All fees included</p>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service & rooms:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(priceBreakdown.subtotal - priceBreakdown.frequencyDiscount)}
                  </span>
                </div>
                {priceBreakdown.frequencyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(priceBreakdown.frequencyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee:</span>
                  <span className="font-medium text-gray-900">
                    +{formatPrice(priceBreakdown.serviceFee)}
                  </span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter discount code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="discountCode"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Amount due today: <span className="font-bold text-gray-900">{formatPrice(priceBreakdown.total)}</span>
                </p>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure payment powered by Paystack
                </p>
              </div>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm & Pay ${formatPrice(priceBreakdown.total)}`
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1" suppressHydrationWarning>
            <PriceSummary
              service={formData.service || "standard"}
              frequency={formData.frequency || "one-time"}
              priceBreakdown={priceBreakdown}
              bedrooms={formData.bedrooms || 0}
              bathrooms={formData.bathrooms || 1}
              extras={formData.extras || []}
              scheduledDate={formData.scheduledDate || null}
              scheduledTime={formData.scheduledTime || null}
              address={address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
