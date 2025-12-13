"use client";

import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  serviceType?: string;
}

export default function ProgressIndicator({ currentStep, serviceType }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: "Service & Details" },
    { number: 2, label: "Schedule & Cleaner" },
    { number: 3, label: "Contact & Review" },
  ];

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isUpcoming = step.number > currentStep;

        return (
          <div key={step.number} className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-blue-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 text-white ring-2 ring-blue-200"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs md:text-sm font-medium hidden sm:inline ${
                  isCurrent ? "text-blue-500" : isCompleted ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 md:w-12 h-0.5 transition-colors ${
                  isCompleted ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
