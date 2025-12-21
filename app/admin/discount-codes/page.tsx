"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllDiscountCodes, getDiscountCodeStats, createDiscountCode, DiscountCode, CreateDiscountCodeInput } from "@/app/actions/admin-discount-codes";
import {
  Search,
  Filter,
  RefreshCw,
  Ticket,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Percent,
  Plus,
  X,
} from "lucide-react";

type StatusFilter = "all" | "active" | "inactive" | "expired";
type TypeFilter = "all" | "percentage" | "fixed";

type SortOption = "code-asc" | "code-desc" | "created-desc" | "created-asc" | "usage-desc" | "usage-asc";

export default function AdminDiscountCodesPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("created-desc");
  const [stats, setStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateDiscountCodeInput>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: null,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: null,
    usageLimit: null,
    isActive: true,
  });

  const fetchDiscountCodes = async () => {
    setLoading(true);
    try {
      const [codesData, statsData] = await Promise.all([
        getAllDiscountCodes(),
        getDiscountCodeStats(),
      ]);
      setDiscountCodes(codesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await createDiscountCode(formData);
      
      if (result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          minimumOrderAmount: 0,
          maximumDiscountAmount: null,
          validFrom: new Date().toISOString().split("T")[0],
          validUntil: null,
          usageLimit: null,
          isActive: true,
        });
        // Refresh the list
        await fetchDiscountCodes();
        // Close modal after a short delay
        setTimeout(() => {
          setShowCreateModal(false);
          setSubmitSuccess(false);
        }, 1500);
      } else {
        setSubmitError(result.message);
      }
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create discount code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowCreateModal(false);
      setSubmitError(null);
      setSubmitSuccess(false);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minimumOrderAmount: 0,
        maximumDiscountAmount: null,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: null,
        usageLimit: null,
        isActive: true,
      });
    }
  };

  // Filter and search discount codes
  const filteredCodes = useMemo(() => {
    let result = discountCodes;

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((code) => code.isActive && !isExpired(code));
    } else if (statusFilter === "inactive") {
      result = result.filter((code) => !code.isActive);
    } else if (statusFilter === "expired") {
      result = result.filter((code) => isExpired(code));
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((code) => code.discountType === typeFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((code) => {
        return (
          code.code.toLowerCase().includes(query) ||
          (code.description && code.description.toLowerCase().includes(query))
        );
      });
    }

    return result;
  }, [discountCodes, statusFilter, typeFilter, searchQuery]);

  // Sort discount codes
  const sortedCodes = useMemo(() => {
    const result = [...filteredCodes];

    switch (sortBy) {
      case "code-asc":
        return result.sort((a, b) => a.code.localeCompare(b.code));
      case "code-desc":
        return result.sort((a, b) => b.code.localeCompare(a.code));
      case "created-desc":
        return result.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case "created-asc":
        return result.sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      case "usage-desc":
        return result.sort((a, b) => b.usageCount - a.usageCount);
      case "usage-asc":
        return result.sort((a, b) => a.usageCount - b.usageCount);
      default:
        return result;
    }
  }, [filteredCodes, sortBy]);

  const isExpired = (code: DiscountCode): boolean => {
    if (!code.validUntil) return false;
    return new Date(code.validUntil) < new Date();
  };

  const isCurrentlyValid = (code: DiscountCode): boolean => {
    if (!code.isActive) return false;
    if (isExpired(code)) return false;
    if (new Date(code.validFrom) > new Date()) return false;
    if (code.usageLimit !== null && code.usageCount >= code.usageLimit) return false;
    return true;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiry";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDiscountValue = (code: DiscountCode): string => {
    if (code.discountType === "percentage") {
      return `${code.discountValue}%`;
    }
    return `R${code.discountValue.toFixed(2)}`;
  };

  const formatUsageLimit = (code: DiscountCode): string => {
    if (code.usageLimit === null) return "Unlimited";
    return `${code.usageCount} / ${code.usageLimit}`;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading discount codes...</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Discount Codes</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Discount</span>
            </button>
            <button
              onClick={fetchDiscountCodes}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Manage discount codes and track their usage
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Codes</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Expired</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.expired}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Uses</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
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
              placeholder="Search by code or description..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2 md:ml-auto">
              <TrendingUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
              >
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="code-asc">Code (A-Z)</option>
                <option value="code-desc">Code (Z-A)</option>
                <option value="usage-desc">Most Used</option>
                <option value="usage-asc">Least Used</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs md:text-sm text-gray-600">
            Showing {sortedCodes.length} of {discountCodes.length} code{sortedCodes.length !== 1 ? "s" : ""}
            {(statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
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
        {sortedCodes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Ticket className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-base font-semibold mb-2">No discount codes found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No discount codes have been created yet."}
            </p>
          </div>
        ) : (
          sortedCodes.map((code) => (
            <div
              key={code.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-900 font-mono">{code.code}</span>
                    {isCurrentlyValid(code) ? (
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
                  </div>
                  {code.description && (
                    <p className="text-sm text-gray-600 mb-2">{code.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  {code.discountType === "percentage" ? (
                    <Percent className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-900 font-semibold">{formatDiscountValue(code)}</span>
                  <span className="text-gray-600">discount</span>
                </div>
                {code.minimumOrderAmount > 0 && (
                  <div className="text-xs text-gray-500">
                    Min order: R{code.minimumOrderAmount.toFixed(2)}
                  </div>
                )}
                {code.discountType === "percentage" && code.maximumDiscountAmount && (
                  <div className="text-xs text-gray-500">
                    Max discount: R{code.maximumDiscountAmount.toFixed(2)}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Valid until: {formatDate(code.validUntil)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Usage: {formatUsageLimit(code)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedCodes.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No discount codes found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No discount codes have been created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Code
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Discount
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Min Order
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Valid Until
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Usage
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-mono font-bold text-gray-900">{code.code}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-900">
                        {code.description || <span className="text-gray-400 italic">No description</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {code.discountType === "percentage" ? (
                          <Percent className="w-4 h-4 text-gray-400" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">{formatDiscountValue(code)}</span>
                      </div>
                      {code.discountType === "percentage" && code.maximumDiscountAmount && (
                        <div className="text-xs text-gray-500 mt-1">
                          Max: R{code.maximumDiscountAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        R{code.minimumOrderAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(code.validUntil)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatUsageLimit(code)}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {isCurrentlyValid(code) ? (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Discount Code</h2>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  Discount code created successfully!
                </div>
              )}

              {/* Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., WELCOME10"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">Code will be converted to uppercase</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Welcome discount - 10% off"
                  disabled={isSubmitting}
                />
              </div>

              {/* Discount Type and Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="discountType"
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.discountType === "percentage" ? (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    ) : (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    )}
                    <input
                      id="discountValue"
                      type="number"
                      required
                      min="0"
                      max={formData.discountType === "percentage" ? "100" : undefined}
                      step="0.01"
                      value={formData.discountValue || ""}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      className={`w-full ${formData.discountType === "percentage" ? "pl-8" : "pl-8"} pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                      placeholder={formData.discountType === "percentage" ? "10" : "50"}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.discountType === "percentage" ? "Enter percentage (0-100)" : "Enter amount in ZAR"}
                  </p>
                </div>
              </div>

              {/* Minimum Order Amount */}
              <div>
                <label htmlFor="minimumOrderAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <input
                    id="minimumOrderAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumOrderAmount || ""}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum order total required to use this code (0 = no minimum)</p>
              </div>

              {/* Maximum Discount Amount (only for percentage) */}
              {formData.discountType === "percentage" && (
                <div>
                  <label htmlFor="maximumDiscountAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Discount Amount (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      id="maximumDiscountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maximumDiscountAmount || ""}
                      onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Leave empty for no limit"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Maximum discount cap for percentage codes (leave empty for no limit)</p>
                </div>
              )}

              {/* Valid From */}
              <div>
                <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom || ""}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Valid Until */}
              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil || ""}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value ? e.target.value : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty for no expiry date</p>
              </div>

              {/* Usage Limit */}
              <div>
                <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit
                </label>
                <input
                  id="usageLimit"
                  type="number"
                  min="1"
                  value={formData.usageLimit || ""}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Leave empty for unlimited"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">Maximum number of times this code can be used (leave empty for unlimited)</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active (code can be used immediately)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Discount Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
