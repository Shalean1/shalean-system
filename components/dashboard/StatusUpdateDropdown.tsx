"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import { updateBookingStatusAction } from "@/app/actions/update-booking-status";
import { useRouter } from "next/navigation";

interface StatusUpdateDropdownProps {
  booking: Booking;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: Array<{ value: Booking["status"]; label: string; color: string }> = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "in-progress", label: "In Progress", color: "purple" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

export default function StatusUpdateDropdown({ booking, onSuccess }: StatusUpdateDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: Booking["status"]) => {
    if (newStatus === booking.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateBookingStatusAction(booking.bookingReference, newStatus);
      if (result.success) {
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === booking.status);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
          currentStatus?.color === "yellow" ? "bg-yellow-50 text-yellow-800 border-yellow-300" :
          currentStatus?.color === "blue" ? "bg-blue-50 text-blue-800 border-blue-300" :
          currentStatus?.color === "purple" ? "bg-purple-50 text-purple-800 border-purple-300" :
          currentStatus?.color === "blue" ? "bg-blue-50 text-blue-800 border-blue-300" :
          currentStatus?.color === "red" ? "bg-red-50 text-red-800 border-red-300" :
          "bg-gray-50 text-gray-800"
        }`}
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            {currentStatus?.label || booking.status}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 z-20 whitespace-nowrap">
          {error}
        </div>
      )}

      {isOpen && !isUpdating && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  option.value === booking.status ? "bg-blue-50" : ""
                } ${
                  option.value === "pending" ? "text-yellow-800" :
                  option.value === "confirmed" ? "text-blue-800" :
                  option.value === "in-progress" ? "text-purple-800" :
                  option.value === "completed" ? "text-blue-800" :
                  "text-red-800"
                }`}
              >
                <span>{option.label}</span>
                {option.value === booking.status && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
