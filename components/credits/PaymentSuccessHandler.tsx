"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";

export default function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [amount, setAmount] = useState<number | null>(null);

  const verifyAndAllocateCredits = useCallback(async (reference: string) => {
    setStatus("loading");
    setMessage("Verifying payment and allocating credits...");

    try {
      const response = await fetch("/api/credits/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          data.alreadyAllocated
            ? "Credits were already allocated for this payment."
            : `Successfully allocated R${data.amount?.toFixed(2) || "0.00"} in credits!`
        );
        setAmount(data.amount || null);

        // Remove query parameters from URL after processing
        setTimeout(() => {
          router.replace("/dashboard/shalcred");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to allocate credits. Please contact support.");
      }
    } catch (error) {
      console.error("Error verifying credit payment:", error);
      setStatus("error");
      setMessage("An error occurred while processing your payment. Please contact support.");
    }
  }, [router]);

  useEffect(() => {
    const success = searchParams.get("success");
    const reference = searchParams.get("reference");
    const paymentStatus = searchParams.get("status");

    // Only process if we have success parameters and haven't already processed
    if (success === "true" && reference && paymentStatus === "success" && status === "idle") {
      // Check if this is a credit purchase reference
      if (reference.startsWith("credit-")) {
        verifyAndAllocateCredits(reference);
      }
    }
  }, [searchParams, status, verifyAndAllocateCredits]);

  const handleClose = () => {
    router.replace("/dashboard/shalcred");
  };

  // Don't render anything if there's no success callback for credit purchase
  const success = searchParams.get("success");
  const reference = searchParams.get("reference");
  const paymentStatus = searchParams.get("status");
  
  if (success !== "true" || !reference?.startsWith("credit-") || paymentStatus !== "success") {
    return null;
  }

  return (
    <div className="mb-6">
      {status === "loading" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-blue-800 font-medium">{message}</p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-green-600 hover:text-green-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">{message}</p>
              {amount && (
                <p className="text-sm text-green-700 mt-1">
                  Your new balance will be updated shortly.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-red-600 hover:text-red-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">{message}</p>
              <p className="text-sm text-red-700 mt-1">
                Reference: {searchParams.get("reference")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}











