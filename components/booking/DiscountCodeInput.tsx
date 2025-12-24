"use client";

import { useState, useTransition } from "react";
import { validateDiscountCode } from "@/app/actions/discount";
import { Loader2, Check, X } from "lucide-react";

interface DiscountCodeInputProps {
  onDiscountApplied: (discountAmount: number, code: string) => void;
  onDiscountRemoved: () => void;
  orderTotal: number;
  currentDiscountCode?: string;
  currentDiscountAmount?: number;
}

export default function DiscountCodeInput({
  onDiscountApplied,
  onDiscountRemoved,
  orderTotal,
  currentDiscountCode,
  currentDiscountAmount = 0,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState(currentDiscountCode || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(currentDiscountCode || null);

  const handleApply = () => {
    if (!code.trim()) {
      setError("Please enter a discount code");
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await validateDiscountCode(code.trim(), orderTotal);

      if (result.success) {
        setSuccess(true);
        setAppliedCode(code.trim().toUpperCase());
        onDiscountApplied(result.discountAmount, code.trim().toUpperCase());
      } else {
        setError(result.message);
        setSuccess(false);
        setAppliedCode(null);
        onDiscountRemoved();
      }
    });
  };

  const handleRemove = () => {
    setCode("");
    setAppliedCode(null);
    setSuccess(false);
    setError(null);
    onDiscountRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPending) {
      handleApply();
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="discount-code" className="text-sm font-medium text-gray-700">
        Enter discount code
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            id="discount-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter code"
            disabled={isPending || !!appliedCode}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              error
                ? "border-red-300 focus:ring-red-500"
                : success
                ? "border-blue-300 focus:ring-blue-500"
                : "border-gray-300"
            } ${appliedCode ? "bg-gray-50" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {success && appliedCode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">{appliedCode}</span>
            </div>
          )}
        </div>
        {appliedCode ? (
          <button
            type="button"
            onClick={handleRemove}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={isPending || !code.trim()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply"
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
      {success && appliedCode && currentDiscountAmount > 0 && (
        <p className="text-sm text-blue-600 flex items-center gap-1">
          <Check className="w-4 h-4" />
          Discount applied! You saved R {currentDiscountAmount.toFixed(2)}
        </p>
      )}
    </div>
  );
}




















