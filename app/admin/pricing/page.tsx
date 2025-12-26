"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function AdminPricingPage() {
  const [loading, setLoading] = useState(true);
  const [servicePricing, setServicePricing] = useState<ServiceTypePricing[]>([]);
  const [roomPricing, setRoomPricing] = useState<RoomPricing[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<FrequencyOption[]>([]);
  const [pricingSettings, setPricingSettings] = useState<SystemSetting[]>([]);
  
  // Edit state management
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"service" | "room" | "additional" | "frequency" | "setting" | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    } catch (error) {
      console.error("Error fetching pricing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

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
    </div>
  );
}
