"use client";

import { User, Heart } from "lucide-react";

interface CleanerCardProps {
  id: string;
  name: string;
  rating?: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CleanerCard({ id, name, rating, isSelected, onClick }: CleanerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 border-2 rounded-lg transition-all text-left relative ${
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
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
            {name}
          </p>
          {id === "no-preference" ? (
            <p className="text-sm text-gray-500">Best available</p>
          ) : rating ? (
            <p className="text-sm text-gray-500">{rating} ⭐</p>
          ) : null}
        </div>
        {id !== "no-preference" && (
          <Heart className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
  );
}
