"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCw } from "lucide-react";

interface AdminDashboardClientProps {
  children: React.ReactNode;
  initialDateRange: string;
}

export default function AdminDashboardClient({
  children,
  initialDateRange,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "lastyear", label: "Last Year" },
    { value: "custom", label: "Custom" },
  ];

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateRange", newRange);
    startTransition(() => {
      router.push(`/admin?${params.toString()}`);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      {/* Date Range Selector and Refresh Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleDateRangeChange(range.value)}
                disabled={isPending}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  dateRange === range.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Auto-refresh {autoRefresh ? "ON" : "OFF"}</span>
            </label>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
