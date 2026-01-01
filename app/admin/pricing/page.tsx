"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  getAllPricingData,
  updateServiceTypePricing,
  updateRoomPricing,
  updateAdditionalService,
  updateFrequencyOption,
  updateSystemSetting,
  createServiceTypePricing,
  deleteServiceTypePricing,
  createAdditionalService,
  deleteAdditionalService,
} from "@/app/actions/admin-pricing";
import {
  getAllPopularServices,
  addPopularService,
  updatePopularService,
  deletePopularService,
  type PopularService,
} from "@/app/actions/popular-services";
import type {
  ServiceTypePricing,
  AdditionalService,
  FrequencyOption,
  RoomPricing,
  SystemSetting,
} from "@/lib/supabase/booking-data";
import {
  RefreshCw,
  Tag,
  Home,
  Plus,
  Calendar,
  Settings,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  X,
  Trash2,
  Sparkles,
  Search,
  Edit,
  Clock,
} from "lucide-react";

export default function AdminPricingPage() {
  const [loading, setLoading] = useState(true);
  const [servicePricing, setServicePricing] = useState<ServiceTypePricing[]>([]);
  const [roomPricing, setRoomPricing] = useState<RoomPricing[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<FrequencyOption[]>([]);
  const [pricingSettings, setPricingSettings] = useState<SystemSetting[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  
  // Edit state management
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"service" | "room" | "additional" | "frequency" | "setting" | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Popular Services state management
  const [popularServicesSearchQuery, setPopularServicesSearchQuery] = useState("");
  const [popularServicesStatusFilter, setPopularServicesStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAddPopularModal, setShowAddPopularModal] = useState(false);
  const [showEditPopularModal, setShowEditPopularModal] = useState(false);
  const [isAddingPopular, setIsAddingPopular] = useState(false);
  const [isUpdatingPopular, setIsUpdatingPopular] = useState(false);
  const [isDeletingPopular, setIsDeletingPopular] = useState<string | null>(null);
  const [deletePopularConfirmId, setDeletePopularConfirmId] = useState<string | null>(null);
  const [editingPopularServiceId, setEditingPopularServiceId] = useState<string | null>(null);
  const [newPopularService, setNewPopularService] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
  });
  const [editPopularService, setEditPopularService] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
  });
  
  // Add service state management
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    service_type: "",
    service_name: "",
    base_price: "",
    description: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Add additional service state management
  const [showAddAdditionalForm, setShowAddAdditionalForm] = useState(false);
  const [newAdditionalService, setNewAdditionalService] = useState({
    service_id: "",
    name: "",
    price_modifier: "",
    description: "",
    icon_name: "",
  });
  const [deletingAdditionalId, setDeletingAdditionalId] = useState<string | null>(null);
  
  // Edit additional service state management
  const [editingAdditionalId, setEditingAdditionalId] = useState<string | null>(null);
  const [editAdditionalService, setEditAdditionalService] = useState({
    service_id: "",
    name: "",
    price_modifier: "",
    description: "",
    icon_name: "",
  });

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const data = await getAllPricingData();
      setServicePricing(data.servicePricing);
      setRoomPricing(data.roomPricing);
      setAdditionalServices(data.additionalServices);
      setFrequencyOptions(data.frequencyOptions);
      setPricingSettings(data.pricingSettings);
      
      const popularData = await getAllPopularServices();
      setPopularServices(popularData || []);
    } catch (error) {
      console.error("Error fetching pricing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);
  
  // Popular Services helper functions
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };
  
  const handlePopularNameChange = (name: string) => {
    setNewPopularService({
      ...newPopularService,
      name,
      slug: generateSlug(name),
    });
  };
  
  const handleEditPopularNameChange = (name: string) => {
    setEditPopularService({
      ...editPopularService,
      name,
      slug: generateSlug(name),
    });
  };
  
  const handleAddPopularService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPopularService.name.trim() || !newPopularService.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setIsAddingPopular(true);
    setError(null);

    try {
      const basePrice = newPopularService.base_price.trim() 
        ? parseFloat(newPopularService.base_price.trim()) 
        : undefined;
      
      if (basePrice !== undefined && (isNaN(basePrice) || basePrice < 0)) {
        setError("Price must be a valid positive number");
        return;
      }

      const result = await addPopularService(
        newPopularService.name.trim(),
        newPopularService.slug.trim(),
        newPopularService.description.trim() || undefined,
        basePrice
      );

      if (result.success && result.data) {
        setPopularServices([...popularServices, result.data]);
        setShowAddPopularModal(false);
        setNewPopularService({ name: "", slug: "", description: "", base_price: "" });
        setError(null);
      } else {
        setError(result.error || "Failed to add service");
      }
    } catch (err) {
      console.error("Error adding popular service:", err);
      setError(err instanceof Error ? err.message : "Failed to add service");
    } finally {
      setIsAddingPopular(false);
    }
  };
  
  const handleDeletePopularService = async (id: string) => {
    setIsDeletingPopular(id);
    setError(null);

    try {
      const result = await deletePopularService(id);

      if (result.success) {
        setPopularServices(popularServices.filter((s) => s.id !== id));
        setDeletePopularConfirmId(null);
      } else {
        setError(result.error || "Failed to delete service");
      }
    } catch (err) {
      console.error("Error deleting popular service:", err);
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setIsDeletingPopular(null);
    }
  };
  
  const handleEditPopularClick = (service: PopularService) => {
    setEditingPopularServiceId(service.id);
    setEditPopularService({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      base_price: service.base_price !== null && service.base_price !== undefined ? service.base_price.toString() : "",
    });
    setShowEditPopularModal(true);
    setError(null);
  };
  
  const handleUpdatePopularService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPopularServiceId) return;
    
    if (!editPopularService.name.trim() || !editPopularService.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setIsUpdatingPopular(true);
    setError(null);

    try {
      const basePrice = editPopularService.base_price.trim() 
        ? parseFloat(editPopularService.base_price.trim()) 
        : undefined;
      
      if (basePrice !== undefined && (isNaN(basePrice) || basePrice < 0)) {
        setError("Price must be a valid positive number");
        return;
      }

      const result = await updatePopularService(editingPopularServiceId, {
        name: editPopularService.name.trim(),
        slug: editPopularService.slug.trim(),
        description: editPopularService.description.trim() || undefined,
        base_price: basePrice,
      });

      if (result.success && result.data) {
        setPopularServices(popularServices.map((s) => (s.id === editingPopularServiceId ? result.data! : s)));
        setShowEditPopularModal(false);
        setEditingPopularServiceId(null);
        setEditPopularService({ name: "", slug: "", description: "", base_price: "" });
        setError(null);
      } else {
        setError(result.error || "Failed to update service");
      }
    } catch (err) {
      console.error("Error updating popular service:", err);
      setError(err instanceof Error ? err.message : "Failed to update service");
    } finally {
      setIsUpdatingPopular(false);
    }
  };
  
  // Filter popular services
  const filteredPopularServices = useMemo(() => {
    let result = popularServices;

    if (popularServicesSearchQuery.trim()) {
      const query = popularServicesSearchQuery.toLowerCase();
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

    if (popularServicesStatusFilter === "active") {
      result = result.filter((service) => service.is_active);
    } else if (popularServicesStatusFilter === "inactive") {
      result = result.filter((service) => !service.is_active);
    }

    return result;
  }, [popularServices, popularServicesSearchQuery, popularServicesStatusFilter]);

  const formatPrice = (amount: number): string => {
    return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const formatServiceType = (serviceType: string): string => {
    return serviceType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleEdit = (
    id: string,
    type: "service" | "room" | "additional" | "frequency" | "setting",
    currentValue: number | string
  ) => {
    setEditingId(id);
    setEditingType(type);
    setEditValue(String(currentValue));
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setEditValue("");
    setError(null);
  };

  const handleSave = async () => {
    if (!editingId || !editingType) return;

    setSaving(true);
    setError(null);

    try {
      let result;
      
      if (editingType === "setting") {
        // For settings, validate based on setting type
        const setting = pricingSettings.find((s) => s.id === editingId);
        if (setting?.setting_key.includes("percentage")) {
          const numValue = parseFloat(editValue);
          if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            setError("Please enter a valid percentage between 0 and 100");
            setSaving(false);
            return;
          }
        } else {
          const numValue = parseFloat(editValue);
          if (isNaN(numValue) || numValue < 0) {
            setError("Please enter a valid positive number");
            setSaving(false);
            return;
          }
        }
        result = await updateSystemSetting(editingId, { setting_value: editValue });
        if (result.success) {
          setPricingSettings((prev) =>
            prev.map((item) =>
              item.id === editingId ? { ...item, setting_value: editValue } : item
            )
          );
        }
      } else {
        // For all other types, validate as number
        const numValue = parseFloat(editValue);
        if (isNaN(numValue) || numValue < 0) {
          setError("Please enter a valid positive number");
          setSaving(false);
          return;
        }

        // Additional validation for frequency (percentage)
        if (editingType === "frequency" && (numValue < 0 || numValue > 100)) {
          setError("Discount percentage must be between 0 and 100");
          setSaving(false);
          return;
        }

        switch (editingType) {
          case "service": {
            result = await updateServiceTypePricing(editingId, { base_price: numValue });
            if (result.success) {
              setServicePricing((prev) =>
                prev.map((item) =>
                  item.id === editingId ? { ...item, base_price: numValue } : item
                )
              );
            }
            break;
          }
          case "room": {
            result = await updateRoomPricing(editingId, { price_per_room: numValue });
            if (result.success) {
              setRoomPricing((prev) =>
                prev.map((item) =>
                  item.id === editingId ? { ...item, price_per_room: numValue } : item
                )
              );
            }
            break;
          }
          case "additional": {
            result = await updateAdditionalService(editingId, { price_modifier: numValue });
            if (result.success) {
              setAdditionalServices((prev) =>
                prev.map((item) =>
                  item.id === editingId ? { ...item, price_modifier: numValue } : item
                )
              );
            }
            break;
          }
          case "frequency": {
            result = await updateFrequencyOption(editingId, { discount_percentage: numValue });
            if (result.success) {
              setFrequencyOptions((prev) =>
                prev.map((item) =>
                  item.id === editingId ? { ...item, discount_percentage: numValue } : item
                )
              );
            }
            break;
          }
        }
      }

      if (result && !result.success) {
        setError(result.error || "Failed to update");
      } else {
        handleCancelEdit();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    setSaving(true);
    setError(null);

    // Validation
    if (!newService.service_type.trim()) {
      setError("Service type is required");
      setSaving(false);
      return;
    }
    if (!newService.service_name.trim()) {
      setError("Service name is required");
      setSaving(false);
      return;
    }
    const basePrice = parseFloat(newService.base_price);
    if (isNaN(basePrice) || basePrice < 0) {
      setError("Please enter a valid positive price");
      setSaving(false);
      return;
    }

    try {
      const result = await createServiceTypePricing({
        service_type: newService.service_type.trim(),
        service_name: newService.service_name.trim(),
        base_price: basePrice,
        description: newService.description.trim() || undefined,
      });

      if (result.success && result.data) {
        setServicePricing((prev) => [...prev, result.data!].sort((a, b) => a.display_order - b.display_order));
        setShowAddForm(false);
        setNewService({
          service_type: "",
          service_name: "",
          base_price: "",
          description: "",
        });
      } else {
        setError(result.error || "Failed to create service");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error adding service:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const result = await deleteServiceTypePricing(id);

      if (result.success) {
        setServicePricing((prev) => prev.filter((service) => service.id !== id));
      } else {
        setError(result.error || "Failed to delete service");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error deleting service:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddAdditionalService = async () => {
    setSaving(true);
    setError(null);

    // Validation
    if (!newAdditionalService.service_id.trim()) {
      setError("Service ID is required");
      setSaving(false);
      return;
    }
    if (!newAdditionalService.name.trim()) {
      setError("Service name is required");
      setSaving(false);
      return;
    }
    const priceModifier = parseFloat(newAdditionalService.price_modifier);
    if (isNaN(priceModifier) || priceModifier < 0) {
      setError("Please enter a valid positive price modifier");
      setSaving(false);
      return;
    }

    try {
      const result = await createAdditionalService({
        service_id: newAdditionalService.service_id.trim(),
        name: newAdditionalService.name.trim(),
        price_modifier: priceModifier,
        description: newAdditionalService.description.trim() || undefined,
        icon_name: newAdditionalService.icon_name.trim() || undefined,
      });

      if (result.success && result.data) {
        setAdditionalServices((prev) => [...prev, result.data!].sort((a, b) => a.display_order - b.display_order));
        setShowAddAdditionalForm(false);
        setNewAdditionalService({
          service_id: "",
          name: "",
          price_modifier: "",
          description: "",
          icon_name: "",
        });
      } else {
        setError(result.error || "Failed to create additional service");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error adding additional service:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdditionalService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this additional service? This action cannot be undone.")) {
      return;
    }

    setDeletingAdditionalId(id);
    setError(null);

    try {
      const result = await deleteAdditionalService(id);

      if (result.success) {
        setAdditionalServices((prev) => prev.filter((service) => service.id !== id));
      } else {
        setError(result.error || "Failed to delete additional service");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error deleting additional service:", err);
    } finally {
      setDeletingAdditionalId(null);
    }
  };

  const handleEditAdditionalService = (service: AdditionalService) => {
    setEditingAdditionalId(service.id);
    setEditAdditionalService({
      service_id: service.service_id,
      name: service.name,
      price_modifier: String(service.price_modifier),
      description: service.description || "",
      icon_name: service.icon_name || "",
    });
    setError(null);
  };

  const handleCancelEditAdditionalService = () => {
    setEditingAdditionalId(null);
    setEditAdditionalService({
      service_id: "",
      name: "",
      price_modifier: "",
      description: "",
      icon_name: "",
    });
    setError(null);
  };

  const handleSaveAdditionalService = async () => {
    if (!editingAdditionalId) return;

    setSaving(true);
    setError(null);

    // Validation
    if (!editAdditionalService.service_id.trim()) {
      setError("Service ID is required");
      setSaving(false);
      return;
    }
    if (!editAdditionalService.name.trim()) {
      setError("Service name is required");
      setSaving(false);
      return;
    }
    const priceModifier = parseFloat(editAdditionalService.price_modifier);
    if (isNaN(priceModifier) || priceModifier < 0) {
      setError("Please enter a valid positive price modifier");
      setSaving(false);
      return;
    }

    try {
      const result = await updateAdditionalService(editingAdditionalId, {
        service_id: editAdditionalService.service_id.trim(),
        name: editAdditionalService.name.trim(),
        price_modifier: priceModifier,
        description: editAdditionalService.description.trim() || undefined,
        icon_name: editAdditionalService.icon_name.trim() || undefined,
      });

      if (result.success) {
        // Update local state
        setAdditionalServices((prev) =>
          prev.map((service) =>
            service.id === editingAdditionalId
              ? {
                  ...service,
                  service_id: editAdditionalService.service_id.trim(),
                  name: editAdditionalService.name.trim(),
                  price_modifier: priceModifier,
                  description: editAdditionalService.description.trim() || undefined,
                  icon_name: editAdditionalService.icon_name.trim() || undefined,
                }
              : service
          )
        );
        handleCancelEditAdditionalService();
      } else {
        setError(result.error || "Failed to update additional service");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error updating additional service:", err);
    } finally {
      setSaving(false);
    }
  };

  // Get service fee percentage
  const serviceFeePercentage = pricingSettings.find(
    (s) => s.setting_key === "service_fee_percentage"
  )?.setting_value || "10";

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading pricing data...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pricing</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage and view all pricing configurations
            </p>
          </div>
          <button
            onClick={fetchPricingData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Popular Services (Homepage)</h2>
          </div>
          <button
            onClick={() => setShowAddPopularModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:p-4 mb-4">
          <div className="space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, slug, or description..."
                value={popularServicesSearchQuery}
                onChange={(e) => setPopularServicesSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs md:text-sm font-medium text-gray-700">Status:</label>
              <select
                value={popularServicesStatusFilter}
                onChange={(e) => setPopularServicesStatusFilter(e.target.value as typeof popularServicesStatusFilter)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
              >
                <option value="all">All Services</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              {(popularServicesSearchQuery || popularServicesStatusFilter !== "all") && (
                <button
                  onClick={() => {
                    setPopularServicesSearchQuery("");
                    setPopularServicesStatusFilter("all");
                  }}
                  className="text-xs md:text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
                >
                  Clear filters
                </button>
              )}
              <div className="text-xs md:text-sm text-gray-600 md:ml-auto">
                Showing {filteredPopularServices.length} of {popularServices.length} services
              </div>
            </div>
          </div>
        </div>

        {filteredPopularServices.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No popular services found</p>
            <p className="text-gray-600 text-sm">
              {popularServicesSearchQuery || popularServicesStatusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No popular services have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPopularServices.map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
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

                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                )}

                {service.base_price !== null && service.base_price !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      R{service.base_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">base price</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Order: {service.display_order}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(service.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPopularClick(service)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletePopularConfirmId(service.id)}
                        disabled={isDeletingPopular === service.id}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <Trash2 className="w-3 h-3" />
                        {isDeletingPopular === service.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Type Pricing */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Service Base Prices</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
        
        {/* Add Service Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newService.service_type}
                  onChange={(e) => setNewService({ ...newService, service_type: e.target.value })}
                  placeholder="e.g., spring-cleaning"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newService.service_name}
                  onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                  placeholder="e.g., Spring Cleaning"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Base Price (R) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newService.base_price}
                  onChange={(e) => setNewService({ ...newService, base_price: e.target.value })}
                  placeholder="e.g., 350.00"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="e.g., Thorough spring cleaning service"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleAddService}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Adding..." : "Add Service"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewService({
                    service_type: "",
                    service_name: "",
                    base_price: "",
                    description: "",
                  });
                  setError(null);
                }}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {servicePricing.length === 0 ? (
          <p className="text-gray-500 text-sm">No service pricing found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicePricing.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                      <div className="text-xs text-gray-500">{service.service_type}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingId === service.id && editingType === "service" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(Number(service.base_price))}
                          </div>
                          <button
                            onClick={() => handleEdit(service.id, "service", service.base_price)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-md">
                        {service.description || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {service.display_order}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        disabled={deletingId === service.id}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room Pricing */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Room Pricing</h2>
        </div>
        {roomPricing.length === 0 ? (
          <p className="text-gray-500 text-sm">No room pricing found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type & Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Per Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomPricing.map((pricing) => {
                  const isEditing = editingId === pricing.id && editingType === "room";
                  return (
                    <tr key={pricing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatServiceType(pricing.service_type)} - {pricing.room_type === "bedroom" ? "Bedroom" : "Bathroom"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={saving}
                              autoFocus
                            />
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPrice(Number(pricing.price_per_room))}
                            </div>
                            <button
                              onClick={() => handleEdit(pricing.id, "room", pricing.price_per_room)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit price"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-500 capitalize">{pricing.room_type}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Additional Services</h2>
          </div>
          <button
            onClick={() => setShowAddAdditionalForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
        
        {/* Add Additional Service Form */}
        {showAddAdditionalForm && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Additional Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdditionalService.service_id}
                  onChange={(e) => setNewAdditionalService({ ...newAdditionalService, service_id: e.target.value })}
                  placeholder="e.g., deep-cleaning"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdditionalService.name}
                  onChange={(e) => setNewAdditionalService({ ...newAdditionalService, name: e.target.value })}
                  placeholder="e.g., Deep Cleaning"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Modifier (R) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAdditionalService.price_modifier}
                  onChange={(e) => setNewAdditionalService({ ...newAdditionalService, price_modifier: e.target.value })}
                  placeholder="e.g., 50.00"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Icon Name (optional)
                </label>
                <input
                  type="text"
                  value={newAdditionalService.icon_name}
                  onChange={(e) => setNewAdditionalService({ ...newAdditionalService, icon_name: e.target.value })}
                  placeholder="e.g., Refrigerator (Lucide icon)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">Lucide icon name (optional)</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newAdditionalService.description}
                  onChange={(e) => setNewAdditionalService({ ...newAdditionalService, description: e.target.value })}
                  placeholder="e.g., Deep cleaning inside your refrigerator"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleAddAdditionalService}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Adding..." : "Add Service"}
              </button>
              <button
                onClick={() => {
                  setShowAddAdditionalForm(false);
                  setNewAdditionalService({
                    service_id: "",
                    name: "",
                    price_modifier: "",
                    description: "",
                    icon_name: "",
                  });
                  setError(null);
                }}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {additionalServices.length === 0 ? (
          <p className="text-gray-500 text-sm">No additional services found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Modifier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {additionalServices.map((service) => {
                  const isEditing = editingAdditionalId === service.id;
                  return (
                    <React.Fragment key={service.id}>
                      {isEditing ? (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900">Edit Additional Service</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Service ID <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAdditionalService.service_id}
                                    onChange={(e) => setEditAdditionalService({ ...editAdditionalService, service_id: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={saving}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Service Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAdditionalService.name}
                                    onChange={(e) => setEditAdditionalService({ ...editAdditionalService, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={saving}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Price Modifier (R) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editAdditionalService.price_modifier}
                                    onChange={(e) => setEditAdditionalService({ ...editAdditionalService, price_modifier: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={saving}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Icon Name (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={editAdditionalService.icon_name}
                                    onChange={(e) => setEditAdditionalService({ ...editAdditionalService, icon_name: e.target.value })}
                                    placeholder="e.g., Refrigerator"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={saving}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Description (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={editAdditionalService.description}
                                    onChange={(e) => setEditAdditionalService({ ...editAdditionalService, description: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={saving}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleSaveAdditionalService}
                                  disabled={saving}
                                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                  onClick={handleCancelEditAdditionalService}
                                  disabled={saving}
                                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.service_id}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPrice(Number(service.price_modifier))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600 max-w-md">
                              {service.description || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
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
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAdditionalService(service)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit service"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdditionalService(service.id)}
                                disabled={deletingAdditionalId === service.id}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frequency Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Frequency Discounts</h2>
        </div>
        {frequencyOptions.length === 0 ? (
          <p className="text-gray-500 text-sm">No frequency options found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {frequencyOptions.map((option) => (
                  <tr key={option.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{option.name}</div>
                      <div className="text-xs text-gray-500">{option.frequency_id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingId === option.id && editingType === "frequency" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                            autoFocus
                          />
                          <span className="text-sm text-gray-500">%</span>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">
                              {Number(option.discount_percentage).toFixed(1)}%
                            </span>
                          </div>
                          <button
                            onClick={() => handleEdit(option.id, "frequency", option.discount_percentage)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit discount"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {option.display_label || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-md">
                        {option.description || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {option.is_active ? (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">System Settings</h2>
        </div>
        {pricingSettings.length === 0 ? (
          <p className="text-gray-500 text-sm">No pricing settings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingSettings.map((setting) => (
              <div
                key={setting.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900">
                      {setting.setting_key
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </h3>
                  </div>
                </div>
                <div className="mt-2">
                  {editingId === setting.id && editingType === "setting" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type={setting.setting_key.includes("percentage") ? "number" : "number"}
                          step={setting.setting_key.includes("percentage") ? "0.1" : "0.01"}
                          min="0"
                          max={setting.setting_key.includes("percentage") ? "100" : undefined}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                          autoFocus
                        />
                        {setting.setting_key.includes("percentage") && (
                          <span className="text-sm text-gray-500">%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {setting.setting_key.includes("percentage")
                            ? `${setting.setting_value}%`
                            : formatPrice(Number(setting.setting_value))}
                        </div>
                        <button
                          onClick={() => handleEdit(setting.id, "setting", setting.setting_value)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit setting"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Popular Service Modal */}
      {showAddPopularModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Popular Service</h2>
              <button
                onClick={() => {
                  setShowAddPopularModal(false);
                  setNewPopularService({ name: "", slug: "", description: "", base_price: "" });
                  setError(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPopularService} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="popular-service-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="popular-service-name"
                  type="text"
                  value={newPopularService.name}
                  onChange={(e) => handlePopularNameChange(e.target.value)}
                  placeholder="e.g., Spring Cleaning"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="popular-service-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  id="popular-service-slug"
                  type="text"
                  value={newPopularService.slug}
                  onChange={(e) => setNewPopularService({ ...newPopularService, slug: e.target.value })}
                  placeholder="e.g., spring-cleaning"
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier (lowercase, hyphens only)
                </p>
              </div>

              <div>
                <label htmlFor="popular-service-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="popular-service-description"
                  value={newPopularService.description}
                  onChange={(e) => setNewPopularService({ ...newPopularService, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="popular-service-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="popular-service-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPopularService.base_price}
                    onChange={(e) => setNewPopularService({ ...newPopularService, base_price: e.target.value })}
                    placeholder="e.g., 250.00"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Base price in ZAR (e.g., 250.00)
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPopularModal(false);
                    setNewPopularService({ name: "", slug: "", description: "", base_price: "" });
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPopular || !newPopularService.name.trim() || !newPopularService.slug.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingPopular ? "Adding..." : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Popular Service Confirmation Modal */}
      {deletePopularConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Popular Service</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this popular service? This action cannot be undone.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDeletePopularConfirmId(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePopularService(deletePopularConfirmId)}
                  disabled={isDeletingPopular === deletePopularConfirmId}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingPopular === deletePopularConfirmId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popular Service Modal */}
      {showEditPopularModal && editingPopularServiceId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Popular Service</h2>
              <button
                onClick={() => {
                  setShowEditPopularModal(false);
                  setEditingPopularServiceId(null);
                  setEditPopularService({ name: "", slug: "", description: "", base_price: "" });
                  setError(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePopularService} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="edit-popular-service-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-popular-service-name"
                  type="text"
                  value={editPopularService.name}
                  onChange={(e) => handleEditPopularNameChange(e.target.value)}
                  placeholder="e.g., Spring Cleaning"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-popular-service-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-popular-service-slug"
                  type="text"
                  value={editPopularService.slug}
                  onChange={(e) => setEditPopularService({ ...editPopularService, slug: e.target.value })}
                  placeholder="e.g., spring-cleaning"
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier (lowercase, hyphens only)
                </p>
              </div>

              <div>
                <label htmlFor="edit-popular-service-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="edit-popular-service-description"
                  value={editPopularService.description}
                  onChange={(e) => setEditPopularService({ ...editPopularService, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="edit-popular-service-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="edit-popular-service-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPopularService.base_price}
                    onChange={(e) => setEditPopularService({ ...editPopularService, base_price: e.target.value })}
                    placeholder="e.g., 250.00"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Base price in ZAR (e.g., 250.00)
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPopularModal(false);
                    setEditingPopularServiceId(null);
                    setEditPopularService({ name: "", slug: "", description: "", base_price: "" });
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPopular || !editPopularService.name.trim() || !editPopularService.slug.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPopular ? "Updating..." : "Update Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
