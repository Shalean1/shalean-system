"use client";

import { useState, useMemo } from "react";
import { Booking } from "@/lib/types/booking";
import BookingCard from "./BookingCard";
import { Filter, Search, ArrowUpDown } from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
}

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status";

export default function BookingList({ bookings }: BookingListProps) {
  const [filter, setFilter] = useState<Booking["status"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // Filter and search bookings
  const filteredAndSearchedBookings = useMemo(() => {
    let result = bookings;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((booking) => booking.status === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((booking) => {
        const serviceType = booking.service
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        const address = `${booking.streetAddress} ${booking.suburb} ${booking.city}`.toLowerCase();
        const reference = booking.bookingReference.toLowerCase();
        
        return (
          serviceType.toLowerCase().includes(query) ||
          address.includes(query) ||
          reference.includes(query) ||
          booking.firstName?.toLowerCase().includes(query) ||
          booking.lastName?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [bookings, filter, searchQuery]);

  // Sort bookings
  const sortedBookings = useMemo(() => {
    const result = [...filteredAndSearchedBookings];

    switch (sortBy) {
      case "date-desc":
        return result.sort((a, b) => {
          if (a.scheduledDate && b.scheduledDate) {
            return b.scheduledDate.localeCompare(a.scheduledDate);
          }
          if (a.scheduledDate) return -1;
          if (b.scheduledDate) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      
      case "date-asc":
        return result.sort((a, b) => {
          if (a.scheduledDate && b.scheduledDate) {
            return a.scheduledDate.localeCompare(b.scheduledDate);
          }
          if (a.scheduledDate) return 1;
          if (b.scheduledDate) return -1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      
      case "amount-desc":
        return result.sort((a, b) => b.totalAmount - a.totalAmount);
      
      case "amount-asc":
        return result.sort((a, b) => a.totalAmount - b.totalAmount);
      
      case "status":
        const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
        return result.sort((a, b) => {
          const aOrder = statusOrder[a.status] ?? 99;
          const bOrder = statusOrder[b.status] ?? 99;
          return aOrder - bOrder;
        });
      
      default:
        return result;
    }
  }, [filteredAndSearchedBookings, sortBy]);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-600 text-lg mb-2">No bookings found</p>
        <p className="text-gray-500 text-sm">
          Start by booking a cleaning service to see your appointments here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by service, address, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Filter Tabs and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ] as const
              ).map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === status.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {status.label} ({statusCounts[status.value]})
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {sortedBookings.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {sortedBookings.length} of {bookings.length} booking{sortedBookings.length !== 1 ? "s" : ""}
          {(filter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Bookings Grid */}
      {sortedBookings.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold mb-2">
            {searchQuery
              ? "No bookings match your search"
              : filter !== "all"
              ? `No ${filter} bookings found`
              : "No bookings found"}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Start by booking a cleaning service to see your appointments here."}
          </p>
          {(searchQuery || filter !== "all") && (
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              Clear Filters
            </button>
          )}
          {bookings.length === 0 && (
            <a
              href="/booking/service/standard/details"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Your First Service
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
