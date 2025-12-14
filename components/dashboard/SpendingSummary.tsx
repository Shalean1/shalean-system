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
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        icon: "bg-blue-500 text-white",
        border: "border-blue-200",
        text: "text-blue-900",
        valueText: "text-blue-700",
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        icon: "bg-green-500 text-white",
        border: "border-green-200",
        text: "text-green-900",
        valueText: "text-green-700",
      },
      yellow: {
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
        icon: "bg-yellow-500 text-white",
        border: "border-yellow-200",
        text: "text-yellow-900",
        valueText: "text-yellow-700",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100",
        icon: "bg-purple-500 text-white",
        border: "border-purple-200",
        text: "text-purple-900",
        valueText: "text-purple-700",
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
              className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg p-3 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${colorClasses.icon} p-1.5 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-sm font-medium ${colorClasses.text} mb-1`}>
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${colorClasses.valueText} mb-1`}>
                {stat.value}
              </p>
              <p className={`text-[10px] ${colorClasses.text} opacity-75`}>
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
