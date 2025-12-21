"use client";

import { Users } from "lucide-react";

interface TeamCardProps {
  id: string;
  name: string;
  memberCount?: number;
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

export default function TeamCard({ id, name, memberCount, isSelected, isAvailable = true, onClick }: TeamCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={`p-4 border-2 rounded-lg transition-all text-left relative ${
        !isAvailable
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : isSelected
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
          <Users className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
            {name}
          </p>
          {memberCount !== undefined && memberCount > 0 ? (
            <p className="text-sm text-gray-500">{memberCount} {memberCount === 1 ? 'member' : 'members'}</p>
          ) : (
            <p className="text-sm text-gray-500">Team</p>
          )}
          {!isAvailable && (
            <p className="text-sm text-red-500 mt-1">Unavailable</p>
          )}
        </div>
      </div>
    </button>
  );
}
