import { Booking } from "@/lib/types/booking";

interface PaymentStatusBadgeProps {
  paymentStatus: Booking["paymentStatus"];
}

export default function PaymentStatusBadge({
  paymentStatus,
}: PaymentStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Payment Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    completed: {
      label: "Paid",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    failed: {
      label: "Payment Failed",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[paymentStatus];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${config.className}`}
    >
      {config.label}
    </span>
  );
}
