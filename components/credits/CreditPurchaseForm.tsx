"use client";

import { useState } from "react";
import { CreditCard, Building2 } from "lucide-react";
import { initializeCreditPurchase } from "@/app/actions/credits";
import { initializePaystack } from "@/lib/paystack";
import EFTPaymentForm from "./EFTPaymentForm";

interface CreditPurchaseFormProps {
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function CreditPurchaseForm({
  onSuccess,
}: CreditPurchaseFormProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "eft">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 20 && numValue <= 5000) {
      setAmount(numValue);
    }
  };

  const handleCardPayment = async () => {
    if (amount < 20 || amount > 5000) {
      setError("Amount must be between R20 and R5000");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await initializeCreditPurchase(amount);

      if (!result.success) {
        setError(result.message || "Failed to initialize payment");
        setLoading(false);
        return;
      }

      if (result.publicKey && result.amount && result.email && result.reference) {
        initializePaystack({
          publicKey: result.publicKey,
          amount: result.amount,
          email: result.email,
          reference: result.reference,
          currency: "ZAR",
          metadata: {
            type: "credit_purchase",
            amount: amount,
          },
          callback_url: `${window.location.origin}/dashboard/shalcred?success=true`,
          onClose: () => {
            setLoading(false);
          },
        });
      } else {
        setError("Payment initialization failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize payment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Amount (R20 - R5000)
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                amount === preset && !customAmount
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              R{preset}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            R
          </span>
          <input
            type="number"
            min="20"
            max="5000"
            step="0.01"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="Custom amount"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {amount >= 20 && amount <= 5000 && (
          <p className="mt-2 text-sm text-gray-600">
            You will receive R{amount.toFixed(2)} in ShalCred credits
          </p>
        )}
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === "card"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-700">Card Payment</p>
            <p className="text-xs text-gray-500 mt-1">Instant</p>
          </button>
          <button
            onClick={() => setPaymentMethod("eft")}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === "eft"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Building2 className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-700">EFT Deposit</p>
            <p className="text-xs text-gray-500 mt-1">Manual verification</p>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Payment Forms */}
      {paymentMethod === "card" ? (
        <button
          onClick={handleCardPayment}
          disabled={loading || amount < 20 || amount > 5000}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : `Pay R${amount.toFixed(2)} with Card`}
        </button>
      ) : (
        <EFTPaymentForm
          amount={amount}
          onSuccess={() => {
            setError(null);
            onSuccess?.();
          }}
          onError={(errorMessage) => setError(errorMessage)}
        />
      )}
    </div>
  );
}

















