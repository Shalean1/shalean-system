"use client";

import { Home, Calendar } from "lucide-react";
import { FrequencyType } from "@/lib/types/booking";
import { getFrequencyDescription } from "@/lib/pricing";

interface FrequencyCardProps {
  frequency: FrequencyType;
  isSelected: boolean;
  discount?: string;
  onClick: () => void;
}

const frequencyIcons: Record<FrequencyType, typeof Home> = {
  "one-time": Home,
  weekly: Calendar,
  "bi-weekly": Calendar,
  monthly: Calendar,
};

const frequencyNames: Record<FrequencyType, string> = {
  "one-time": "One-Time",
  weekly: "Weekly",
  "bi-weekly": "Bi-Weekly",
  monthly: "Monthly",
};

export default function FrequencyCard({
  frequency,
  isSelected,
  discount,
  onClick,
}: FrequencyCardProps) {
  const Icon = frequencyIcons[frequency];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 border-2 rounded-lg transition-all text-center relative ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
      <p className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
        {frequencyNames[frequency]}
      </p>
      <p className={`text-xs mt-1 ${isSelected ? "text-blue-500" : "text-gray-500"}`}>
        {getFrequencyDescription(frequency)}
      </p>
      {discount && (
        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
          {discount}
        </span>
      )}
    </button>
  );
}
