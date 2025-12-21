"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, Home } from "lucide-react";
import { updateRebookedBookingPayment } from "@/app/actions/rebook-payment";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const bookingReference = params.reference as string;
  // Paystack adds "reference" parameter, but we also pass "ref" in callback_url
  // Check both to ensure compatibility
  const paymentRef = searchParams.get("reference") || searchParams.get("ref");
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatePayment = async () => {
      if (!paymentRef || !bookingReference) {
        setError("Missing payment or booking reference");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await updateRebookedBookingPayment(bookingReference, paymentRef);

        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.message || "Failed to update payment");
        }
      } catch (err) {
        console.error("Error updating payment:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    updatePayment();
  }, [paymentRef, bookingReference]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Processing your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Payment Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <Link
                href={`/booking/pay/${bookingReference}`}
                className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-medium"
              >
                Try Again <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Booking Reference: <span className="font-mono font-medium">{bookingReference}</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
