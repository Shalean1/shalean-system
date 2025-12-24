"use client";

import { useState, useEffect, useMemo } from "react";
import { Booking } from "@/lib/types/booking";
import { getAllBookings, getBookingStats } from "@/app/actions/admin-bookings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentStatusBadge from "@/components/dashboard/PaymentStatusBadge";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";

type StatusFilter = Booking["status"] | "all";
type PaymentStatusFilter = Booking["paymentStatus"] | "all";
type CleanerResponseFilter = Booking["cleanerResponse"] | "all" | "no-response";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "name-asc" | "name-desc";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>("all");
  const [cleanerResponseFilter, setCleanerResponseFilter] = useState<CleanerResponseFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [stats, setStats] = useState<any>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getAllBookings(),
        getBookingStats(),
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== "all") {
      result = result.filter((b) => b.paymentStatus === paymentStatusFilter);
    }

    // Apply cleaner response filter
    if (cleanerResponseFilter !== "all") {
      if (cleanerResponseFilter === "no-response") {
        result = result.filter((b) => !b.cleanerResponse);
      } else {
        result = result.filter((b) => b.cleanerResponse === cleanerResponseFilter);
      }
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
        const customerName = `${booking.firstName} ${booking.lastName}`.toLowerCase();
        const email = booking.email.toLowerCase();
        const phone = booking.phone.toLowerCase();

        return (
          serviceType.toLowerCase().includes(query) ||
          address.includes(query) ||
          reference.includes(query) ||
          customerName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      });
    }

    return result;
  }, [bookings, statusFilter, paymentStatusFilter, cleanerResponseFilter, searchQuery]);

  // Sort bookings
  const sortedBookings = useMemo(() => {
    const result = [...filteredBookings];

    switch (sortBy) {
      case "date-desc":
        return result.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case "date-asc":
        return result.sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      case "amount-desc":
        return result.sort((a, b) => b.totalAmount - a.totalAmount);
      case "amount-asc":
        return result.sort((a, b) => a.totalAmount - b.totalAmount);
      case "name-asc":
        return result.sort((a, b) => {
          const aName = `${a.firstName} ${a.lastName}`;
          const bName = `${b.firstName} ${b.lastName}`;
          return aName.localeCompare(bName);
        });
      case "name-desc":
        return result.sort((a, b) => {
          const aName = `${a.firstName} ${a.lastName}`;
          const bName = `${b.firstName} ${b.lastName}`;
          return bName.localeCompare(aName);
        });
      default:
        return result;
    }
  }, [filteredBookings, sortBy]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCleanerResponseBadge = (response: Booking["cleanerResponse"]) => {
    if (!response) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
          <Clock className="w-3 h-3 mr-1" />
          No Response
        </span>
      );
    }
    if (response === "accepted") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Accepted
        </span>
      );
    }
    if (response === "declined") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/booking/service/standard/details"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Booking</span>
            </Link>
            <button
              onClick={fetchBookings}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Manage and view all customer bookings
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.byStatus.completed || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Paid</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.byPaymentStatus.completed || 0}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Filter Row - Stack on mobile */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatusFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Payment Pending</option>
              <option value="completed">Paid</option>
              <option value="failed">Payment Failed</option>
            </select>

            {/* Cleaner Response Filter */}
            <select
              value={cleanerResponseFilter ?? "all"}
              onChange={(e) => setCleanerResponseFilter(e.target.value as CleanerResponseFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Responses</option>
              <option value="no-response">No Response</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2 md:ml-auto">
              <ArrowUpDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs md:text-sm text-gray-600">
            Showing {sortedBookings.length} of {bookings.length} booking{sortedBookings.length !== 1 ? "s" : ""}
            {(statusFilter !== "all" || paymentStatusFilter !== "all" || cleanerResponseFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPaymentStatusFilter("all");
                  setCleanerResponseFilter("all");
                  setSearchQuery("");
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Filter className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-base font-semibold mb-2">No bookings found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all" || cleanerResponseFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No bookings have been created yet."}
            </p>
          </div>
        ) : (
          sortedBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 mb-1">{booking.bookingReference}</div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {booking.firstName} {booking.lastName}
                  </h3>
                  <div className="text-sm text-gray-600">{formatServiceType(booking.service)}</div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-2">
                  <StatusBadge status={booking.status} />
                  <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {formatDate(booking.scheduledDate)} {formatTime(booking.scheduledTime)}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {booking.streetAddress}
                    {booking.aptUnit && `, ${booking.aptUnit}`}, {booking.suburb}, {booking.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="break-all">{booking.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{booking.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="text-lg font-bold text-gray-900">
                    R{booking.totalAmount.toFixed(2)}
                  </div>
                  {booking.tip && booking.tip > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Tip: R{booking.tip.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getCleanerResponseBadge(booking.cleanerResponse)}
                  <Link
                    href={`/admin/bookings/${booking.bookingReference}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No bookings found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all" || cleanerResponseFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No bookings have been created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                    Reference
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Date/Time
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[90px]">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] whitespace-nowrap">
                    Pay
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{booking.bookingReference}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.firstName} {booking.lastName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {booking.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(booking.scheduledDate)}</div>
                      <div className="text-xs text-gray-500">{formatTime(booking.scheduledTime)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">
                      <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/bookings/${booking.bookingReference}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
