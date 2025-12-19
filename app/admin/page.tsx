"use client";

import Link from "next/link";
import { Tag, Users, Calendar, Settings, UserPlus } from "lucide-react";

export default function AdminDashboard() {
  const adminCards = [
    {
      title: "Popular Services",
      description: "Manage popular service tags displayed on the homepage",
      icon: Tag,
      href: "/admin/popular-services",
      color: "blue",
    },
    {
      title: "Cleaner Credentials",
      description: "Create login credentials for cleaners to access their dashboard",
      icon: UserPlus,
      href: "/admin/cleaners/create-credentials",
      color: "green",
    },
    {
      title: "Bookings",
      description: "View and manage customer bookings",
      icon: Calendar,
      href: "/admin/bookings",
      color: "green",
      comingSoon: true,
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/admin/users",
      color: "purple",
      comingSoon: true,
    },
    {
      title: "Settings",
      description: "Configure site settings and preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "gray",
      comingSoon: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      gray: "bg-gray-100 text-gray-600",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your Shalean cleaning services platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color);

            return (
              <Link
                key={card.title}
                href={card.href}
                className={`block p-6 bg-white rounded-xl border-2 border-gray-200 transition-all ${
                  card.comingSoon
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-blue-500 hover:shadow-lg"
                }`}
                onClick={(e) => card.comingSoon && e.preventDefault()}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.title}
                      </h3>
                      {card.comingSoon && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active Services</div>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </div>
        </div>
      </div>
    </div>
  );
}


