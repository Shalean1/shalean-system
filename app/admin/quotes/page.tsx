"use client";

import { useState, useEffect, useMemo } from "react";
import { Quote, getAllQuotes, getQuoteStats, updateQuoteStatus } from "@/app/actions/admin-quotes";
import Link from "next/link";
import {
  Search,
  Filter,
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
  MessageSquare,
  Home,
} from "lucide-react";

type StatusFilter = Quote["status"] | "all";

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [stats, setStats] = useState<any>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const [quotesData, statsData] = await Promise.all([
        getAllQuotes(),
        getQuoteStats(),
      ]);
      setQuotes(quotesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Filter and search quotes
  const filteredQuotes = useMemo(() => {
    let result = quotes;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((q) => q.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((quote) => {
        const name = `${quote.firstName} ${quote.lastName}`.toLowerCase();
        const email = quote.email.toLowerCase();
        const phone = quote.phone.toLowerCase();
        const location = quote.location.toLowerCase();
        const customLocation = (quote.customLocation || "").toLowerCase();
        const service = (quote.service || "").toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          location.includes(query) ||
          customLocation.includes(query) ||
          service.includes(query)
        );
      });
    }

    return result;
  }, [quotes, statusFilter, searchQuery]);

  // Sort quotes
  const sortedQuotes = useMemo(() => {
    const result = [...filteredQuotes];

    switch (sortBy) {
      case "date-desc":
        return result.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case "date-asc":
        return result.sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
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
  }, [filteredQuotes, sortBy]);

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

  const getStatusBadge = (status: Quote["status"]) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
    
    switch (status) {
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "contacted":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
            <MessageSquare className="w-3 h-3 mr-1" />
            Contacted
          </span>
        );
      case "converted":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-700`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Converted
          </span>
        );
      case "declined":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-700`}>
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </span>
        );
      default:
        return <span className={baseClasses}>{status}</span>;
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: Quote["status"]) => {
    const result = await updateQuoteStatus(quoteId, newStatus);
    if (result.success) {
      // Refresh quotes after status update
      fetchQuotes();
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading quotes...</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quotes</h1>
          <button
            onClick={fetchQuotes}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Manage and view all quote requests from customers
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
            <div className="text-xs md:text-sm text-gray-600 mb-1">Contacted</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.byStatus.contacted || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Converted</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.byStatus.converted || 0}</div>
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
              placeholder="Search quotes..."
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
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
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
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs md:text-sm text-gray-600">
            Showing {sortedQuotes.length} of {quotes.length} quote{sortedQuotes.length !== 1 ? "s" : ""}
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
        {sortedQuotes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Filter className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-base font-semibold mb-2">No quotes found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No quotes have been submitted yet."}
            </p>
          </div>
        ) : (
          sortedQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {quote.firstName} {quote.lastName}
                  </h3>
                  <div className="text-sm text-gray-600">{quote.service || "No service selected"}</div>
                </div>
                <div className="ml-2">
                  {getStatusBadge(quote.status)}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="break-all">{quote.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{quote.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {quote.location === "other" && quote.customLocation
                      ? quote.customLocation
                      : quote.location}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {quote.bedrooms} bed{quote.bedrooms !== 1 ? "s" : ""}, {quote.bathrooms} bath{quote.bathrooms !== 1 ? "s" : ""}
                  </span>
                </div>
                {quote.additionalServices.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Extras: </span>
                    {quote.additionalServices.join(", ")}
                  </div>
                )}
                {quote.note && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Note: </span>
                    {quote.note}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {formatDate(quote.createdAt)}
                </div>
                <select
                  value={quote.status}
                  onChange={(e) => handleStatusChange(quote.id, e.target.value as Quote["status"])}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedQuotes.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No quotes found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No quotes have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Contact
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Location
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Service Details
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-sm font-medium text-gray-900">
                        {quote.firstName} {quote.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Mail className="w-3 h-3" />
                        {quote.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {quote.phone}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-900">
                        {quote.location === "other" && quote.customLocation
                          ? quote.customLocation
                          : quote.location}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-900">{quote.service || "—"}</div>
                      <div className="text-xs text-gray-500">
                        {quote.bedrooms} bed{quote.bedrooms !== 1 ? "s" : ""}, {quote.bathrooms} bath{quote.bathrooms !== 1 ? "s" : ""}
                      </div>
                      {quote.additionalServices.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {quote.additionalServices.length} extra{quote.additionalServices.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote.id, e.target.value as Quote["status"])}
                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(quote.createdAt)}</div>
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
