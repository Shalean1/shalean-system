"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Cleaner } from "@/lib/supabase/booking-data";
import RateCleanerModal from "./RateCleanerModal";

interface RateCleanerButtonProps {
  cleaner: Cleaner;
}

export default function RateCleanerButton({ cleaner }: RateCleanerButtonProps) {
  const [showRateModal, setShowRateModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowRateModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Rate Cleaner
      </button>

      {showRateModal && (
        <RateCleanerModal
          cleaner={cleaner}
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
        />
      )}
    </>
  );
}

















