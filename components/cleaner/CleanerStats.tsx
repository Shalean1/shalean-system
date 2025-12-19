"use client";

import { useState, useMemo } from "react";
import { Calendar, CalendarDays, RotateCcw, XCircle, Plus } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import BookingCard from "@/components/cleaner/BookingCard";

interface CleanerStatsProps {
  upcoming: number;
  today: number;
  new: number;
  past: number;
  bookings?: Booking[];
}

export default function CleanerStats({
  upcoming,
  today,
  new: newCount,
  past,
  bookings = [],
}: CleanerStatsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const stats: Array<{
    label: string;
    icon: typeof Calendar;
    filter: string;
  }> = [
    {
      label: "Upcoming",
      icon: Calendar,
      filter: "upcoming",
    },
    {
      label: "Today",
      icon: CalendarDays,
      filter: "today",
    },
    {
      label: "New",
      icon: RotateCcw,
      filter: "new",
    },
    {
      label: "Past",
      icon: XCircle,
      filter: "past",
    },
  ];

  const handleStatClick = (filter: string) => {
    // Toggle filter - if same filter clicked, deselect it
    setSelectedFilter(selectedFilter === filter ? null : filter);
  };

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    if (!selectedFilter) return [];
    if (!bookings || !Array.isArray(bookings)) return [];

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

  return (
    <div>
      <div className="flex gap-2 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = selectedFilter === stat.filter;
          const isUpcoming = stat.filter === "upcoming";

          return (
            <button
              key={stat.label}
              onClick={() => handleStatClick(stat.filter)}
              className={`
                flex flex-col items-center justify-center
                px-2 py-3 sm:px-4 md:px-6 sm:py-4 rounded-lg
                transition-all duration-200
                cursor-pointer
                flex-1 min-w-0
                ${isSelected 
                  ? "bg-[#4285F4] text-white ring-2 ring-offset-2 ring-blue-500" 
                  : "bg-[#e0e0e0] text-[#4a4a4a]"
                }
                hover:opacity-90
              `}
            >
              <div className="relative mb-1 sm:mb-2 flex items-center justify-center">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? "text-white" : "text-[#4a4a4a]"}`} />
                {isUpcoming && (
                  <Plus 
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 ${isSelected ? "text-white" : "text-[#4a4a4a]"}`}
                    strokeWidth={3}
                  />
                )}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${isSelected ? "text-white" : "text-[#4a4a4a]"}`}>
                {stat.label}
              </span>
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
