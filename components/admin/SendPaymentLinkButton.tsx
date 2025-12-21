"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { sendPaymentLink } from "@/app/actions/send-payment-link";

interface SendPaymentLinkButtonProps {
  booking: Booking;
}

export default function SendPaymentLinkButton({ booking }: SendPaymentLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show button if payment status is failed
  if (booking.paymentStatus !== "failed") {
    return null;
  }

  const handleSendPaymentLink = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendPaymentLink(booking.bookingReference);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error sending payment link:", err);
      setError(err instanceof Error ? err.message : "Failed to send payment link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSendPaymentLink}
        disabled={loading || success}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Sent!</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Payment Link</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-10 min-w-[250px]">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
