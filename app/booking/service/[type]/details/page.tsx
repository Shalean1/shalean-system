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
  Layers,
  Car,
  Home,
  Sofa,
  Square,
} from "lucide-react";
import ServiceCard from "@/components/booking/ServiceCard";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import DatePicker from "@/components/booking/DatePicker";
import { BookingFormData, ServiceType, FrequencyType, CleanerPreference } from "@/lib/types/booking";
import { calculatePrice, formatPrice, fetchPricingConfig, PricingConfig } from "@/lib/pricing";
import {
  getAdditionalServices,
  getTimeSlots,
  checkDateAvailability,
  TimeSlotAvailability,
  FALLBACK_EXTRAS,
  FALLBACK_TIME_SLOTS,
} from "@/lib/supabase/booking-data";

// Icon mapping for additional services
const iconMap: Record<string, any> = {
  Refrigerator,
  ChefHat,
  Boxes,
  Grid,
  Paintbrush,
  Shirt,
  Layers,
  Car,
  Home,
  Sofa,
  Square,
};

// Services that are only available for deep and move-in-out
const DEEP_SERVICES_ONLY = [
  'carpet-cleaning',
  'ceiling-cleaning',
  'garage-cleaning',
  'balcony-cleaning',
  'couch-cleaning',
  'exterior-windows',
];

