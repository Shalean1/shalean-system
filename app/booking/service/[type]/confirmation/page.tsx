"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, Phone, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { getServiceName, formatPrice, getFrequencyName } from "@/lib/pricing";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("ref");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      // Try to load booking from localStorage first
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("shalean_booking_data");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Calculate total amount
            const { calculatePrice } = await import("@/lib/pricing");
            const priceBreakdown = calculatePrice(parsed);
            
            // Create a booking object for display
            const mockBooking: Partial<Booking> = {
              ...parsed,
              bookingReference: bookingRef || "PENDING",
              totalAmount: priceBreakdown.total,
              paymentStatus: bookingRef ? "completed" : "pending",
              status: bookingRef ? "confirmed" : "pending",
              createdAt: new Date().toISOString(),
            };
            setBooking(mockBooking as Booking);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing booking data:", error);
          }
        }
      }

      // If booking reference provided, try to fetch from server via API
      if (bookingRef) {
        try {
          const response = await fetch(`/api/bookings/${encodeURIComponent(bookingRef)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.booking) {
              setBooking(data.booking);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching booking:", error);
        }
      }
      
      setLoading(false);
    };

    loadBooking();
  }, [bookingRef]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">
              We couldn't find your booking. Please contact support if you believe this is an error.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const address = booking.streetAddress
    ? `${booking.streetAddress}${booking.aptUnit ? `, ${booking.aptUnit}` : ""}, ${booking.suburb || ""}, ${booking.city || ""}`
    : "Not specified";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Shalean
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Thank you for booking with Shalean Cleaning Services. Your booking has been confirmed and payment has been received.
            </p>
            {booking.bookingReference && (
              <div className="mt-4 inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="text-lg font-bold text-blue-600">{booking.bookingReference}</p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="font-medium text-gray-900">
                  {getServiceName(booking.service || "standard")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Frequency</p>
                <p className="font-medium text-gray-900">
                  {getFrequencyName(booking.frequency || "one-time")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule</p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.scheduledDate || null)}
                  {booking.scheduledTime && ` @ ${booking.scheduledTime}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Property</p>
                <p className="font-medium text-gray-900">
                  {booking.bedrooms || 0} bed, {booking.bathrooms || 1}{" "}
                  {booking.bathrooms === 1 ? "bath" : "baths"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Service Address</p>
                <p className="font-medium text-gray-900">{address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="font-medium text-gray-900">
                  {booking.firstName} {booking.lastName}
                </p>
                <p className="text-sm text-gray-600">{booking.email}</p>
                <p className="text-sm text-gray-600">{booking.phone}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {booking.totalAmount ? formatPrice(booking.totalAmount) : "N/A"}
                </p>
                <p className="text-xs text-green-600 mt-1">✓ Payment Confirmed</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a confirmation email to {booking.email} with all your booking details.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pre-Service Contact</h3>
                  <p className="text-gray-600 text-sm">
                    Our team will contact you before your scheduled service date to confirm details and answer any questions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Service Day</h3>
                  <p className="text-gray-600 text-sm">
                    Our professional cleaner will arrive at your scheduled time to provide exceptional service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Assistance?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or need to modify your booking, feel free to reach out to us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="mailto:hello@shalean.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  hello@shalean.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="tel:+27123456789" className="text-blue-600 hover:text-blue-700 font-medium">
                  +27 12 345 6789
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              Return to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/booking/service/${booking.service || "standard"}/details`}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center"
            >
              Book Another Service
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your email address with all the details of your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
