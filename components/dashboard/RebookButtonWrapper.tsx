"use client";

import { useRouter } from "next/navigation";
import RebookButton from "./RebookButton";
import { Booking } from "@/lib/types/booking";

interface RebookButtonWrapperProps {
  booking: Booking;
}

export default function RebookButtonWrapper({ booking }: RebookButtonWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show updated booking
    router.refresh();
  };

  return <RebookButton booking={booking} onSuccess={handleSuccess} />;
}
