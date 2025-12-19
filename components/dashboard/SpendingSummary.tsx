"use client";

import { TrendingUp, DollarSign, CreditCard, CheckCircle } from "lucide-react";

interface SpendingSummaryProps {
  totalSpent: number;
  averageBookingValue: number;
  totalPaid: number;
  pendingPayments: number;
  completedBookings: number;
}

export default function SpendingSummary({
  totalSpent,
  averageBookingValue,
  totalPaid,
  pendingPayments,
  completedBookings,
}: SpendingSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const stats = [
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: "blue",
      description: "All-time spending",
    },
    {
      label: "Average Booking",
      value: formatCurrency(averageBookingValue),
      icon: TrendingUp,
      color: "green",
      description: "Per booking average",
    },
    {
      label: "Pending Payments",
      value: formatCurrency(pendingPayments),
      icon: CreditCard,
      color: "yellow",
      description: "Awaiting payment",
    },
    {
      label: "Completed Services",
      value: completedBookings.toString(),
      icon: CheckCircle,
      color: "purple",
      description: "Total completed",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-[#e6f0ff]",
        icon: "bg-[#007bff] text-white",
        valueText: "text-[#007bff]",
      },
      green: {
        bg: "bg-[#e6ffe6]",
        icon: "bg-[#28a745] text-white",
        valueText: "text-[#28a745]",
      },
      yellow: {
        bg: "bg-[#fffbea]",
        icon: "bg-[#ffc107] text-white",
        valueText: "text-[#ffc107]",
      },
      purple: {
        bg: "bg-[#f7e6ff]",
        icon: "bg-[#6f42c1] text-white",
        valueText: "text-[#6f42c1]",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Spending Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);

          return (
            <div
              key={stat.label}
              className={`${colorClasses.bg} rounded-lg p-3 shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${colorClasses.icon} p-1.5 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm font-medium text-[#4a4a4a] mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${colorClasses.valueText} mb-1`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-[#4a4a4a] opacity-75">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
