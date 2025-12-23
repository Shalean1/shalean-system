"use client";

import { useState, useTransition, useEffect } from "react";
import { updateCleanerAreas, getCleanerAreas } from "@/app/actions/admin-cleaner-areas";
import { Check, Loader2, MapPin, X } from "lucide-react";
import { ServiceLocation } from "@/lib/supabase/booking-data";

interface CleanerAreasModalProps {
  cleanerId: string;
  cleanerName: string;
  availableLocations: ServiceLocation[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CleanerAreasModal({
  cleanerId,
  cleanerName,
  availableLocations,
  onClose,
  onSuccess,
}: CleanerAreasModalProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load current areas on mount
  useEffect(() => {
    const loadAreas = async () => {
      setIsLoading(true);
      const result = await getCleanerAreas(cleanerId);
      if (result.success && result.data) {
        setSelectedAreas(result.data);
      }
      setIsLoading(false);
    };
    loadAreas();
  }, [cleanerId]);

  const handleToggle = (areaName: string) => {
    setSelectedAreas((prev) => {
      if (prev.includes(areaName)) {
        return prev.filter((area) => area !== areaName);
      } else {
        return [...prev, areaName];
      }
    });
    setMessage(null);
  };

  const handleSave = async () => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateCleanerAreas(cleanerId, selectedAreas);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setMessage({ type: "error", text: result.error || result.message });
      }
    });
  };

  // Filter locations based on search query
  const filteredLocations = availableLocations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Working Areas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {cleanerName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading areas...</span>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search areas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Areas Selection */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Service Areas
                </h3>
                
                {filteredLocations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No areas found matching your search.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {filteredLocations.map((location) => {
                      const isSelected = selectedAreas.includes(location.name);
                      return (
                        <label
                          key={location.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`text-base font-medium ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}>
                            {location.name}
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggle(location.name)}
                              className="sr-only"
                              disabled={isPending}
                            />
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Selected areas ({selectedAreas.length}): </span>
                  {selectedAreas.length > 0
                    ? selectedAreas.slice(0, 5).join(", ") + (selectedAreas.length > 5 ? ` and ${selectedAreas.length - 5} more...` : "")
                    : "None selected"}
                </p>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-lg p-4 ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || isLoading}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isPending || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

