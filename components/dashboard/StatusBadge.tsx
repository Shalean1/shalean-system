import { Booking } from "@/lib/types/booking";

interface StatusBadgeProps {
  status: Booking["status"];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<Booking["status"], { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-purple-100 text-purple-800 border-purple-300",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${config.className}`}
    >
      {config.label}
    </span>
  );
}
