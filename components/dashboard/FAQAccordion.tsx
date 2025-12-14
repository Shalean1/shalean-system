"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQQuestion {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  questions: FAQQuestion[];
}

export default function FAQAccordion({ questions }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {questions.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-gray-300"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-4 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-gray-900 flex-1">
                {faq.question}
              </span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0">
                <div className="pt-2 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
