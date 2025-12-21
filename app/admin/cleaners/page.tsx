"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAllCleanersFull,
  CleanerFull,
} from "@/app/actions/admin-bookings";
import {
  Users,
  RefreshCw,
  Search,
  Star,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from "lucide-react";

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<CleanerFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "available" | "unavailable">("all");

  const fetchCleaners = async () => {
    setLoading(true);
    try {
      const cleanersData = await getAllCleanersFull();
      setCleaners(cleanersData);
    } catch (error) {
      console.error("Error fetching cleaners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  // Filter cleaners
  const filteredCleaners = useMemo(() => {
    let result = cleaners;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((cleaner) => {
        const name = cleaner.name.toLowerCase();
        const cleanerId = cleaner.cleanerId.toLowerCase();
        const bio = (cleaner.bio || "").toLowerCase();
        
        return (
          name.includes(query) ||
          cleanerId.includes(query) ||
          bio.includes(query) ||
          cleaner.id.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((cleaner) => cleaner.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter((cleaner) => !cleaner.isActive);
    } else if (statusFilter === "available") {
      result = result.filter((cleaner) => cleaner.isAvailable && cleaner.isActive);
    } else if (statusFilter === "unavailable") {
      result = result.filter((cleaner) => !cleaner.isAvailable || !cleaner.isActive);
    }

    return result;
  }, [cleaners, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading cleaners...</p>
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cleaners</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              View and manage all cleaners and staff members
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCleaners}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {cleaners.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Cleaners</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{cleaners.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {cleaners.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Available</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {cleaners.filter(c => c.isAvailable && c.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Jobs</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {cleaners.reduce((sum, c) => sum + c.totalJobs, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <label className="text-xs md:text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Cleaners</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
              >
                Clear filters
              </button>
            )}
            <div className="text-xs md:text-sm text-gray-600 md:ml-auto">
              Showing {filteredCleaners.length} of {cleaners.length} cleaners
            </div>
          </div>
        </div>
      </div>

      {/* Cleaners List */}
      <div className="space-y-4">
        {filteredCleaners.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No cleaners found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No cleaners have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCleaners.map((cleaner) => (
              <div
                key={cleaner.id}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {cleaner.avatarUrl ? (
                      <img
                        src={cleaner.avatarUrl}
                        alt={cleaner.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Name and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {cleaner.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          {cleaner.cleanerId}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {cleaner.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                        {cleaner.isAvailable && cleaner.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {cleaner.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {cleaner.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  {/* Rating */}
                  {cleaner.rating !== null && cleaner.rating !== undefined ? (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <div>
                        <div className="text-xs text-gray-600">Rating</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {cleaner.rating.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-300" />
                      <div>
                        <div className="text-xs text-gray-600">Rating</div>
                        <div className="text-sm font-semibold text-gray-400">N/A</div>
                      </div>
                    </div>
                  )}

                  {/* Total Jobs */}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-600">Total Jobs</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {cleaner.totalJobs}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Order */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Display Order: {cleaner.displayOrder}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(cleaner.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

