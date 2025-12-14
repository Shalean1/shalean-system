"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PurchasableVoucher } from "@/app/actions/vouchers";
import { purchaseVoucher, completeVoucherPurchase } from "@/app/actions/vouchers";
import { initializePaystack } from "@/lib/paystack";
import { Gift, CreditCard, Percent, Tag, ShoppingCart, Loader2, CheckCircle } from "lucide-react";

interface PurchasableVouchersListProps {
  vouchers: PurchasableVoucher[];
}

export default function PurchasableVouchersList({ vouchers }: PurchasableVouchersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check for purchase success in URL params and complete purchase
  useEffect(() => {
    const purchased = searchParams.get("purchased");
    const reference = searchParams.get("reference");
    
    if (purchased === "true" && reference) {
      // Get voucher_id from sessionStorage (stored before payment)
      const storedVoucherId = sessionStorage.getItem(`voucher_purchase_${reference}`);
      
      if (storedVoucherId) {
        // Complete the voucher purchase (in case webhook hasn't fired yet)
        startTransition(async () => {
          const result = await completeVoucherPurchase(storedVoucherId, reference);
          
          // Clean up sessionStorage
          sessionStorage.removeItem(`voucher_purchase_${reference}`);
          
          if (result.success) {
            setMessage({
              type: "success",
              text: "Voucher purchased successfully! It has been added to your account.",
            });
          } else {
            // Check if it's already completed (webhook might have processed it)
            if (result.message?.includes("already processed") || result.message?.includes("not found")) {
              setMessage({
                type: "success",
                text: "Voucher purchased successfully! It has been added to your account.",
              });
            } else {
              setMessage({
                type: "error",
                text: result.message || "Payment received but voucher allocation failed. Please contact support.",
              });
            }
          }
          
          // Clean up URL
          router.replace("/dashboard/vouchers");
          // Refresh page after a delay to show updated vouchers
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        });
      } else {
        // Fallback: just show success message if voucher_id not found
        setMessage({
          type: "success",
          text: "Payment successful! Your voucher should be available shortly.",
        });
        router.replace("/dashboard/vouchers");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [searchParams, router]);

  const handlePurchase = (voucher: PurchasableVoucher) => {
    setPurchasingId(voucher.id);
    setMessage(null);

    startTransition(async () => {
      const result = await purchaseVoucher(voucher.id);

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message || "Failed to initialize payment",
        });
        setPurchasingId(null);
        return;
      }

      if (!result.publicKey || !result.amount || !result.email || !result.reference) {
        setMessage({
          type: "error",
          text: "Payment initialization failed. Please try again.",
        });
        setPurchasingId(null);
        return;
      }

      // Store voucher_id and reference in sessionStorage for retrieval after payment
      sessionStorage.setItem(`voucher_purchase_${result.reference}`, voucher.id);

      // Initialize Paystack payment
      initializePaystack({
        publicKey: result.publicKey,
        amount: result.amount,
        email: result.email,
        reference: result.reference,
        currency: "ZAR",
        metadata: {
          type: "voucher_purchase",
          voucher_id: voucher.id,
        },
        callback_url: `${window.location.origin}/dashboard/vouchers?purchased=true&reference=${result.reference}`,
        onClose: () => {
          // Clean up sessionStorage on cancel
          sessionStorage.removeItem(`voucher_purchase_${result.reference}`);
          setPurchasingId(null);
          setMessage({
            type: "error",
            text: "Payment was cancelled",
          });
        },
      });
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

  const formatValue = (voucher: PurchasableVoucher) => {
    if (voucher.voucher_type === "credit") {
      return `R${voucher.value.toFixed(2)}`;
    } else if (voucher.voucher_type === "discount_percentage") {
      return `${voucher.value}%`;
    } else {
      return `R${voucher.value.toFixed(2)}`;
    }
  };

  const calculateSavings = (voucher: PurchasableVoucher) => {
    if (voucher.voucher_type === "credit") {
      const savings = voucher.value - voucher.purchase_price;
      if (savings > 0) {
        return savings;
      }
    }
    return null;
  };

  if (vouchers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : null}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher.voucher_type);
          const savings = calculateSavings(voucher);
          const isPurchasing = isPending && purchasingId === voucher.id;

          return (
            <div
              key={voucher.id}
              className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Icon className="h-6 w-6 text-blue-600" />
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
              </div>

              {voucher.description && (
                <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatValue(voucher)}
                  </p>
                  {savings && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Save R{savings.toFixed(2)}!
                    </p>
                  )}
                  {voucher.voucher_type !== "credit" &&
                    voucher.minimum_order_amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Min. order: R{voucher.minimum_order_amount.toFixed(2)}
                      </p>
                    )}
                </div>
              </div>

              {voucher.valid_until && (
                <p className="text-xs text-gray-500 mb-4">
                  Valid until:{" "}
                  {new Date(voucher.valid_until).toLocaleDateString()}
                </p>
              )}

              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Purchase Price</p>
                  <p className="text-xl font-bold text-blue-600">
                    R{voucher.purchase_price.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(voucher)}
                disabled={isPurchasing}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isPurchasing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Purchase Now</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
