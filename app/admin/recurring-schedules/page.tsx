"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAllRecurringSchedules, 
  RecurringSchedule,
  createRecurringSchedule,
  updateRecurringSchedule,
  deleteRecurringSchedule,
  assignCleanerToSchedule,
  getAllCustomers,
  getAllCleaners,
  Customer,
  Cleaner as CleanerType,
} from "@/app/actions/admin-bookings";
import { syncRecurringBookingsToSchedules } from "@/app/actions/sync-recurring-schedules";
import { generateMonthlyBookingsFromSchedules } from "@/app/actions/generate-monthly-bookings";
import DatePicker from "@/components/booking/DatePicker";
import { getTimeSlots } from "@/app/actions/booking-data";
import { FALLBACK_TIME_SLOTS } from "@/lib/supabase/booking-data-fallbacks";
import {
  RotateCcw,
  Calendar,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Plus,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";

type FrequencyFilter = "all" | "weekly" | "bi-weekly" | "monthly" | "custom-weekly";

export default function RecurringSchedulesPage() {
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RecurringSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<Array<{ value: string; label: string }>>(
    FALLBACK_TIME_SLOTS.map(time => ({ value: time, label: time }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  // New modals and forms
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignCleanerModalOpen, setAssignCleanerModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cleaners, setCleaners] = useState<CleanerType[]>([]);
  
  // Form data for create/edit
  const [formData, setFormData] = useState<Partial<RecurringSchedule>>({});

  const fetchRecurringSchedules = async () => {
    setLoading(true);
    try {
      const schedules = await getAllRecurringSchedules();
      setRecurringSchedules(schedules);
    } catch (error) {
      console.error("Error fetching recurring schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringSchedules();
    
    // Load time slots
    const loadTimeSlots = async () => {
      try {
        const timeSlotsData = await getTimeSlots();
        if (timeSlotsData.length > 0) {
          setTimeSlots(timeSlotsData.map(slot => ({
            value: slot.time_value,
            label: slot.display_label || slot.time_value
          })));
        }
      } catch (err) {
        console.error("Failed to load time slots:", err);
      }
    };
    
    // Load customers and cleaners
    const loadDropdownData = async () => {
      try {
        const [customersData, cleanersData] = await Promise.all([
          getAllCustomers(),
          getAllCleaners(),
        ]);
        setCustomers(customersData);
        setCleaners(cleanersData);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };
    
    loadTimeSlots();
    loadDropdownData();
  }, []);

  // Filter recurring schedules
  const filteredSchedules = useMemo(() => {
    let result = recurringSchedules;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((schedule) => {
        const customerName = (schedule.customerName || "").toLowerCase();
        const email = (schedule.customerEmail || "").toLowerCase();
        const phone = (schedule.customerPhone || "").toLowerCase();
        const address = `${schedule.addressLine1} ${schedule.addressSuburb} ${schedule.addressCity}`.toLowerCase();
        
        return (
          customerName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          address.includes(query) ||
          schedule.id.toLowerCase().includes(query)
        );
      });
    }

    // Apply frequency filter
    if (frequencyFilter !== "all") {
      result = result.filter((schedule) => schedule.frequency === frequencyFilter);
    }

    // Apply active filter
    if (activeFilter === "active") {
      result = result.filter((schedule) => schedule.isActive);
    } else if (activeFilter === "inactive") {
      result = result.filter((schedule) => !schedule.isActive);
    }

    return result;
  }, [recurringSchedules, searchQuery, frequencyFilter, activeFilter]);

  const toggleSchedule = (scheduleId: string) => {
    setExpandedSchedules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
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

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  const openRescheduleModal = (schedule: RecurringSchedule) => {
    setSelectedSchedule(schedule);
    setSelectedDate(schedule.startDate || "");
    setSelectedTime(schedule.preferredTime || "");
    setSubmitError(null);
    setSubmitSuccess(false);
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedSchedule(null);
    setSelectedDate("");
    setSelectedTime("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !selectedDate || !selectedTime) {
      setSubmitError("Please select both date and time");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await updateRecurringSchedule(selectedSchedule.id, {
        startDate: selectedDate,
        preferredTime: selectedTime,
      });

      if (result.success) {
        setSubmitSuccess(true);
        await fetchRecurringSchedules();
        setTimeout(() => {
          closeRescheduleModal();
        }, 2000);
      } else {
        setSubmitError(result.error || "Failed to reschedule");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Create new schedule
  const openCreateModal = () => {
    setFormData({
      serviceType: "Standard",
      frequency: "weekly",
      bedrooms: "2",
      bathrooms: "2",
      extras: [],
      isActive: true,
      preferredTime: "09:00:00",
      startDate: new Date().toISOString().split("T")[0],
    });
    setSubmitError(null);
    setSubmitSuccess(false);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setFormData({});
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.serviceType || !formData.frequency || 
        !formData.preferredTime || !formData.startDate || !formData.addressLine1 || 
        !formData.addressSuburb || !formData.addressCity) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createRecurringSchedule({
        customerId: formData.customerId!,
        serviceType: formData.serviceType,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek || null,
        dayOfMonth: formData.dayOfMonth || null,
        preferredTime: formData.preferredTime!,
        bedrooms: formData.bedrooms!,
        bathrooms: formData.bathrooms!,
        extras: formData.extras || [],
        notes: formData.notes || null,
        addressLine1: formData.addressLine1!,
        addressSuburb: formData.addressSuburb!,
        addressCity: formData.addressCity!,
        cleanerId: formData.cleanerId || null,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        startDate: formData.startDate!,
        endDate: formData.endDate || null,
        daysOfWeek: formData.daysOfWeek || null,
        totalAmount: formData.totalAmount || null,
        cleanerEarnings: formData.cleanerEarnings || null,
      });

      if (result.success) {
        setSubmitSuccess(true);
        await fetchRecurringSchedules();
        setTimeout(() => {
          closeCreateModal();
        }, 2000);
      } else {
        setSubmitError(result.error || "Failed to create schedule");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit schedule
  const openEditModal = (schedule: RecurringSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      customerId: schedule.customerId,
      serviceType: schedule.serviceType,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      preferredTime: schedule.preferredTime,
      bedrooms: schedule.bedrooms,
      bathrooms: schedule.bathrooms,
      extras: schedule.extras || [],
      notes: schedule.notes || null,
      addressLine1: schedule.addressLine1,
      addressSuburb: schedule.addressSuburb,
      addressCity: schedule.addressCity,
      cleanerId: schedule.cleanerId,
      isActive: schedule.isActive,
      startDate: schedule.startDate,
      endDate: schedule.endDate || null,
      daysOfWeek: schedule.daysOfWeek || null,
      totalAmount: schedule.totalAmount || null,
      cleanerEarnings: schedule.cleanerEarnings || null,
    });
    setSubmitError(null);
    setSubmitSuccess(false);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedSchedule(null);
    setFormData({});
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await updateRecurringSchedule(selectedSchedule.id, {
        customerId: formData.customerId,
        serviceType: formData.serviceType,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek,
        dayOfMonth: formData.dayOfMonth,
        preferredTime: formData.preferredTime,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        extras: formData.extras,
        notes: formData.notes,
        addressLine1: formData.addressLine1,
        addressSuburb: formData.addressSuburb,
        addressCity: formData.addressCity,
        cleanerId: formData.cleanerId,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        daysOfWeek: formData.daysOfWeek,
        totalAmount: formData.totalAmount,
        cleanerEarnings: formData.cleanerEarnings,
      });

      if (result.success) {
        setSubmitSuccess(true);
        await fetchRecurringSchedules();
        setTimeout(() => {
          closeEditModal();
        }, 2000);
      } else {
        setSubmitError(result.error || "Failed to update schedule");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete schedule
  const openDeleteModal = (schedule: RecurringSchedule) => {
    setSelectedSchedule(schedule);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await deleteRecurringSchedule(selectedSchedule.id);
      if (result.success) {
        await fetchRecurringSchedules();
        closeDeleteModal();
      } else {
        setSubmitError(result.error || "Failed to delete schedule");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign cleaner
  const openAssignCleanerModal = (schedule: RecurringSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({ cleanerId: schedule.cleanerId || null });
    setSubmitError(null);
    setSubmitSuccess(false);
    setAssignCleanerModalOpen(true);
  };

  const closeAssignCleanerModal = () => {
    setAssignCleanerModalOpen(false);
    setSelectedSchedule(null);
    setFormData({});
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleAssignCleaner = async () => {
    if (!selectedSchedule) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await assignCleanerToSchedule(selectedSchedule.id, formData.cleanerId || null);
      if (result.success) {
        setSubmitSuccess(true);
        await fetchRecurringSchedules();
        setTimeout(() => {
          closeAssignCleanerModal();
        }, 2000);
      } else {
        setSubmitError(result.error || "Failed to assign cleaner");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSubmitError(null);

    try {
      const result = await syncRecurringBookingsToSchedules();
      setSyncMessage(result.message);
      
      if (result.success) {
        await fetchRecurringSchedules();
        // Clear error after successful sync
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        // Show errors if any
        if (result.errors && result.errors.length > 0) {
          setSubmitError(result.errors.slice(0, 5).join(". ")); // Show first 5 errors
          console.error("Sync errors:", result.errors);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sync bookings";
      setSubmitError(errorMsg);
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateBookings = async () => {
    setIsGenerating(true);
    setSyncMessage(null);
    setSubmitError(null);

    try {
      const result = await generateMonthlyBookingsFromSchedules();
      setSyncMessage(result.message);
      
      if (!result.success && result.errors.length > 0) {
        setSubmitError(result.errors.slice(0, 3).join(", ")); // Show first 3 errors
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to generate bookings");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading recurring schedules...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recurring Schedules</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage and view all recurring booking series
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>
            <button
              onClick={handleSyncBookings}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors touch-manipulation disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync from Bookings"}</span>
            </button>
            <button
              onClick={handleGenerateBookings}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors touch-manipulation disabled:opacity-50"
            >
              <Calendar className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Generating..." : "Generate Monthly"}</span>
            </button>
            <button
              onClick={fetchRecurringSchedules}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync/Generate Messages */}
      {(syncMessage || submitError) && (
        <div className={`mb-4 rounded-lg p-4 ${
          syncMessage && !submitError 
            ? "bg-green-50 border border-green-200 text-green-800" 
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {syncMessage && (
            <p className="text-sm font-medium mb-1">{syncMessage}</p>
          )}
          {submitError && (
            <div>
              <p className="text-sm font-semibold mb-1">Errors:</p>
              <p className="text-sm">{submitError}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {recurringSchedules.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Schedules</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{recurringSchedules.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {recurringSchedules.filter(s => s.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-xl md:text-2xl font-bold text-gray-600">
              {recurringSchedules.filter(s => !s.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              R{recurringSchedules.reduce((sum, s) => sum + (s.totalAmount || 0), 0).toFixed(2)}
            </div>
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
              placeholder="Search by customer name, email, phone, or address..."
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

            {/* Frequency Filter */}
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as FrequencyFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Frequencies</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom-weekly">Custom Weekly</option>
            </select>

            {/* Active Filter */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Schedules</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Results Count */}
            <div className="text-xs md:text-sm text-gray-600 md:ml-auto">
              Showing {filteredSchedules.length} of {recurringSchedules.length} recurring schedules
              {(frequencyFilter !== "all" || activeFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setFrequencyFilter("all");
                    setActiveFilter("all");
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
      </div>

      {/* Recurring Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No recurring schedules found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || frequencyFilter !== "all" || activeFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No recurring schedules have been created yet."}
            </p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => {
            const isExpanded = expandedSchedules.has(schedule.id);

            return (
              <div
                key={schedule.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Schedule Header */}
                <div
                  className="p-4 md:p-6 cursor-pointer"
                  onClick={() => toggleSchedule(schedule.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {schedule.customerName || "Unknown Customer"}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            {schedule.customerEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {schedule.customerEmail}
                              </span>
                            )}
                            {schedule.customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {schedule.customerPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatFrequency(schedule.frequency)}
                        </span>
                        {schedule.startDate && (
                          <span>
                            Starts: {formatDate(schedule.startDate)}
                          </span>
                        )}
                        {schedule.endDate && (
                          <span>
                            Ends: {formatDate(schedule.endDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.addressSuburb}, {schedule.addressCity}
                        </span>
                        {schedule.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(schedule);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                          title="Edit recurring schedule"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssignCleanerModal(schedule);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                          title="Assign cleaner"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assign Cleaner
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRescheduleModal(schedule);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                          title="Reschedule recurring schedule"
                        >
                          <Calendar className="w-3 h-3" />
                          Reschedule
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(schedule);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                          title="Delete recurring schedule"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSchedule(schedule.id);
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
                      {schedule.totalAmount && (
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Total Amount</div>
                          <div className="text-lg font-bold text-gray-900">
                            R{schedule.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="text-gray-600">Service: </span>
                      <span className="font-medium text-gray-900">
                        {formatServiceType(schedule.serviceType)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Bedrooms: </span>
                      <span className="font-medium text-gray-900">{schedule.bedrooms}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Bathrooms: </span>
                      <span className="font-medium text-gray-900">{schedule.bathrooms}</span>
                    </div>
                    {schedule.extras && schedule.extras.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Extras: </span>
                        <span className="font-medium text-gray-900">
                          {schedule.extras.join(", ")}
                        </span>
                      </div>
                    )}
                    {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Days: </span>
                        <span className="font-medium text-gray-900">
                          {schedule.daysOfWeek.map(d => {
                            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            return days[parseInt(d)] || d;
                          }).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Schedule Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 md:p-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Schedule Details</h4>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Preferred Time:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {formatTime(schedule.preferredTime)}
                              </span>
                            </div>
                            {schedule.dayOfWeek && (
                              <div>
                                <span className="text-gray-600">Day of Week:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parseInt(schedule.dayOfWeek)] || schedule.dayOfWeek}
                                </span>
                              </div>
                            )}
                            {schedule.dayOfMonth && (
                              <div>
                                <span className="text-gray-600">Day of Month:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {schedule.dayOfMonth}
                                </span>
                              </div>
                            )}
                            {schedule.lastGeneratedMonth && (
                              <div>
                                <span className="text-gray-600">Last Generated:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {schedule.lastGeneratedMonth}
                                </span>
                              </div>
                            )}
                            {schedule.cleanerEarnings && (
                              <div>
                                <span className="text-gray-600">Cleaner Earnings:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  R{schedule.cleanerEarnings.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          {schedule.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <span className="text-gray-600 text-sm">Notes:</span>
                              <p className="mt-1 text-gray-900">{schedule.notes}</p>
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-gray-600 text-sm">Address:</span>
                            <p className="mt-1 text-gray-900">
                              {schedule.addressLine1}, {schedule.addressSuburb}, {schedule.addressCity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeRescheduleModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reschedule Recurring Schedule</h2>
              <button
                onClick={closeRescheduleModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Successfully Rescheduled!
                  </h3>
                  <p className="text-blue-700">
                    The recurring schedule has been successfully updated.
                  </p>
                </div>
              ) : (
                <>
                  {/* Schedule Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Schedule Information</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-medium">Customer:</span> {selectedSchedule.customerName || "Unknown"}</p>
                      <p><span className="font-medium">Frequency:</span> {formatFrequency(selectedSchedule.frequency)}</p>
                      <p><span className="font-medium">Service:</span> {formatServiceType(selectedSchedule.serviceType)}</p>
                      {selectedSchedule.startDate && (
                        <p><span className="font-medium">Current Start Date:</span> {formatDate(selectedSchedule.startDate)}</p>
                      )}
                      {selectedSchedule.endDate && (
                        <p><span className="font-medium">End Date:</span> {formatDate(selectedSchedule.endDate)}</p>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Form */}
                  <form onSubmit={handleRescheduleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="rescheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
                          New Start Date *
                        </label>
                        <DatePicker
                          id="rescheduleDate"
                          value={selectedDate}
                          onChange={setSelectedDate}
                          min={getMinDate()}
                          error={!!submitError && !selectedDate}
                        />
                      </div>

                      <div>
                        <label htmlFor="rescheduleTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          New Time *
                        </label>
                        <select
                          id="rescheduleTime"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          disabled={!selectedDate}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                            submitError && !selectedTime ? "border-red-500" : "border-gray-300"
                          } ${!selectedDate ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        >
                          <option value="">
                            {selectedDate ? "Select a time" : "Select date first"}
                          </option>
                          {timeSlots.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-700">{submitError}</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> This will update the start date and preferred time for this recurring schedule. 
                          Future bookings generated from this schedule will use the new date and time.
                        </p>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={closeRescheduleModal}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedDate || !selectedTime}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Rescheduling...
                          </>
                        ) : (
                          "Confirm Reschedule"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeCreateModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Recurring Schedule</h2>
              <button
                onClick={closeCreateModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Successfully Created!</h3>
                  <p className="text-blue-700">The recurring schedule has been created.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                      <select
                        value={formData.customerId || ""}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} {customer.email ? `(${customer.email})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                      <select
                        value={formData.serviceType || ""}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                        <option value="Move-in-out">Move-in-out</option>
                        <option value="Airbnb">Airbnb</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                      <select
                        value={formData.frequency || ""}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom-weekly">Custom Weekly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <DatePicker
                        value={formData.startDate || ""}
                        onChange={(value) => setFormData({ ...formData, startDate: value })}
                        min={getMinDate()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                      <select
                        value={formData.preferredTime || ""}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
                      <input
                        type="text"
                        value={formData.bedrooms || ""}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
                      <input
                        type="text"
                        value={formData.bathrooms || ""}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={formData.addressLine1 || ""}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Suburb *</label>
                      <input
                        type="text"
                        value={formData.addressSuburb || ""}
                        onChange={(e) => setFormData({ ...formData, addressSuburb: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.addressCity || ""}
                        onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cleaner</label>
                      <select
                        value={formData.cleanerId || ""}
                        onChange={(e) => setFormData({ ...formData, cleanerId: e.target.value || null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No cleaner assigned</option>
                        {cleaners.map((cleaner) => (
                          <option key={cleaner.id} value={cleaner.id}>
                            {cleaner.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
                      <select
                        value={formData.isActive ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Schedule"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeEditModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Recurring Schedule</h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Successfully Updated!</h3>
                  <p className="text-blue-700">The recurring schedule has been updated.</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                      <select
                        value={formData.customerId || ""}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} {customer.email ? `(${customer.email})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                      <select
                        value={formData.serviceType || ""}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                        <option value="Move-in-out">Move-in-out</option>
                        <option value="Airbnb">Airbnb</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                      <select
                        value={formData.frequency || ""}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom-weekly">Custom Weekly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <DatePicker
                        value={formData.startDate || ""}
                        onChange={(value) => setFormData({ ...formData, startDate: value })}
                        min={getMinDate()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <DatePicker
                        value={formData.endDate || ""}
                        onChange={(value) => setFormData({ ...formData, endDate: value || null })}
                        min={formData.startDate || getMinDate()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                      <select
                        value={formData.preferredTime || ""}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
                      <input
                        type="text"
                        value={formData.bedrooms || ""}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
                      <input
                        type="text"
                        value={formData.bathrooms || ""}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={formData.addressLine1 || ""}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Suburb *</label>
                      <input
                        type="text"
                        value={formData.addressSuburb || ""}
                        onChange={(e) => setFormData({ ...formData, addressSuburb: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.addressCity || ""}
                        onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cleaner</label>
                      <select
                        value={formData.cleanerId || ""}
                        onChange={(e) => setFormData({ ...formData, cleanerId: e.target.value || null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No cleaner assigned</option>
                        {cleaners.map((cleaner) => (
                          <option key={cleaner.id} value={cleaner.id}>
                            {cleaner.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
                      <select
                        value={formData.isActive ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Schedule"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Recurring Schedule</h2>
              <button
                onClick={closeDeleteModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the recurring schedule for{" "}
                <strong>{selectedSchedule.customerName || "Unknown Customer"}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. All future bookings generated from this schedule will be affected.
              </p>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Schedule"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Cleaner Modal */}
      {assignCleanerModalOpen && selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeAssignCleanerModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Assign Cleaner</h2>
              <button
                onClick={closeAssignCleanerModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Cleaner Assigned!</h3>
                  <p className="text-blue-700">The cleaner has been successfully assigned to this schedule.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Schedule for: <strong>{selectedSchedule.customerName || "Unknown Customer"}</strong>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Cleaner</label>
                    <select
                      value={formData.cleanerId || ""}
                      onChange={(e) => setFormData({ ...formData, cleanerId: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No cleaner assigned</option>
                      {cleaners.map((cleaner) => (
                        <option key={cleaner.id} value={cleaner.id}>
                          {cleaner.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeAssignCleanerModal}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignCleaner}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        "Assign Cleaner"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
