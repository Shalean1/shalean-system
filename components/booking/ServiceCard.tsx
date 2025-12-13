"use client";

import { ServiceType } from "@/lib/types/booking";
import { Home, Star, Package, Calendar, Briefcase, Gift } from "lucide-react";

interface ServiceCardProps {
  service: ServiceType;
  isSelected: boolean;
  onClick: () => void;
}

const serviceIcons: Record<ServiceType, typeof Home> = {
  standard: Home,
  deep: Star,
  "move-in-out": Package,
  airbnb: Calendar,
  office: Briefcase,
  holiday: Gift,
};

const serviceNames: Record<ServiceType, string> = {
  standard: "Standard Cleaning",
  deep: "Deep Cleaning",
  "move-in-out": "Move In / Out",
  airbnb: "Airbnb Cleaning",
  office: "Office Cleaning",
  holiday: "Holiday Cleaning",
};

export default function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  const Icon = serviceIcons[service];

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
        {serviceNames[service]}
      </p>
    </button>
  );
}
