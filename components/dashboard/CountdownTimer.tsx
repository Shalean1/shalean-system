"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  scheduledDate: string;
  scheduledTime: string;
}

export default function CountdownTimer({ scheduledDate, scheduledTime }: CountdownTimerProps) {
  const [timeUntil, setTimeUntil] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const appointmentDate = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      const diff = appointmentDate.getTime() - now.getTime();
      
      if (diff < 0) {
        setTimeUntil(null);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntil(`${days} day${days > 1 ? "s" : ""}, ${hours} hour${hours > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        setTimeUntil(`${hours} hour${hours > 1 ? "s" : ""}, ${minutes} minute${minutes > 1 ? "s" : ""}`);
      } else if (minutes > 0) {
        setTimeUntil(`${minutes} minute${minutes > 1 ? "s" : ""}`);
      } else {
        setTimeUntil("Soon");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [scheduledDate, scheduledTime]);

  if (!timeUntil) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
      <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
      <div>
        <p className="text-xs font-medium text-blue-900">
          Next appointment in {timeUntil}
        </p>
      </div>
    </div>
  );
}
