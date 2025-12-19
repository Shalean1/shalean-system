"use client";

import { useState } from "react";
import { CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";

interface ChecklistItem {
  id: string;
  task: string;
  checked: boolean;
}

interface CleaningType {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export default function CleanerChecklistPage() {
  const [checklists, setChecklists] = useState<CleaningType[]>([
    {
      id: "standard",
      name: "Standard Cleaning",
      items: [
        { id: "std-1", task: "Dust all surfaces (furniture, shelves, window sills)", checked: false },
        { id: "std-2", task: "Wipe down countertops and tables", checked: false },
        { id: "std-3", task: "Clean mirrors and glass surfaces", checked: false },
        { id: "std-4", task: "Vacuum carpets and rugs", checked: false },
        { id: "std-5", task: "Mop hard floors", checked: false },
        { id: "std-6", task: "Clean bathroom (toilet, sink, shower, bathtub)", checked: false },
        { id: "std-7", task: "Clean kitchen (sink, appliances, surfaces)", checked: false },
        { id: "std-8", task: "Empty trash bins and replace liners", checked: false },
        { id: "std-9", task: "Make beds and straighten linens", checked: false },
        { id: "std-10", task: "Tidy up and organize items", checked: false },
      ],
    },
    {
      id: "deep",
      name: "Deep Cleaning",
      items: [
        { id: "deep-1", task: "All standard cleaning tasks", checked: false },
        { id: "deep-2", task: "Clean inside oven and microwave", checked: false },
        { id: "deep-3", task: "Clean inside refrigerator", checked: false },
        { id: "deep-4", task: "Deep clean bathroom grout and tiles", checked: false },
        { id: "deep-5", task: "Clean baseboards and trim", checked: false },
        { id: "deep-6", task: "Clean light fixtures and ceiling fans", checked: false },
        { id: "deep-7", task: "Clean window tracks and sills", checked: false },
        { id: "deep-8", task: "Clean behind and under furniture", checked: false },
        { id: "deep-9", task: "Clean inside cabinets and drawers", checked: false },
        { id: "deep-10", task: "Sanitize door handles and light switches", checked: false },
        { id: "deep-11", task: "Clean air vents and filters", checked: false },
        { id: "deep-12", task: "Polish wood furniture", checked: false },
      ],
    },
    {
      id: "airbnb",
      name: "Airbnb Cleaning",
      items: [
        { id: "airbnb-1", task: "All standard cleaning tasks", checked: false },
        { id: "airbnb-2", task: "Change bed linens and make beds", checked: false },
        { id: "airbnb-3", task: "Replace towels with fresh ones", checked: false },
        { id: "airbnb-4", task: "Restock toilet paper, soap, and toiletries", checked: false },
        { id: "airbnb-5", task: "Check and restock kitchen supplies (coffee, tea, etc.)", checked: false },
        { id: "airbnb-6", task: "Clean and sanitize all surfaces", checked: false },
        { id: "airbnb-7", task: "Empty trash and recycling", checked: false },
        { id: "airbnb-8", task: "Check for any damage or maintenance issues", checked: false },
        { id: "airbnb-9", task: "Ensure all appliances are working", checked: false },
        { id: "airbnb-10", task: "Verify Wi-Fi password is visible", checked: false },
        { id: "airbnb-11", task: "Check that all lights are working", checked: false },
        { id: "airbnb-12", task: "Ensure property is ready for guest arrival", checked: false },
      ],
    },
    {
      id: "move-in-out",
      name: "Move In/Out Cleaning",
      items: [
        { id: "move-1", task: "All deep cleaning tasks", checked: false },
        { id: "move-2", task: "Clean inside all cabinets and drawers", checked: false },
        { id: "move-3", task: "Clean inside all closets", checked: false },
        { id: "move-4", task: "Clean all windows inside and out", checked: false },
        { id: "move-5", task: "Clean all appliances thoroughly", checked: false },
        { id: "move-6", task: "Clean and sanitize all bathrooms", checked: false },
        { id: "move-7", task: "Remove all cobwebs", checked: false },
        { id: "move-8", task: "Clean all light fixtures", checked: false },
        { id: "move-9", task: "Clean air vents and replace filters if needed", checked: false },
        { id: "move-10", task: "Clean baseboards throughout", checked: false },
        { id: "move-11", task: "Clean door frames and doors", checked: false },
        { id: "move-12", task: "Clean garage or storage areas", checked: false },
        { id: "move-13", task: "Remove any remaining items or debris", checked: false },
        { id: "move-14", task: "Final inspection walkthrough", checked: false },
      ],
    },
    {
      id: "carpet",
      name: "Carpet Cleaning",
      items: [
        { id: "carpet-1", task: "Vacuum all carpets thoroughly", checked: false },
        { id: "carpet-2", task: "Pre-treat visible stains", checked: false },
        { id: "carpet-3", task: "Move furniture (if requested)", checked: false },
        { id: "carpet-4", task: "Deep clean carpets with appropriate equipment", checked: false },
        { id: "carpet-5", task: "Clean edges and corners", checked: false },
        { id: "carpet-6", task: "Extract excess moisture", checked: false },
        { id: "carpet-7", task: "Allow proper drying time", checked: false },
        { id: "carpet-8", task: "Replace furniture (if moved)", checked: false },
        { id: "carpet-9", task: "Final vacuum if needed", checked: false },
        { id: "carpet-10", task: "Inspect for any missed spots", checked: false },
      ],
    },
  ]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    standard: true,
    deep: false,
    airbnb: false,
    "move-in-out": false,
    carpet: false,
  });

  const toggleItem = (typeId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((type) => {
        if (type.id === typeId) {
          return {
            ...type,
            items: type.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        return type;
      })
    );
  };

  const toggleSection = (typeId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [typeId]: !prev[typeId],
    }));
  };

  const resetChecklist = (typeId: string) => {
    setChecklists((prev) =>
      prev.map((type) => {
        if (type.id === typeId) {
          return {
            ...type,
            items: type.items.map((item) => ({ ...item, checked: false })),
          };
        }
        return type;
      })
    );
  };

  const getProgress = (items: ChecklistItem[]) => {
    const checked = items.filter((item) => item.checked).length;
    return Math.round((checked / items.length) * 100);
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Cleaning Checklists
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Use these checklists to ensure you complete all tasks for each cleaning type
          </p>
        </div>

        {/* Checklists */}
        <div className="space-y-4">
          {checklists.map((type) => {
            const progress = getProgress(type.items);
            const isExpanded = expandedSections[type.id];

            return (
              <div
                key={type.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(type.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {type.name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {progress}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Checklist Items */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="pt-4 space-y-3">
                      {type.items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </div>
                          <span
                            className={`flex-1 text-gray-700 ${
                              item.checked
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {item.task}
                          </span>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleItem(type.id, item.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => resetChecklist(type.id)}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Reset checklist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Check off items as you complete them during each cleaning job. 
            This helps ensure nothing is missed and maintains consistent quality.
          </p>
        </div>
      </div>
    </div>
  );
}
