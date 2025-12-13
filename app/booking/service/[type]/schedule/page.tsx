"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { MapPin, User, Heart, AlertCircle } from "lucide-react";
import CleanerCard from "@/components/booking/CleanerCard";
import FrequencyCard from "@/components/booking/FrequencyCard";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import { BookingFormData, CleanerPreference, FrequencyType } from "@/lib/types/booking";
import { calculatePrice } from "@/lib/pricing";
import {
  getCleaners,
  getFrequencyOptions,
  getSystemSetting,
  FALLBACK_CLEANERS,
  FALLBACK_FREQUENCIES,
} from "@/lib/supabase/booking-data";

const STORAGE_KEY = "shalean_booking_data";

export default function SchedulePage() {
  const router = useRouter();
  const params = useParams();
  const serviceType = params?.type as string;

  const [formData, setFormData] = useState<Partial<BookingFormData>>(() => {
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
      service: serviceType as any,
      frequency: "one-time",
      cleanerPreference: "no-preference",
      streetAddress: "",
      suburb: "",
      city: "Cape Town",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [cleaners, setCleaners] = useState<{ id: CleanerPreference; name: string; rating?: number }[]>(
    FALLBACK_CLEANERS.map(c => ({ id: c.id as CleanerPreference, name: c.name, rating: c.rating }))
  );
  const [frequencies, setFrequencies] = useState<FrequencyType[]>(
    FALLBACK_FREQUENCIES.map(f => f.id as FrequencyType)
  );
  const [frequencyDiscounts, setFrequencyDiscounts] = useState<Record<FrequencyType, string>>({
    "one-time": "",
    "weekly": "Save 15%",
    "bi-weekly": "Save 10%",
    "monthly": "Save 5%",
  });
  const [defaultCity, setDefaultCity] = useState("Cape Town");

  // Fetch dynamic data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch cleaners
        const cleanersData = await getCleaners();
        if (cleanersData.length > 0) {
          setCleaners(
            cleanersData.map(cleaner => ({
              id: cleaner.cleaner_id as CleanerPreference,
              name: cleaner.name,
              rating: cleaner.rating || undefined,
            }))
          );
        }
        
        // Fetch frequency options
        const frequencyOptionsData = await getFrequencyOptions();
        if (frequencyOptionsData.length > 0) {
          setFrequencies(frequencyOptionsData.map(f => f.frequency_id as FrequencyType));
          
          const discounts: Record<FrequencyType, string> = {} as any;
          frequencyOptionsData.forEach(f => {
            discounts[f.frequency_id as FrequencyType] = f.display_label || "";
          });
          setFrequencyDiscounts(discounts);
        }
        
        // Fetch default city
        const cityData = await getSystemSetting("default_city");
        if (cityData) {
          setDefaultCity(cityData);
        }
      } catch (error) {
        console.error("Error loading dynamic data:", error);
        // Keep using fallback data
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const priceBreakdown = calculatePrice(formData as Partial<BookingFormData>);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.streetAddress?.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    if (!formData.suburb?.trim()) {
      newErrors.suburb = "Suburb is required";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      router.push(`/booking/service/${serviceType}/review`);
    }
  };

  const handleBack = () => {
    router.push(`/booking/service/${serviceType}/details`);
  };

  const address = formData.streetAddress
    ? `${formData.streetAddress}${formData.aptUnit ? `, ${formData.aptUnit}` : ""}, ${formData.suburb || ""}, ${formData.city || ""}`
    : undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6 flex justify-center">
          <ProgressIndicator currentStep={2} />
        </div>

        {/* Update Progress in Header */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const progressIndicator = document.querySelector('[data-progress-indicator]');
                if (progressIndicator) {
                  progressIndicator.setAttribute('data-current-step', '2');
                }
              }
            `,
          }}
        />

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
            {/* Service Address */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Service Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    value={formData.streetAddress || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, streetAddress: e.target.value }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.streetAddress ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., 123 Nelson Mandela Avenue"
                  />
                  {errors.streetAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="aptUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Apt / Unit
                  </label>
                  <input
                    type="text"
                    id="aptUnit"
                    value={formData.aptUnit || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, aptUnit: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Apt 4B, Unit 12"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                      Suburb *
                    </label>
                    <input
                      type="text"
                      id="suburb"
                      value={formData.suburb || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, suburb: e.target.value }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.suburb ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Sea Point"
                    />
                    {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city || defaultCity}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Cleaner Selection */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select your preferred cleaner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cleaners.map((cleaner) => (
                  <CleanerCard
                    key={cleaner.id}
                    id={cleaner.id}
                    name={cleaner.name}
                    rating={cleaner.rating}
                    isSelected={formData.cleanerPreference === cleaner.id}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, cleanerPreference: cleaner.id }))
                    }
                  />
                ))}
              </div>
            </section>

            {/* Frequency Selection */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                How often do you need cleaning?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {frequencies.map((frequency) => (
                  <FrequencyCard
                    key={frequency}
                    frequency={frequency}
                    isSelected={formData.frequency === frequency}
                    discount={frequencyDiscounts[frequency]}
                    onClick={() => setFormData((prev) => ({ ...prev, frequency }))}
                  />
                ))}
              </div>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
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
              address={address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