const services: ServiceType[] = ["standard", "deep", "move-in-out", "airbnb", "office", "holiday"];

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
      office: "office",
      holiday: "holiday",
    };
    return mapping[serviceTypeFromUrl] || "standard";
  };

  // Initialize formData with defaults - always same on server and client to avoid hydration mismatch
  const getInitialFormData = (): Partial<BookingFormData> => {
    return {
      service: getServiceType(),
      bedrooms: 2,
      bathrooms: 1,
      extras: [],
      scheduledDate: null,
      scheduledTime: null,
      frequency: "one-time" as FrequencyType,
      cleanerPreference: "no-preference" as CleanerPreference,
    };
  };

  const [formData, setFormData] = useState<Partial<BookingFormData>>(getInitialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  
  // Dynamic data from Supabase
  const [allExtras, setAllExtras] = useState<Array<{ id: string; name: string; icon: any }>>(
    FALLBACK_EXTRAS.map(extra => ({ ...extra, icon: iconMap[extra.icon] || Shirt }))
  );
  const [extras, setExtras] = useState<Array<{ id: string; name: string; icon: any }>>(
    FALLBACK_EXTRAS.map(extra => ({ ...extra, icon: iconMap[extra.icon] || Shirt }))
  );
  const [timeSlots, setTimeSlots] = useState<string[]>(FALLBACK_TIME_SLOTS);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [slotAvailability, setSlotAvailability] = useState<TimeSlotAvailability[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch dynamic data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch all data in parallel
        const [additionalServicesData, timeSlotsData, pricing] = await Promise.all([
          getAdditionalServices(),
          getTimeSlots(),
          fetchPricingConfig(),
        ]);
        
        // Set additional services/extras
        if (additionalServicesData.length > 0) {
          const mappedExtras = additionalServicesData.map(service => ({
            id: service.service_id,
            name: service.name,
            icon: iconMap[service.icon_name || "Shirt"] || Shirt,
          }));
          setAllExtras(mappedExtras);
          
          // Filter based on current service type
          const currentServiceType = formData.service || getServiceType();
          const isDeepOrMoveInOut = currentServiceType === 'deep' || currentServiceType === 'move-in-out';
          
          setExtras(
            mappedExtras.filter(service => {
              // Show deep-only services only for deep and move-in-out
              if (DEEP_SERVICES_ONLY.includes(service.id)) {
                return isDeepOrMoveInOut;
              }
              // Show all other services for all service types
              return true;
            })
          );
        }
        
        // Set time slots
        if (timeSlotsData.length > 0) {
          setTimeSlots(timeSlotsData.map(slot => slot.time_value));
        }
        
        // Set pricing config
        setPricingConfig(pricing);
      } catch (error) {
        console.error("Error loading dynamic data:", error);
        // Keep using fallback data
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Mark as client-side mounted and load from localStorage after hydration
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved) as Partial<BookingFormData>;
        const defaults = getInitialFormData();
        // Merge saved data with defaults to ensure all fields are present
        setFormData({
          ...defaults,
          ...parsedData,
          // Ensure service matches URL if navigating to a different service type
          service: (parsedData.service || getServiceType()) as ServiceType,
          // Preserve Step 1 specific fields
          bedrooms: parsedData.bedrooms ?? defaults.bedrooms,
          bathrooms: parsedData.bathrooms ?? defaults.bathrooms,
          extras: parsedData.extras || defaults.extras,
          scheduledDate: parsedData.scheduledDate ?? defaults.scheduledDate,
          scheduledTime: parsedData.scheduledTime ?? defaults.scheduledTime,
          frequency: (parsedData.frequency || defaults.frequency) as FrequencyType,
          cleanerPreference: (parsedData.cleanerPreference || defaults.cleanerPreference) as CleanerPreference,
        });
      } catch {
        // If parse fails, keep defaults
      }
    }
  }, []);

  useEffect(() => {
    // Set service from URL if not already set
    if (!formData.service) {
      setFormData((prev) => ({ ...prev, service: getServiceType() }));
    }
  }, [serviceTypeFromUrl]);

  // Filter extras when service type changes
  useEffect(() => {
    if (allExtras.length > 0 && formData.service) {
      const isDeepOrMoveInOut = formData.service === 'deep' || formData.service === 'move-in-out';
      const isStandardOrAirbnb = formData.service === 'standard' || formData.service === 'airbnb';
      
      // Clear selected extras if service doesn't support extras (not standard or airbnb)
      if (!isStandardOrAirbnb && formData.extras && formData.extras.length > 0) {
        setFormData((prev) => ({ ...prev, extras: [] }));
      }
      
      setExtras(
        allExtras.filter(service => {
          // Show deep-only services only for deep and move-in-out
          if (DEEP_SERVICES_ONLY.includes(service.id)) {
            return isDeepOrMoveInOut;
          }
          // Show all other services for all service types
          return true;
        })
      );
    }
  }, [formData.service, allExtras]);

  useEffect(() => {
    // Save to localStorage (only after client-side hydration)
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isClient]);

  const priceBreakdown = calculatePrice(
    formData as Partial<BookingFormData>,
    pricingConfig || undefined
  );

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

  // Fetch availability when date is selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.scheduledDate || timeSlots.length === 0) {
        setSlotAvailability([]);
        return;
      }

      setIsLoadingAvailability(true);
      try {
        const availability = await checkDateAvailability(formData.scheduledDate, timeSlots);
        setSlotAvailability(availability);
        
        // Clear selected time if it becomes unavailable
        if (formData.scheduledTime) {
          const selectedSlotAvailability = availability.find(a => a.timeSlot === formData.scheduledTime);
          if (!selectedSlotAvailability?.isAvailable) {
            setFormData((prev) => ({ ...prev, scheduledTime: null }));
          }
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        // On error, assume all slots are available
        setSlotAvailability(timeSlots.map(slot => ({
          timeSlot: slot,
          availableCleaners: 1,
          isAvailable: true,
        })));
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [formData.scheduledDate, timeSlots]);

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
    } else if (formData.scheduledDate && slotAvailability.length > 0) {
      // Check if selected time slot is available
      const selectedSlot = slotAvailability.find(a => a.timeSlot === formData.scheduledTime);
      if (selectedSlot && !selectedSlot.isAvailable) {
        newErrors.scheduledTime = "This time slot is no longer available. Please select another time.";
      }
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

            {/* Extras - Only show for standard and airbnb services */}
            {(formData.service === "standard" || formData.service === "airbnb") && (
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
                        className={`flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all min-h-[100px] ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        title={extra.name}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected ? "text-blue-500" : "text-gray-400"
                          }`}
                        />
                        <span className={`text-xs text-center leading-tight ${
                          isSelected ? "text-blue-600 font-medium" : "text-gray-600"
                        }`}>
                          {extra.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Schedule */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Which day would you like us to come?
                  </label>
                  <DatePicker
                    id="scheduledDate"
                    value={formData.scheduledDate || ""}
                    onChange={(date: string) => {
                      setFormData((prev) => ({ ...prev, scheduledDate: date, scheduledTime: null }));
                      setSlotAvailability([]); // Clear availability when date changes
                      if (errors.scheduledDate) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.scheduledDate;
                          return newErrors;
                        });
                      }
                    }}
                    min={today}
                    error={!!errors.scheduledDate}
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
                      disabled={!formData.scheduledDate || isLoadingAvailability}
                      className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                        errors.scheduledTime ? "border-red-500" : "border-gray-300"
                      } ${!formData.scheduledDate || isLoadingAvailability ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {isLoadingAvailability 
                          ? "Checking availability..." 
                          : formData.scheduledDate 
                            ? "Select a time" 
                            : "Select date first"}
                      </option>
                      {timeSlots.map((time) => {
                        const availability = slotAvailability.find(a => a.timeSlot === time);
                        const isAvailable = availability?.isAvailable ?? true;
                        const availableCount = availability?.availableCleaners ?? 0;
                        
                        // Show availability info only if we have data
                        const showAvailability = slotAvailability.length > 0;
                        
                        return (
                          <option 
                            key={time} 
                            value={time}
                            disabled={!isAvailable}
                            className={!isAvailable ? "text-gray-400" : ""}
                          >
                            {time}{showAvailability && !isAvailable ? " (Unavailable)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.scheduledTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
                  )}
                  {formData.scheduledDate && slotAvailability.length > 0 && (
                    <>
                      {slotAvailability.every(slot => !slot.isAvailable) ? (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 font-medium mb-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            No cleaners available on this date
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Please select another date to see available time slots.
                          </p>
                        </div>
                      ) : slotAvailability.some(slot => !slot.isAvailable) && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium mb-1">
                            Some time slots are unavailable
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            <strong>Available slots:</strong> {slotAvailability.filter(s => s.isAvailable).map(s => s.timeSlot).join(", ")}
                          </p>
                        </div>
                      )}
                    </>
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
