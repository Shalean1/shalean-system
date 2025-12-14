"use client";

import { useState, useTransition } from "react";
import { Voucher } from "@/app/actions/vouchers";
import { redeemCreditVoucher } from "@/app/actions/vouchers";
import { Gift, CheckCircle, XCircle, CreditCard, Percent, Tag } from "lucide-react";

interface VoucherListProps {
  vouchers: Voucher[];
}

export default function VoucherList({ vouchers }: VoucherListProps) {
  const [redeemingCode, setRedeemingCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRedeem = (voucher: Voucher) => {
    if (voucher.is_redeemed) {
      return;
    }

    if (voucher.voucher_type !== "credit") {
      setMessage({
        type: "error",
        text: "This voucher can only be used during booking checkout",
      });
      return;
    }

    // Check if voucher is expired
    if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
      setMessage({
        type: "error",
        text: "This voucher has expired",
      });
      return;
    }

    setRedeemingCode(voucher.code);
    setMessage(null);

    startTransition(async () => {
      const result = await redeemCreditVoucher(voucher.code);
      
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });
        // Refresh the page after a short delay to show updated vouchers
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.message,
        });
      }
      setRedeemingCode(null);
    });
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case "credit":
        return CreditCard;
      case "discount_percentage":
        return Percent;
      case "discount_fixed":
        return Tag;
      default:
        return Gift;
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case "credit":
        return "Credit Voucher";
      case "discount_percentage":
        return "Percentage Discount";
      case "discount_fixed":
        return "Fixed Discount";
      default:
        return "Voucher";
    }
  };

  const formatValue = (voucher: Voucher) => {
    if (voucher.voucher_type === "credit") {
      return `R${voucher.value.toFixed(2)}`;
    } else if (voucher.voucher_type === "discount_percentage") {
      return `${voucher.value}%`;
    } else {
      return `R${voucher.value.toFixed(2)}`;
    }
  };

  const isExpired = (voucher: Voucher) => {
    if (!voucher.valid_until) return false;
    return new Date(voucher.valid_until) < new Date();
  };

  const isRedeemable = (voucher: Voucher) => {
    return (
      !voucher.is_redeemed &&
      voucher.is_active &&
      !isExpired(voucher) &&
      voucher.voucher_type === "credit"
    );
  };

  if (vouchers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Vouchers Available
          </h3>
          <p className="text-gray-600">
            You don't have any vouchers assigned to your account yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher.voucher_type);
          const expired = isExpired(voucher);
          const redeemable = isRedeemable(voucher);

          return (
            <div
              key={voucher.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
                voucher.is_redeemed
                  ? "border-gray-300 opacity-60"
                  : expired
                  ? "border-red-200"
                  : redeemable
                  ? "border-green-200 hover:border-green-300 hover:shadow-md"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      voucher.is_redeemed
                        ? "bg-gray-100"
                        : expired
                        ? "bg-red-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        voucher.is_redeemed
                          ? "text-gray-500"
                          : expired
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {voucher.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getVoucherTypeLabel(voucher.voucher_type)}
                    </p>
                  </div>
                </div>
                {voucher.is_redeemed && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Redeemed</span>
                  </div>
                )}
              </div>

              {voucher.description && (
                <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatValue(voucher)}
                  </p>
                  {voucher.voucher_type !== "credit" &&
                    voucher.minimum_order_amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Min. order: R{voucher.minimum_order_amount.toFixed(2)}
                      </p>
                    )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-500">
                    {voucher.code}
                  </p>
                </div>
              </div>

              {voucher.valid_until && (
                <p className="text-xs text-gray-500 mb-4">
                  Valid until:{" "}
                  {new Date(voucher.valid_until).toLocaleDateString()}
                </p>
              )}

              {expired && !voucher.is_redeemed && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    This voucher has expired
                  </p>
                </div>
              )}

              {voucher.voucher_type !== "credit" && !voucher.is_redeemed && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Use this voucher during checkout when making a booking
                  </p>
                </div>
              )}

              {redeemable && (
                <button
                  onClick={() => handleRedeem(voucher)}
                  disabled={isPending && redeemingCode === voucher.code}
                  className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPending && redeemingCode === voucher.code
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isPending && redeemingCode === voucher.code
                    ? "Redeeming..."
                    : "Redeem Now"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
