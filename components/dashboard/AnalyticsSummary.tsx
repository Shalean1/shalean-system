"use client";

import { CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AnalyticsSummaryProps {
  pendingPayments: number;
}

export default function AnalyticsSummary({
  pendingPayments,
}: AnalyticsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Quick Analytics</h3>
        <Link
          href="/dashboard/analytics"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          View Full Analytics
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="bg-[#fffbea] rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-[#ffc107] text-white p-1.5 rounded-lg">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <p className="text-sm font-medium text-[#4a4a4a] mb-1">
          Pending Payments
        </p>
        <p className="text-2xl font-bold text-[#ffc107] mb-1">
          {formatCurrency(pendingPayments)}
        </p>
        <p className="text-[10px] text-[#4a4a4a] opacity-75">
          Awaiting payment
        </p>
      </div>
    </div>
  );
}



