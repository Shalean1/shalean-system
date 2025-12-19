"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, Sparkles, History } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import BookingCard from "./BookingCard";

interface DashboardStatsProps {
  upcoming: number;
  today: number;
  new: number;
  past: number;
  bookings: Booking[];
}

export default function DashboardStats({
  upcoming,
  today,
  new: newCount,
  past,
  bookings,
}: DashboardStatsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const stats = [
    {
      label: "Upcoming",
      value: upcoming,
      icon: Clock,
      color: "yellow",
      filter: "upcoming",
    },
    {
      label: "Today",
      value: today,
      icon: Calendar,
      color: "blue",
      filter: "today",
    },
    {
      label: "New",
      value: newCount,
      icon: Sparkles,
      color: "purple",
      filter: "new",
    },
    {
      label: "Past",
      value: past,
      icon: History,
      color: "gray",
      filter: "past",
    },
  ];

  const handleStatClick = (filter: string) => {
    // Toggle filter - if same filter clicked, deselect it
    setSelectedFilter(selectedFilter === filter ? null : filter);
  };

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    if (!selectedFilter || !bookings || !Array.isArray(bookings)) return [];

    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(todayDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    switch (selectedFilter) {
      case "upcoming":
        return bookings.filter(
          (b) =>
            (b.status === "pending" || b.status === "confirmed") &&
            b.scheduledDate &&
            b.scheduledDate >= today
        );
      case "today":
        return bookings.filter((b) => b.scheduledDate === today);
      case "new":
        return bookings.filter((b) => {
          if (!b.createdAt) return false;
          const createdAt = new Date(b.createdAt);
          return createdAt >= sevenDaysAgo;
        });
      case "past":
        return bookings.filter(
          (b) => b.scheduledDate && b.scheduledDate < today
        );
      default:
        return [];
    }
  }, [selectedFilter, bookings]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-[#e6f0ff]",
        icon: "bg-[#007bff] text-white",
        hover: "hover:shadow-md hover:-translate-y-1",
        value: "text-[#007bff]",
      },
      yellow: {
        bg: "bg-[#fffbea]",
        icon: "bg-[#ffc107] text-white",
        hover: "hover:shadow-md hover:-translate-y-1",
        value: "text-[#ffc107]",
      },
      purple: {
        bg: "bg-[#f3e8ff]",
        icon: "bg-[#9333ea] text-white",
        hover: "hover:shadow-md hover:-translate-y-1",
        value: "text-[#9333ea]",
      },
      gray: {
        bg: "bg-[#f3f4f6]",
        icon: "bg-[#6b7280] text-white",
        hover: "hover:shadow-md hover:-translate-y-1",
        value: "text-[#6b7280]",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div>
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4 -mx-1 md:mx-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          const isSelected = selectedFilter === stat.filter;

          return (
            <button
              key={stat.label}
              onClick={() => handleStatClick(stat.filter)}
              className={`${colorClasses.bg} p-1.5 md:p-4 rounded-lg md:rounded-xl shadow-sm transition-all duration-300 cursor-pointer text-left ${colorClasses.hover} transform min-w-0 flex flex-col flex-1 md:flex-none ${
                isSelected ? "ring-2 ring-offset-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between h-full w-full">
                <div className="flex-1 w-full md:w-auto text-center md:text-left min-w-0">
                  <p className="text-[9px] md:text-xs font-medium text-[#4a4a4a] mb-0.5 md:mb-2 truncate">{stat.label}</p>
                  <p className={`text-sm md:text-2xl lg:text-3xl font-bold ${colorClasses.value} leading-tight`}>{stat.value}</p>
                </div>
                <div className={`p-1 md:p-2.5 rounded-md md:rounded-xl ${colorClasses.icon} transition-transform duration-300 group-hover:scale-110 mt-1 md:mt-0 flex-shrink-0`}>
                  <Icon className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Display filtered bookings below the cards */}
      {selectedFilter && filteredBookings.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {stats.find((s) => s.filter === selectedFilter)?.label} Bookings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {selectedFilter && filteredBookings.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="flex flex-col items-center">
            <Calendar className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No {stats.find((s) => s.filter === selectedFilter)?.label.toLowerCase()} bookings
            </h3>
            <p className="text-sm text-gray-600">
              {selectedFilter === "upcoming" && "You don't have any upcoming appointments scheduled."}
              {selectedFilter === "today" && "You don't have any bookings scheduled for today."}
              {selectedFilter === "new" && "You don't have any recent bookings."}
              {selectedFilter === "past" && "You don't have any past bookings."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
