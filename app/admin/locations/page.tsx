"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllLocations, Location, addLocation, updateLocation, deleteLocation } from "@/app/actions/locations";
import {
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

interface LocationFormData {
  name: string;
  slug: string;
  city: string;
  suburb: string;
  display_order: string;
  is_active: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    slug: "",
    city: "Cape Town",
    suburb: "",
    display_order: "",
    is_active: true,
  });

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const locationsData = await getAllLocations();
      setLocations(locationsData || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        slug: location.slug,
        city: location.city,
        suburb: location.suburb || "",
        display_order: location.display_order.toString(),
        is_active: location.is_active,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        slug: "",
        city: "Cape Town",
        suburb: "",
        display_order: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleOpenDeleteDialog = (location: Location) => {
    setDeleteTarget(location);
    setIsDeleting(true);
    setFormError(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleting(false);
    setDeleteTarget(null);
    setFormError(null);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!editingLocation) {
      // Only auto-generate slug when creating new location
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, name, slug: generatedSlug }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError("Name is required and must be at least 2 characters");
      return false;
    }

    if (!formData.slug.trim()) {
      setFormError("Slug is required");
      return false;
    }

    // Validate slug format (lowercase, hyphens, alphanumeric)
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(formData.slug.trim())) {
      setFormError("Slug must be lowercase with hyphens only (e.g., 'sea-point')");
      return false;
    }

    if (!formData.city.trim()) {
      setFormError("City is required");
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
      let result;
      if (editingLocation) {
        result = await updateLocation(editingLocation.id, {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          city: formData.city.trim(),
          suburb: formData.suburb.trim() || undefined,
          display_order: formData.display_order ? parseInt(formData.display_order) : undefined,
          is_active: formData.is_active,
        });
      } else {
        result = await addLocation(
          formData.name.trim(),
          formData.city.trim(),
          formData.suburb.trim() || undefined,
          formData.slug.trim(),
          formData.display_order ? parseInt(formData.display_order) : undefined
        );
      }

      if (result.success) {
        setSuccessMessage(editingLocation ? "Location updated successfully!" : "Location created successfully!");
        await fetchLocations();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setFormError(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving location:", error);
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
      const result = await deleteLocation(deleteTarget.id);
      
      if (result.success) {
        setSuccessMessage("Location deleted successfully!");
        await fetchLocations();
        setTimeout(() => {
          handleCloseDeleteDialog();
        }, 1000);
      } else {
        setFormError(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter locations
  const filteredLocations = useMemo(() => {
    let result = locations;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((location) => {
        const name = location.name.toLowerCase();
        const slug = location.slug.toLowerCase();
        const city = location.city.toLowerCase();
        const suburb = (location.suburb || "").toLowerCase();
        
        return (
          name.includes(query) ||
          slug.includes(query) ||
          city.includes(query) ||
          suburb.includes(query) ||
          location.id.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((location) => location.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((location) => !location.is_active);
    }

    return result;
  }, [locations, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading locations...</p>
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
              <p className="text-red-800 font-semibold mb-2">Error loading locations</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchLocations}
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Locations</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage service location suburbs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLocations}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {locations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Locations</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{locations.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {locations.filter(l => l.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-xl md:text-2xl font-bold text-gray-600">
              {locations.filter(l => !l.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Cities</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {new Set(locations.map(l => l.city)).size}
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
              placeholder="Search by name, slug, city, or suburb..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs md:text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Locations</option>
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
              Showing {filteredLocations.length} of {locations.length} locations
            </div>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {filteredLocations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No locations found</p>
            <p className="text-gray-600 text-sm mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No locations have been added yet."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Location
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {location.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-gray-500 font-mono truncate">
                        {location.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {location.is_active ? (
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

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">City:</span> {location.city}
                  </div>
                  {location.suburb && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Suburb:</span> {location.suburb}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Order: {location.display_order}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(location.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(location)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteDialog(location)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                    placeholder="sea-point"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">URL-friendly identifier (lowercase, hyphens only)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suburb (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Atlantic Seaboard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    min="0"
                    placeholder="Auto"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingLocation ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Location</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseDeleteDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}

