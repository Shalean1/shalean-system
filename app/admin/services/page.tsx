"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllPopularServices, PopularService } from "@/app/actions/popular-services";
import {
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
} from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const servicesData = await getAllPopularServices();
      setServices(servicesData || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services
  const filteredServices = useMemo(() => {
    let result = services;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((service) => {
        const name = service.name.toLowerCase();
        const slug = service.slug.toLowerCase();
        const description = (service.description || "").toLowerCase();
        
        return (
          name.includes(query) ||
          slug.includes(query) ||
          description.includes(query) ||
          service.id.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((service) => service.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((service) => !service.is_active);
    }

    return result;
  }, [services, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-semibold mb-2">Error loading services</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              View and manage all services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchServices}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {services.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Services</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{services.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {services.filter(s => s.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-xl md:text-2xl font-bold text-gray-600">
              {services.filter(s => !s.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Display Order</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {services.length > 0 ? Math.max(...services.map(s => s.display_order)) : 0}
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
              placeholder="Search by name, slug, or description..."
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
              <option value="all">All Services</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
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
              Showing {filteredServices.length} of {services.length} services
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No services found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No services have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {service.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 font-mono truncate">
                        {service.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {service.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Order: {service.display_order}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(service.created_at).toLocaleDateString()}
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
