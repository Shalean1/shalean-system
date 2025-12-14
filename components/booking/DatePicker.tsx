"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (date: string) => void;
  min?: string;
  error?: boolean;
  className?: string;
}

export default function DatePicker({
  id,
  value,
  onChange,
  min,
  error = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Initialize month based on value prop if available, otherwise use a consistent default
  const getInitialMonth = () => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Use a consistent default date to avoid hydration issues
    return new Date();
  };
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Update month when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date);
      }
    }
  }, [value]);

  const handleInputClick = () => {
    setIsOpen(true);
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
      setIsFocused(true);
    } else if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (!min) return false;
    const minDate = new Date(min);
    minDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < minDate;
  };

  const isDateSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden native input for mobile support */}
      <input
        ref={inputRef}
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Custom styled input */}
      <div
        onClick={handleInputClick}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Select date"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 border rounded-lg bg-white cursor-pointer flex items-center justify-between transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        } ${
          isFocused || isOpen
            ? "ring-2 ring-blue-500 border-blue-500"
            : "focus:outline-none focus:ring-2 focus:ring-blue-500"
        } ${className}`}
      >
        <span
          className={`${
            value ? "text-gray-900" : "text-gray-400"
          } select-none`}
        >
          {value ? formatDisplayDate(value) : "yyyy/mm/dd"}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateMonth("prev");
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous month"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h3 className="text-sm font-semibold text-gray-900">{monthName}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateMonth("next");
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next month"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-gray-500 text-center py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) handleDateSelect(date);
                  }}
                  disabled={disabled}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : selected
                      ? "bg-blue-500 text-white font-semibold hover:bg-blue-600"
                      : isToday
                      ? "bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
