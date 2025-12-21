"use client";

import { useState, useEffect } from "react";
import { getAllSystemSettingsAdmin, updateSystemSetting } from "@/app/actions/admin-settings";
import type { SystemSetting } from "@/lib/supabase/booking-data";
import {
  Settings,
  RefreshCw,
  Edit2,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Globe,
  Lock,
  Info,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSystemSettingsAdmin();
      // Sort settings by key for better organization
      const sorted = data.sort((a, b) => a.setting_key.localeCompare(b.setting_key));
      setSettings(sorted);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting: SystemSetting) => {
    setEditingId(setting.id);
    setEditValue(setting.setting_value);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setError(null);
    setSuccess(null);
  };

  const validateValue = (value: string, settingType: string, settingKey: string): string | null => {
    if (!value.trim()) {
      return "Value cannot be empty";
    }

    switch (settingType) {
      case "number":
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return "Please enter a valid number";
        }
        // Special validation for percentages
        if (settingKey.includes("percentage")) {
          if (numValue < 0 || numValue > 100) {
            return "Percentage must be between 0 and 100";
          }
        }
        // Special validation for hours
        if (settingKey.includes("hours")) {
          if (numValue < 0) {
            return "Hours must be a positive number";
          }
        }
        // Special validation for max values
        if (settingKey.includes("max_")) {
          if (numValue < 1) {
            return "Maximum value must be at least 1";
          }
        }
        break;
      case "boolean":
        if (value !== "true" && value !== "false") {
          return "Boolean value must be 'true' or 'false'";
        }
        break;
      case "json":
        try {
          JSON.parse(value);
        } catch {
          return "Invalid JSON format";
        }
        break;
    }
    return null;
  };

  const handleSave = async () => {
    if (!editingId) return;

    const setting = settings.find((s) => s.id === editingId);
    if (!setting) return;

    const validationError = validateValue(editValue, setting.setting_type, setting.setting_key);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateSystemSetting(editingId, { setting_value: editValue });
      
      if (result.success) {
        setSettings((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, setting_value: editValue } : item
          )
        );
        setSuccess("Setting updated successfully!");
        setTimeout(() => {
          handleCancelEdit();
        }, 1500);
      } else {
        setError(result.error || "Failed to update setting");
      }
    } catch (err) {
      console.error("Error saving setting:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatSettingKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatValue = (value: string, type: string, key: string): string => {
    if (type === "boolean") {
      return value === "true" ? "Yes" : "No";
    }
    if (type === "number" && key.includes("percentage")) {
      return `${value}%`;
    }
    return value;
  };

  const getInputType = (settingType: string, settingKey: string): string => {
    if (settingType === "boolean") return "text";
    if (settingType === "number") return "number";
    if (settingType === "json") return "text";
    return "text";
  };

  const getInputProps = (settingType: string, settingKey: string) => {
    const baseProps: any = {
      className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      disabled: saving,
      autoFocus: true,
    };

    if (settingType === "number") {
      baseProps.step = settingKey.includes("percentage") ? "0.1" : "1";
      baseProps.min = settingKey.includes("percentage") ? "0" : "0";
      baseProps.max = settingKey.includes("percentage") ? "100" : undefined;
    }

    return baseProps;
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    let category = "General";
    
    if (setting.setting_key.includes("fee") || setting.setting_key.includes("price")) {
      category = "Pricing";
    } else if (setting.setting_key.includes("booking") || setting.setting_key.includes("hours") || setting.setting_key.includes("max_")) {
      category = "Booking";
    } else if (setting.setting_key.includes("location") || setting.setting_key.includes("city")) {
      category = "Location";
    } else if (setting.setting_key.includes("enable") || setting.setting_key.includes("disable")) {
      category = "Features";
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 text-blue-600" />
              Settings
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage system-wide configuration settings
            </p>
          </div>
          <button
            onClick={fetchSettings}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </div>

      {/* Settings by Category */}
      {Object.keys(groupedSettings).length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No settings found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {categorySettings.map((setting) => {
                  const isEditing = editingId === setting.id;
                  return (
                    <div key={setting.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {formatSettingKey(setting.setting_key)}
                            </h3>
                            {setting.is_public ? (
                              <Globe className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          {setting.description && (
                            <div className="flex items-start gap-2 mb-3">
                              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500">{setting.description}</p>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 font-mono mb-2">
                            Key: {setting.setting_key} | Type: {setting.setting_type}
                          </div>
                        </div>
                        <div className="md:w-64 flex-shrink-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              {setting.setting_type === "json" ? (
                                <textarea
                                  {...getInputProps(setting.setting_type, setting.setting_key)}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  rows={4}
                                  className="font-mono text-xs"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    type={getInputType(setting.setting_type, setting.setting_key)}
                                    {...getInputProps(setting.setting_type, setting.setting_key)}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                  />
                                  {setting.setting_type === "number" && setting.setting_key.includes("percentage") && (
                                    <span className="text-sm text-gray-500">%</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Save (Enter)"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Cancel (Esc)"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatValue(setting.setting_value, setting.setting_type, setting.setting_key)}
                                </div>
                                {setting.setting_type === "boolean" && (
                                  <div className="mt-1">
                                    {setting.setting_value === "true" ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Enabled
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Disabled
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleEdit(setting)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit setting"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
