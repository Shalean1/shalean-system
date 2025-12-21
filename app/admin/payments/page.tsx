"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllPayments, getPaymentStats, Payment } from "@/app/actions/admin-payments";
import PaymentStatusBadge from "@/components/dashboard/PaymentStatusBadge";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  ArrowUpDown,
  RefreshCw,
  Eye,
  DollarSign,
} from "lucide-react";

type PaymentStatusFilter = Payment["paymentStatus"] | "all";
type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "name-asc" | "name-desc";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [stats, setStats] = useState<any>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [paymentsData, statsData] = await Promise.all([
        getAllPayments(),
        getPaymentStats(),
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let result = payments;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.paymentStatus === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((payment) => {
        const reference = payment.bookingReference.toLowerCase();
        const paymentRef = payment.paymentReference?.toLowerCase() || "";
        const customerName = payment.customerName.toLowerCase();
        const email = payment.customerEmail.toLowerCase();
        const phone = payment.customerPhone.toLowerCase();

        return (
          reference.includes(query) ||
          paymentRef.includes(query) ||
          customerName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      });
    }

    return result;
  }, [payments, statusFilter, searchQuery]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    const result = [...filteredPayments];

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
          return a.customerName.localeCompare(b.customerName);
        });
      case "name-desc":
        return result.sort((a, b) => {
          return b.customerName.localeCompare(a.customerName);
        });
      default:
        return result;
    }
  }, [filteredPayments, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading payments...</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
          <button
            onClick={fetchPayments}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          View and manage all payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Payments</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.completedCount || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pendingCount || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue || 0)}</div>
            {stats.totalTips > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Tips: {formatCurrency(stats.totalTips)}
              </div>
            )}
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
              placeholder="Search payments by reference, customer name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatusFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Payment Pending</option>
              <option value="completed">Paid</option>
              <option value="failed">Payment Failed</option>
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
            Showing {sortedPayments.length} of {payments.length} payment{sortedPayments.length !== 1 ? "s" : ""}
            {(statusFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
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
        {sortedPayments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <DollarSign className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-base font-semibold mb-2">No payments found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No payments have been recorded yet."}
            </p>
          </div>
        ) : (
          sortedPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 mb-1">{payment.bookingReference}</div>
                  {payment.paymentReference && (
                    <div className="text-xs text-gray-500 mb-1">Ref: {payment.paymentReference}</div>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {payment.customerName}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2 ml-2">
                  <PaymentStatusBadge paymentStatus={payment.paymentStatus} />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="break-all">{payment.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{payment.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(payment.totalAmount)}
                  </div>
                  {payment.tip > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Tip: {formatCurrency(payment.tip)}
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/bookings/${payment.bookingReference}`}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
                >
                  <Eye className="w-4 h-4" />
                  View Booking
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedPayments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No payments found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No payments have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                    Booking Ref
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Payment Ref
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{payment.bookingReference}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.paymentReference || (
                          <span className="text-gray-400 italic">No reference</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.customerName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {payment.customerEmail}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {payment.customerPhone}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.createdAt)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.totalAmount)}
                      </div>
                      {payment.tip > 0 && (
                        <div className="text-xs text-gray-500">
                          Tip: {formatCurrency(payment.tip)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">
                      <PaymentStatusBadge paymentStatus={payment.paymentStatus} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/bookings/${payment.bookingReference}`}
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
