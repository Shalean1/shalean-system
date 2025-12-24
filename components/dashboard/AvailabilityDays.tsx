interface AvailabilityDaysProps {
  availabilityDays?: string[];
  isAvailable?: boolean;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

export default function AvailabilityDays({ availabilityDays, isAvailable = true }: AvailabilityDaysProps) {
  // If no availability days specified and cleaner is available, default to Monday-Friday
  // If cleaner is not available, show all days as unavailable
  const defaultDays = isAvailable 
    ? ["monday", "tuesday", "wednesday", "thursday", "friday"]
    : [];

  const availableDaysSet = new Set(
    (availabilityDays || defaultDays).map(day => day.toLowerCase())
  );

  return (
    <div className="flex items-center justify-between w-full gap-1.5">
      {DAYS_OF_WEEK.map((day) => {
        const isDayAvailable = availableDaysSet.has(day.key.toLowerCase());
        return (
          <div
            key={day.key}
            className={`flex flex-col items-center justify-center flex-1 h-8 rounded text-xs font-medium transition-colors ${
              isDayAvailable
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-400"
            }`}
            title={day.key.charAt(0).toUpperCase() + day.key.slice(1)}
          >
            {day.label}
          </div>
        );
      })}
    </div>
  );
}

















