"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full font-semibold text-gray-900 text-sm sm:text-base md:text-lg cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-between list-none text-left gap-2"
      >
        <span className="pr-2 sm:pr-4 text-left">{question}</span>
        <ChevronDown
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

