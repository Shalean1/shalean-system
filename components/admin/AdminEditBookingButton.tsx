"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import AdminEditBookingModal from "./AdminEditBookingModal";

interface AdminEditBookingButtonProps {
  booking: Booking;
  onSuccess?: () => void;
}

export default function AdminEditBookingButton({ booking, onSuccess }: AdminEditBookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit Booking
      </button>

      <AdminEditBookingModal
        booking={booking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
