"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Users, History } from "lucide-react";

export default function CleanersViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "previous";

  const handleViewChange = (newView: "previous" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "all") {
      params.set("view", "all");
    } else {
      params.delete("view");
    }
    router.push(`/dashboard/cleaners?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg inline-flex">
      <button
        onClick={() => handleViewChange("previous")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === "previous"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <History className="w-4 h-4" />
        Previously Booked
      </button>
      <button
        onClick={() => handleViewChange("all")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === "all"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Users className="w-4 h-4" />
        All Cleaners
      </button>
    </div>
  );
}
