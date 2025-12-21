"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getRecurringCustomers,
  RecurringCustomer,
} from "@/app/actions/admin-bookings";
import {
  Users,
  Mail,
  Phone,
  RefreshCw,
  Search,
  MapPin,
  Calendar,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

export default function RecurringCustomersPage() {
  const [recurringCustomers, setRecurringCustomers] = useState<RecurringCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const fetchRecurringCustomers = async () => {
    setLoading(true);
    try {
      const customers = await getRecurringCustomers();
      setRecurringCustomers(customers);
    } catch (error) {
      console.error("Error fetching recurring customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringCustomers();
  }, []);

  // Filter recurring customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return recurringCustomers;
    }

    const query = searchQuery.toLowerCase();
    return recurringCustomers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      const email = (customer.email || "").toLowerCase();
      const phone = (customer.phone || "").toLowerCase();
      const address = `${customer.addressLine1 || ""} ${customer.addressSuburb || ""} ${customer.addressCity || ""}`.toLowerCase();
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        address.includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    });
  }, [recurringCustomers, searchQuery]);

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

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

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "bi-weekly":
        return "Bi-weekly";
      case "monthly":
        return "Monthly";
      case "custom-weekly":
        return "Custom Weekly";
      default:
        return frequency;
    }
  };

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading recurring customers...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recurring Customers</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              View customers with recurring booking schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecurringCustomers}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {recurringCustomers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{recurringCustomers.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Schedules</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {recurringCustomers.reduce((sum, c) => sum + c.scheduleCount, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active Schedules</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {recurringCustomers.reduce((sum, c) => sum + c.activeScheduleCount, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Showing</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {filteredCustomers.length}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
          />
        </div>
        {searchQuery && (
          <div className="mt-3 text-xs md:text-sm text-gray-600">
            Showing {filteredCustomers.length} of {recurringCustomers.length} customers
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No recurring customers found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery
                ? "Try adjusting your search criteria."
                : "No customers with recurring schedules found."}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const isExpanded = expandedCustomers.has(customer.id);

            return (
              <div
                key={customer.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Customer Header */}
                <div
                  className="p-4 md:p-6 cursor-pointer"
                  onClick={() => toggleCustomer(customer.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {customer.email}
                              </span>
                            )}
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        {customer.addressLine1 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {customer.addressSuburb && customer.addressCity
                              ? `${customer.addressSuburb}, ${customer.addressCity}`
                              : customer.addressLine1}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <RotateCcw className="w-4 h-4" />
                          {customer.scheduleCount} schedule{customer.scheduleCount !== 1 ? "s" : ""}
                        </span>
                        {customer.activeScheduleCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {customer.activeScheduleCount} Active
                          </span>
                        )}
                        {customer.totalBookings && customer.totalBookings !== "0" && (
                          <span className="text-xs text-gray-500">
                            {customer.totalBookings} total booking{customer.totalBookings !== "1" ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCustomer(customer.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Schedule Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 md:p-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Recurring Schedules</h4>
                      <div className="space-y-3">
                        {customer.schedules.length === 0 ? (
                          <p className="text-sm text-gray-500">No schedules found</p>
                        ) : (
                          customer.schedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="bg-white rounded-lg border border-gray-200 p-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Service:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {formatServiceType(schedule.serviceType)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Frequency:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {formatFrequency(schedule.frequency)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Preferred Time:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {formatTime(schedule.preferredTime)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Start Date:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {formatDate(schedule.startDate)}
                                  </span>
                                </div>
                                {schedule.endDate && (
                                  <div>
                                    <span className="text-gray-600">End Date:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {formatDate(schedule.endDate)}
                                    </span>
                                  </div>
                                )}
                                {schedule.totalAmount && (
                                  <div>
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      R{schedule.totalAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  {schedule.isActive ? (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
