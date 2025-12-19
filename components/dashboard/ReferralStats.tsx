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
        bg: "bg-[#e6f0ff]",
        icon: "bg-[#007bff] text-white",
        value: "text-[#007bff]",
      },
      green: {
        bg: "bg-[#e6ffe6]",
        icon: "bg-[#28a745] text-white",
        value: "text-[#28a745]",
      },
      purple: {
        bg: "bg-[#f7e6ff]",
        icon: "bg-[#6f42c1] text-white",
        value: "text-[#6f42c1]",
      },
      yellow: {
        bg: "bg-[#fffbea]",
        icon: "bg-[#ffc107] text-white",
        value: "text-[#ffc107]",
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
            className={`${colors.bg} rounded-xl p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#4a4a4a] mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold ${colors.value}`}>{stat.value}</p>
              </div>
              <div className={`${colors.icon} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
