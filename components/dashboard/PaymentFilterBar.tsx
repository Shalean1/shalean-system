"use client";

import { Filter, Search, ArrowUpDown } from "lucide-react";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status";
type PaymentStatusFilter = "all" | "pending" | "completed";

interface PaymentFilterBarProps {
  filter: PaymentStatusFilter;
  setFilter: (filter: PaymentStatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  statusCounts: {
    all: number;
    pending: number;
    completed: number;
  };
}

export default function PaymentFilterBar({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  statusCounts,
}: PaymentFilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {(["all", "pending", "completed"] as PaymentStatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({statusCounts[status]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-3 flex-1 md:justify-end">
          {/* Search */}
          <div className="flex-1 md:max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="status">By Status</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { SortOption, PaymentStatusFilter };
