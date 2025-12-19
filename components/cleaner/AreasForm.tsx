"use client";

import { useState, useTransition, useEffect } from "react";
import { updateAreas } from "@/app/actions/cleaner-areas";
import { Check, Loader2, MapPin } from "lucide-react";
import { ServiceLocation } from "@/lib/supabase/booking-data";

interface AreasFormProps {
  initialAreas: string[];
  availableLocations: ServiceLocation[];
}

export default function AreasForm({ initialAreas, availableLocations }: AreasFormProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialAreas);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelectedAreas(initialAreas);
  }, [initialAreas]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateAreas(selectedAreas);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.error || result.message });
      }
    });
  };

  const hasChanges = JSON.stringify(selectedAreas.sort()) !== JSON.stringify(initialAreas.sort());

  // Filter locations based on search query
  const filteredLocations = availableLocations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Areas Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Your Service Areas
        </h2>
        
        {filteredLocations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No areas found matching your search.</p>
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !hasChanges}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isPending || !hasChanges
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
