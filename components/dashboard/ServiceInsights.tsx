"use client";

import { Sparkles, Calendar, TrendingUp } from "lucide-react";

interface ServiceInsightsProps {
  mostBookedService: string | null;
  favoriteFrequency: string | null;
  totalBookings: number;
}

export default function ServiceInsights({
  mostBookedService,
  favoriteFrequency,
  totalBookings,
}: ServiceInsightsProps) {
  const formatServiceType = (service: string | null) => {
    if (!service) return "N/A";
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatFrequency = (frequency: string | null) => {
    if (!frequency) return "N/A";
    if (frequency === "one-time") return "One-time";
    return frequency
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  if (totalBookings === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Service Insights</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Complete your first booking to see personalized insights about your cleaning preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Service Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Most Booked Service</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatServiceType(mostBookedService)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Favorite Frequency</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatFrequency(favoriteFrequency)}
          </p>
        </div>
      </div>
    </div>
  );
}
