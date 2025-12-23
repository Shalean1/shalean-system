"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAllCleanersFull,
  CleanerFull,
} from "@/app/actions/admin-bookings";
import {
  addCleaner,
  updateCleaner,
  deleteCleaner,
} from "@/app/actions/cleaners";
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
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import CleanerAreasModal from "@/components/admin/CleanerAreasModal";
import { getServiceLocations, ServiceLocation } from "@/lib/supabase/booking-data";

interface CleanerFormData {
  cleaner_id: string;
  name: string;
  bio: string;
  rating: string;
  total_jobs: string;
  avatar_url: string;
  display_order: string;
  is_active: boolean;
  is_available: boolean;
  availability_days: string[];
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<CleanerFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "available" | "unavailable">("all");
  
  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<CleanerFull | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CleanerFull | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Areas modal state
  const [isAreasModalOpen, setIsAreasModalOpen] = useState(false);
  const [selectedCleanerForAreas, setSelectedCleanerForAreas] = useState<CleanerFull | null>(null);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<CleanerFormData>({
    cleaner_id: "",
    name: "",
    bio: "",
    rating: "",
    total_jobs: "0",
    avatar_url: "",
    display_order: "",
    is_active: true,
    is_available: true,
  });

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
    // Fetch service locations for areas modal
    const loadServiceLocations = async () => {
      try {
        const locations = await getServiceLocations();
        setServiceLocations(locations);
      } catch (error) {
        console.error("Error fetching service locations:", error);
      }
    };
    loadServiceLocations();
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setEditingCleaner(null);
      setFormError(null);
      setSuccessMessage(null);
      setFormData({
        cleaner_id: "",
        name: "",
        bio: "",
        rating: "",
        total_jobs: "0",
        avatar_url: "",
        display_order: "",
        is_active: true,
        is_available: true,
        availability_days: [],
      });
    }
  }, [isModalOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingCleaner) {
      setFormData({
        cleaner_id: editingCleaner.cleanerId,
        name: editingCleaner.name,
        bio: editingCleaner.bio || "",
        rating: editingCleaner.rating?.toString() || "",
        total_jobs: editingCleaner.totalJobs.toString(),
        avatar_url: editingCleaner.avatarUrl || "",
        display_order: editingCleaner.displayOrder.toString(),
        is_active: editingCleaner.isActive,
        is_available: editingCleaner.isAvailable,
        availability_days: editingCleaner.availabilityDays || [],
      });
    }
  }, [editingCleaner]);

  const handleOpenAddModal = () => {
    setEditingCleaner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cleaner: CleanerFull) => {
    setEditingCleaner(cleaner);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDeleteDialog = (cleaner: CleanerFull) => {
    setDeleteTarget(cleaner);
    setIsDeleting(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleOpenAreasModal = (cleaner: CleanerFull) => {
    setSelectedCleanerForAreas(cleaner);
    setIsAreasModalOpen(true);
  };

  const handleCloseAreasModal = () => {
    setIsAreasModalOpen(false);
    setSelectedCleanerForAreas(null);
  };

  const handleAreasModalSuccess = () => {
    // Refresh cleaners list to show updated areas
    fetchCleaners();
  };

  const validateForm = (): boolean => {
    setFormError(null);

    if (!formData.cleaner_id.trim()) {
      setFormError("Cleaner ID is required");
      return false;
    }

    // Validate cleaner_id format (lowercase, hyphens, alphanumeric)
    const cleanerIdPattern = /^[a-z0-9-]+$/;
    if (!cleanerIdPattern.test(formData.cleaner_id.trim())) {
      setFormError("Cleaner ID must be lowercase with hyphens only (e.g., 'natasha-m')");
      return false;
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError("Name is required and must be at least 2 characters");
      return false;
    }

    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      setFormError("Rating must be between 0 and 5");
      return false;
    }

    if (formData.total_jobs && parseInt(formData.total_jobs) < 0) {
      setFormError("Total jobs must be 0 or greater");
      return false;
    }

    if (formData.display_order && parseInt(formData.display_order) < 0) {
      setFormError("Display order must be 0 or greater");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const input = {
        cleaner_id: formData.cleaner_id.trim().toLowerCase(),
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        total_jobs: formData.total_jobs ? parseInt(formData.total_jobs) : undefined,
        avatar_url: formData.avatar_url.trim() || undefined,
        display_order: formData.display_order ? parseInt(formData.display_order) : undefined,
        is_active: formData.is_active,
        is_available: formData.is_available,
        availability_days: formData.availability_days.length > 0 ? formData.availability_days : undefined,
      };

      let result;
      if (editingCleaner) {
        result = await updateCleaner(editingCleaner.id, input);
      } else {
        result = await addCleaner(input);
      }

      if (result.success) {
        setSuccessMessage(editingCleaner ? "Cleaner updated successfully!" : "Cleaner created successfully!");
        await fetchCleaners();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setFormError(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving cleaner:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const result = await deleteCleaner(deleteTarget.id);
      
      if (result.success) {
        setSuccessMessage("Cleaner deleted successfully!");
        await fetchCleaners();
        setTimeout(() => {
          handleCloseDeleteDialog();
        }, 1000);
      } else {
        setFormError(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error deleting cleaner:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

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
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cleaner</span>
            </button>
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

                {/* Availability Days */}
                {cleaner.availabilityDays && cleaner.availabilityDays.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Available Days:</div>
                    <div className="flex flex-wrap gap-1">
                      {cleaner.availabilityDays.map((day) => (
                        <span
                          key={day}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenAreasModal(cleaner)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors touch-manipulation"
                    title="Manage working areas"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Areas</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(cleaner)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
                    title="Edit cleaner"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteDialog(cleaner)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors touch-manipulation"
                    title="Delete cleaner"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCleaner ? "Edit Cleaner" : "Add New Cleaner"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={formLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cleaner ID */}
                <div>
                  <label htmlFor="cleaner_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Cleaner ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cleaner_id"
                    value={formData.cleaner_id}
                    onChange={(e) => setFormData({ ...formData, cleaner_id: e.target.value })}
                    disabled={formLoading || !!editingCleaner}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., natasha-m"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Lowercase with hyphens only</p>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={formLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Cleaner name"
                    required
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={formLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Cleaner biography or description"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    id="rating"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    disabled={formLoading}
                    min="0"
                    max="5"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0.00 - 5.00"
                  />
                </div>

                {/* Total Jobs */}
                <div>
                  <label htmlFor="total_jobs" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Jobs
                  </label>
                  <input
                    type="number"
                    id="total_jobs"
                    value={formData.total_jobs}
                    onChange={(e) => setFormData({ ...formData, total_jobs: e.target.value })}
                    disabled={formLoading}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </div>

                {/* Avatar URL */}
                <div className="md:col-span-2">
                  <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    disabled={formLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="display_order"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    disabled={formLoading}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Auto"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for auto-increment</p>
                </div>

                {/* Status Checkboxes */}
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={formLoading}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      disabled={formLoading}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>

                {/* Availability Days */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.availability_days.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                availability_days: [...formData.availability_days, day],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                availability_days: formData.availability_days.filter((d) => d !== day),
                              });
                            }
                          }}
                          disabled={formLoading}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Select the days of the week this cleaner is available to work
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCleaner ? "Update Cleaner" : "Create Cleaner"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleting && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Cleaner</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseDeleteDialog}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Areas Management Modal */}
      {isAreasModalOpen && selectedCleanerForAreas && (
        <CleanerAreasModal
          cleanerId={selectedCleanerForAreas.cleanerId}
          cleanerName={selectedCleanerForAreas.name}
          availableLocations={serviceLocations}
          onClose={handleCloseAreasModal}
          onSuccess={handleAreasModalSuccess}
        />
      )}
    </div>
  );
}

