"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Booking } from "@/lib/types/booking";

interface RescheduleButtonProps {
  booking: Booking;
}

export default function RescheduleButton({ booking }: RescheduleButtonProps) {
  const router = useRouter();

  // Don't show reschedule button if booking is cancelled or completed
  if (booking.status === "cancelled" || booking.status === "completed") {
    return null;
  }

  const handleReschedule = () => {
    router.push(`/dashboard/bookings/${booking.bookingReference}/reschedule`);
  };

  return (
    <button
      onClick={handleReschedule}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
    >
      <Calendar className="w-4 h-4" />
      Reschedule
    </button>
  );
}
