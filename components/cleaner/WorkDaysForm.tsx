"use client";

import { useState, useTransition } from "react";
import { WorkDaysData, updateWorkDays } from "@/app/actions/cleaner-work-days";
import { Check, Loader2 } from "lucide-react";

interface WorkDaysFormProps {
  initialWorkDays: WorkDaysData;
}

const DAYS_OF_WEEK = [
  { key: "monday" as const, label: "Monday" },
  { key: "tuesday" as const, label: "Tuesday" },
  { key: "wednesday" as const, label: "Wednesday" },
  { key: "thursday" as const, label: "Thursday" },
  { key: "friday" as const, label: "Friday" },
  { key: "saturday" as const, label: "Saturday" },
  { key: "sunday" as const, label: "Sunday" },
] as const;

export default function WorkDaysForm({ initialWorkDays }: WorkDaysFormProps) {
  const [workDays, setWorkDays] = useState<WorkDaysData>(initialWorkDays);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggle = (day: keyof WorkDaysData) => {
    setWorkDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateWorkDays(workDays);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.error || result.message });
      }
    });
  };

  const hasChanges = JSON.stringify(workDays) !== JSON.stringify(initialWorkDays);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Work Days Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Your Available Days
        </h2>
        
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day.key}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-base font-medium text-gray-900">
                {day.label}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={workDays[day.key]}
                  onChange={() => handleToggle(day.key)}
                  className="sr-only"
                  disabled={isPending}
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    workDays[day.key]
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      workDays[day.key] ? "translate-x-6" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Selected days: </span>
          {DAYS_OF_WEEK.filter((day) => workDays[day.key])
            .map((day) => day.label)
            .join(", ") || "None selected"}
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
