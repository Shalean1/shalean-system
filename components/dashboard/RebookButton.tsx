"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import RebookModal from "./RebookModal";

interface RebookButtonProps {
  booking: Booking;
  onSuccess?: () => void;
}

export default function RebookButton({ booking, onSuccess }: RebookButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRebook = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <button
        onClick={handleRebook}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Rebook
      </button>
      <RebookModal
        isOpen={isModalOpen}
        onClose={handleClose}
        booking={booking}
        onSuccess={handleSuccess}
      />
    </>
  );
}
