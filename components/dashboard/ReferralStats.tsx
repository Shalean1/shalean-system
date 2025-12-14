"use client";

import { Users, Gift, TrendingUp, Coins } from "lucide-react";

interface ReferralStatsProps {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: number;
  pendingRewards: number;
}

export default function ReferralStats({
  totalReferrals,
  successfulReferrals,
  totalRewards,
  pendingRewards,
}: ReferralStatsProps) {
  const stats = [
    {
      label: "Total Referrals",
      value: totalReferrals,
      icon: Users,
      color: "blue",
    },
    {
      label: "Successful Referrals",
      value: successfulReferrals,
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Rewards Earned",
      value: `R${totalRewards.toFixed(2)}`,
      icon: Gift,
      color: "purple",
    },
    {
      label: "Pending Rewards",
      value: `R${pendingRewards.toFixed(2)}`,
      icon: Coins,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200",
        value: "text-blue-700",
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        icon: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200",
        value: "text-green-700",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100",
        icon: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200",
        value: "text-purple-700",
      },
      yellow: {
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
        icon: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200",
        value: "text-yellow-700",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = getColorClasses(stat.color);
        return (
          <div
            key={index}
            className={`${colors.bg} rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colors.icon} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${colors.value}`}>{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
