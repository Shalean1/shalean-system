"use client";

import { VoucherUsageHistory } from "@/app/actions/vouchers";
import { Calendar, CreditCard, Percent, Tag, Receipt } from "lucide-react";

interface VoucherUsageHistoryProps {
  history: VoucherUsageHistory[];
}

export default function VoucherUsageHistoryComponent({
  history,
}: VoucherUsageHistoryProps) {
  const getVoucherIcon = (type: string) => {
    switch (type) {
      case "credit":
        return CreditCard;
      case "discount_percentage":
        return Percent;
      case "discount_fixed":
        return Tag;
      default:
        return Receipt;
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

  const formatValue = (item: VoucherUsageHistory) => {
    if (item.voucher_type === "credit") {
      return `+R${item.value.toFixed(2)}`;
    } else if (item.voucher_type === "discount_percentage") {
      return `${item.value}%`;
    } else {
      return `R${item.value.toFixed(2)}`;
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Usage History
          </h3>
          <p className="text-gray-600">
            You haven't redeemed any vouchers yet. Redeem a voucher to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Voucher Usage History
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          View all vouchers you've redeemed
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((item) => {
          const Icon = getVoucherIcon(item.voucher_type);
          const isCredit = item.voucher_type === "credit";

          return (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      isCredit ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isCredit ? "text-green-600" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.voucher_code}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {getVoucherTypeLabel(item.voucher_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(item.redeemed_at).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.booking_reference && (
                        <div className="flex items-center gap-1">
                          <Receipt className="h-4 w-4" />
                          <span className="font-mono text-xs">
                            {item.booking_reference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isCredit ? (
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatValue(item)}
                      </p>
                      <p className="text-xs text-gray-500">Credits Added</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatValue(item)}
                      </p>
                      {item.discount_amount && item.order_total && (
                        <p className="text-xs text-gray-500">
                          Saved R{item.discount_amount.toFixed(2)} on R
                          {item.order_total.toFixed(2)} order
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
