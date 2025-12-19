"use client";

import Link from "next/link";
import { Calendar, List, Clock } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "View Schedule",
      href: "/cleaner/schedule",
      icon: Calendar,
      color: "blue",
    },
    {
      label: "All Bookings",
      href: "/cleaner/bookings",
      icon: List,
      color: "green",
    },
    {
      label: "Upcoming Jobs",
      href: "/cleaner/bookings?status=pending,confirmed",
      icon: Clock,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
      yellow: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const colorClasses = getColorClasses(action.color);

        return (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium text-sm ${colorClasses}`}
          >
            <Icon className="w-4 h-4" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
