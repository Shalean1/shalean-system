"use client";

import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStatsProps {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export default function DashboardStats({
  total,
  upcoming,
  completed,
  cancelled,
}: DashboardStatsProps) {
  const router = useRouter();

  const stats = [
    {
      label: "Total Bookings",
      value: total,
      icon: Calendar,
      color: "blue",
      filter: "all",
    },
    {
      label: "Upcoming",
      value: upcoming,
      icon: Clock,
      color: "yellow",
      filter: "upcoming",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "green",
      filter: "completed",
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "red",
      filter: "cancelled",
    },
  ];

  const handleStatClick = (filter: string) => {
    if (filter === "all") {
      router.push("/dashboard/bookings");
    } else if (filter === "upcoming") {
      router.push("/dashboard/bookings?status=pending,confirmed");
    } else {
      router.push(`/dashboard/bookings?status=${filter}`);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200",
        border: "border-blue-200",
        hover: "hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1",
        value: "text-blue-700",
      },
      yellow: {
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
        icon: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200",
        border: "border-yellow-200",
        hover: "hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-200 hover:-translate-y-1",
        value: "text-yellow-700",
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        icon: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200",
        border: "border-green-200",
        hover: "hover:border-green-400 hover:shadow-xl hover:shadow-green-200 hover:-translate-y-1",
        value: "text-green-700",
      },
      red: {
        bg: "bg-gradient-to-br from-red-50 to-red-100",
        icon: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200",
        border: "border-red-200",
        hover: "hover:border-red-400 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-1",
        value: "text-red-700",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);

        return (
          <button
            key={stat.label}
            onClick={() => handleStatClick(stat.filter)}
            className={`${colorClasses.bg} p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${colorClasses.border} ${colorClasses.hover} transform`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${colorClasses.value}`}>{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${colorClasses.icon} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
