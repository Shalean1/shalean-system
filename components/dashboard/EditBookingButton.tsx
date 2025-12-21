"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import EditBookingModal from "./EditBookingModal";

interface EditBookingButtonProps {
  booking: Booking;
  onSuccess?: () => void;
}

export default function EditBookingButton({ booking, onSuccess }: EditBookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show disabled button if booking is cancelled or completed
  if (booking.status === "cancelled" || booking.status === "completed") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg transition-colors cursor-not-allowed opacity-50"
        title="Cannot edit cancelled or completed bookings"
      >
        <Edit className="w-4 h-4" />
        Edit Booking
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit Booking
      </button>

      <EditBookingModal
        booking={booking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
