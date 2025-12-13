"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Refrigerator,
  ChefHat,
  Boxes,
  Grid,
  Paintbrush,
  Shirt,
  ChevronDown,
  FileText,
  AlertCircle,
} from "lucide-react";
import ServiceCard from "@/components/booking/ServiceCard";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import { BookingFormData, ServiceType } from "@/lib/types/booking";
import { calculatePrice, formatPrice } from "@/lib/pricing";

const services: ServiceType[] = ["standard", "deep", "move-in-out", "airbnb"];

const extras = [
  { id: "inside-fridge", name: "Inside Fridge", icon: Refrigerator },
  { id: "inside-oven", name: "Inside Oven", icon: ChefHat },
  { id: "inside-cabinets", name: "Inside Cabinets", icon: Boxes },
  { id: "interior-windows", name: "Interior Windows", icon: Grid },
  { id: "interior-walls", name: "Interior Walls", icon: Paintbrush },
  { id: "laundry", name: "Laundry & Ironing", icon: Shirt },
];

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const STORAGE_KEY = "shalean_booking_data";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceTypeFromUrl = params?.type as string;

  // Map URL param to service type
  const getServiceType = (): ServiceType => {
    const mapping: Record<string, ServiceType> = {
      standard: "standard",
      deep: "deep",
      "move-in-out": "move-in-out",
      airbnb: "airbnb",
    };
    return mapping[serviceTypeFromUrl] || "standard";
  };

  const [formData, setFormData] = useState<Partial<BookingFormData>>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      service: getServiceType(),
      bedrooms: 2,
      bathrooms: 1,
      extras: [],
      scheduledDate: null,
      scheduledTime: null,
      frequency: "one-time",
      cleanerPreference: "no-preference",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set service from URL if not already set
    if (!formData.service) {
      setFormData((prev) => ({ ...prev, service: getServiceType() }));
    }
  }, [serviceTypeFromUrl]);

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const priceBreakdown = calculatePrice(formData as Partial<BookingFormData>);

  const handleServiceSelect = (service: ServiceType) => {
    setFormData((prev) => ({ ...prev, service }));
  };

  const handleExtrasToggle = (extraId: string) => {
    setFormData((prev) => {
      const current = prev.extras || [];
      const updated = current.includes(extraId)
        ? current.filter((id) => id !== extraId)
        : [...current, extraId];
      return { ...prev, extras: updated };
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, scheduledDate: date, scheduledTime: null }));
    if (errors.scheduledDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.scheduledDate;
        return newErrors;
      });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const time = e.target.value;
    setFormData((prev) => ({ ...prev, scheduledTime: time }));
    if (errors.scheduledTime) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.scheduledTime;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Please select a date";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Please select a time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to next step
      router.push(`/booking/service/${formData.service}/schedule`);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6 flex justify-center">
          <ProgressIndicator currentStep={1} />
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Choose your cleaning service
          </h1>
          <p className="text-lg text-gray-600">Select the type of cleaning service you need</p>
        </div>

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Please fix the following errors:</p>
              <ul className="list-disc list-inside mt-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Selection */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Choose your cleaning service</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service}
                    service={service}
                    isSelected={formData.service === service}
                    onClick={() => handleServiceSelect(service)}
                  />
                ))}
              </div>
            </section>

            {/* House Details */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">House details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      id="bedrooms"
                      value={formData.bedrooms || 0}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, bedrooms: parseInt(e.target.value) }))
                      }
                      className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {Array.from({ length: 11 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} {i === 1 ? "Bedroom" : "Bedrooms"}
                        </option>
                      ))}
                      <option value={11}>10+ Bedrooms</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      id="bathrooms"
                      value={formData.bathrooms || 1}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, bathrooms: parseInt(e.target.value) }))
                      }
                      className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? "Bathroom" : "Bathrooms"}
                        </option>
                      ))}
                      <option value={11}>10+ Bathrooms</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Extras */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Extras</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {extras.map((extra) => {
                  const Icon = extra.icon;
                  const isSelected = formData.extras?.includes(extra.id) || false;
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => handleExtrasToggle(extra.id)}
                      className={`p-4 border-2 rounded-full transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      title={extra.name}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto ${
                          isSelected ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Schedule */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Which day would you like us to come?
                  </label>
                  <input
                    type="date"
                    id="scheduledDate"
                    value={formData.scheduledDate || ""}
                    onChange={handleDateChange}
                    min={today}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.scheduledDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                    What time would you like us to arrive?
                  </label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      id="scheduledTime"
                      value={formData.scheduledTime || ""}
                      onChange={handleTimeChange}
                      disabled={!formData.scheduledDate}
                      className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                        errors.scheduledTime ? "border-red-500" : "border-gray-300"
                      } ${!formData.scheduledDate ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.scheduledDate ? "Select a time" : "Select date first"}
                      </option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.scheduledTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Special Instructions */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Special Instructions</h2>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.specialInstructions || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, specialInstructions: e.target.value }))
                  }
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add your notes here......"
                />
              </div>
            </section>

            {/* Continue Button */}
            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <PriceSummary
              service={formData.service || "standard"}
              frequency={formData.frequency || "one-time"}
              priceBreakdown={priceBreakdown}
              bedrooms={formData.bedrooms || 0}
              bathrooms={formData.bathrooms || 1}
              extras={formData.extras || []}
              scheduledDate={formData.scheduledDate || null}
              scheduledTime={formData.scheduledTime || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
