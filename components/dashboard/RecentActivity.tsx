"use client";

import { Booking } from "@/lib/types/booking";
import { Calendar, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentActivityProps {
  bookings: Booking[];
}

export default function RecentActivity({ bookings }: RecentActivityProps) {
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      case "confirmed":
        return <CheckCircle className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-700 bg-red-50 border-red-200";
      case "confirmed":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
  };

  if (recentBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href="/dashboard/bookings"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {recentBookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/dashboard/bookings/${booking.bookingReference}`}
            className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(booking.status)}
                  <h4 className="font-medium text-gray-900 truncate">
                    {formatServiceType(booking.service)}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {booking.streetAddress}, {booking.suburb}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatDate(booking.createdAt)}</span>
                  <span>•</span>
                  <span>R{booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
