"use client";

import { useState, useEffect, useMemo } from "react";
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
// Note: carpet-cleaning is removed from this list since it's now a main service AND can be added as extra to any service
const DEEP_SERVICES_ONLY = [
  'ceiling-cleaning',
  'garage-cleaning',
  'balcony-cleaning',
  'couch-cleaning',
  'exterior-windows',
];

const services: ServiceType[] = ["standard", "deep", "move-in-out", "airbnb", "office", "holiday", "carpet-cleaning"];

const STORAGE_KEY = "shalean_booking_data";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // Ensure type is always a string (not an array)
  const serviceTypeFromUrl = Array.isArray(params?.type) 
    ? params.type[0] 
    : (params?.type as string | undefined) || 'standard';

  // Map URL param to service type - memoized to ensure stable reference
  const urlServiceType = useMemo((): ServiceType => {
    const mapping: Record<string, ServiceType> = {
      standard: "standard",
      deep: "deep",
      "move-in-out": "move-in-out",
      airbnb: "airbnb",
      office: "office",
      holiday: "holiday",
      "carpet-cleaning": "carpet-cleaning",
    };
    return mapping[serviceTypeFromUrl] || "standard";
  }, [serviceTypeFromUrl]);

  // Map service type to URL slug
  const getServiceSlug = (service: ServiceType): string => {
    return service; // Service types already match URL slugs
  };

  // Initialize formData with defaults - always same on server and client to avoid hydration mismatch
  const getInitialFormData = (): Partial<BookingFormData> => {
    return {
      service: urlServiceType,
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
  
  // Carpet cleaning specific state
  const [hasFittedCarpets, setHasFittedCarpets] = useState(false);
  const [hasLooseCarpets, setHasLooseCarpets] = useState(false);
  
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
          const currentServiceType = formData.service || urlServiceType;
          const isDeepOrMoveInOut = currentServiceType === 'deep' || currentServiceType === 'move-in-out';
          
          setExtras(
            mappedExtras.filter(service => {
              // Carpet cleaning can be added as extra to any service type
              if (service.id === 'carpet-cleaning') {
                return true;
              }
              // For deep and move-in-out: show ONLY deep-only services
              if (isDeepOrMoveInOut) {
                return DEEP_SERVICES_ONLY.includes(service.id);
              }
              // For standard and airbnb: show all services EXCEPT deep-only services
              if (currentServiceType === 'standard' || currentServiceType === 'airbnb') {
                return !DEEP_SERVICES_ONLY.includes(service.id);
              }
              // For other service types (office, holiday, carpet-cleaning): show carpet-cleaning and standard extras
              if (currentServiceType === 'office' || currentServiceType === 'holiday' || currentServiceType === 'carpet-cleaning') {
                return !DEEP_SERVICES_ONLY.includes(service.id);
              }
              // Default: don't show extras
              return false;
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
          service: (parsedData.service || urlServiceType) as ServiceType,
          // Preserve Step 1 specific fields
          bedrooms: parsedData.bedrooms ?? defaults.bedrooms,
          bathrooms: parsedData.bathrooms ?? defaults.bathrooms,
          extras: parsedData.extras || defaults.extras,
          scheduledDate: parsedData.scheduledDate ?? defaults.scheduledDate,
          scheduledTime: parsedData.scheduledTime ?? defaults.scheduledTime,
          frequency: (parsedData.frequency || defaults.frequency) as FrequencyType,
          cleanerPreference: (parsedData.cleanerPreference || defaults.cleanerPreference) as CleanerPreference,
          // Preserve carpet cleaning fields
          fittedRoomsCount: parsedData.fittedRoomsCount,
          looseCarpetsCount: parsedData.looseCarpetsCount,
          roomsFurnitureStatus: parsedData.roomsFurnitureStatus,
          // Preserve office cleaning fields
          officeSize: parsedData.officeSize,
        });
      } catch {
        // If parse fails, keep defaults
      }
    }
  }, []);

  // Initialize carpet cleaning state from formData
  useEffect(() => {
    if (formData.service === 'carpet-cleaning') {
      setHasFittedCarpets((formData.fittedRoomsCount ?? 0) > 0);
      setHasLooseCarpets((formData.looseCarpetsCount ?? 0) > 0);
    } else {
      setHasFittedCarpets(false);
      setHasLooseCarpets(false);
    }
  }, [formData.service, formData.fittedRoomsCount, formData.looseCarpetsCount]);

  useEffect(() => {
    // Sync service from URL - update if URL service differs from current service
    setFormData((prev) => {
      if (prev.service !== urlServiceType) {
        return { ...prev, service: urlServiceType };
      }
      return prev;
    });
  }, [urlServiceType]);

  // Filter extras when service type changes
  useEffect(() => {
    if (allExtras.length > 0 && formData.service) {
      const isDeepOrMoveInOut = formData.service === 'deep' || formData.service === 'move-in-out';
      
      // Filter out incompatible extras from selected extras
      if (formData.extras && formData.extras.length > 0) {
        const compatibleExtras = formData.extras.filter(extraId => {
          const extra = allExtras.find(e => e.id === extraId);
          if (!extra) return false;
          
          // Carpet cleaning can be added as extra to any service type
          if (extra.id === 'carpet-cleaning') {
            return true;
          }
          // For deep and move-in-out: only allow deep-only services
          if (isDeepOrMoveInOut) {
            return DEEP_SERVICES_ONLY.includes(extra.id);
          }
          // For standard and airbnb: only allow non-deep-only services
          if (formData.service === 'standard' || formData.service === 'airbnb') {
            return !DEEP_SERVICES_ONLY.includes(extra.id);
          }
          // For other service types (office, holiday, carpet-cleaning): allow non-deep-only services
          if (formData.service === 'office' || formData.service === 'holiday' || formData.service === 'carpet-cleaning') {
            return !DEEP_SERVICES_ONLY.includes(extra.id);
          }
          // Default: no extras allowed
          return false;
        });
        
        // Only update if there are incompatible extras to remove
        if (compatibleExtras.length !== formData.extras.length) {
          setFormData((prev) => ({ ...prev, extras: compatibleExtras }));
        }
      }
      
      setExtras(
        allExtras.filter(service => {
          // Carpet cleaning can be added as extra to any service type
          if (service.id === 'carpet-cleaning') {
            return true;
          }
          // For deep and move-in-out: show ONLY deep-only services
          if (isDeepOrMoveInOut) {
            return DEEP_SERVICES_ONLY.includes(service.id);
          }
          // For standard and airbnb: show all services EXCEPT deep-only services
          if (formData.service === 'standard' || formData.service === 'airbnb') {
            return !DEEP_SERVICES_ONLY.includes(service.id);
          }
          // For other service types (office, holiday, carpet-cleaning): show carpet-cleaning and standard extras
          if (formData.service === 'office' || formData.service === 'holiday' || formData.service === 'carpet-cleaning') {
            return !DEEP_SERVICES_ONLY.includes(service.id);
          }
          // Default: don't show extras
          return false;
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
    setFormData((prev) => {
      const updates: Partial<BookingFormData> = { service };
      // Clear officeSize when switching away from office service
      if (prev.service === 'office' && service !== 'office') {
        updates.officeSize = undefined;
      }
      // Clear carpet cleaning fields when switching away from carpet-cleaning
      if (prev.service === 'carpet-cleaning' && service !== 'carpet-cleaning') {
        updates.fittedRoomsCount = undefined;
        updates.looseCarpetsCount = undefined;
        updates.roomsFurnitureStatus = undefined;
      }
      return { ...prev, ...updates };
    });
    // Update URL to reflect the selected service
    const serviceSlug = getServiceSlug(service);
    router.replace(`/booking/service/${serviceSlug}/details`);
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

    // Validate carpet cleaning specific fields
    if (formData.service === 'carpet-cleaning') {
      const hasFitted = (formData.fittedRoomsCount ?? 0) > 0;
      const hasLoose = (formData.looseCarpetsCount ?? 0) > 0;
      
      if (!hasFitted && !hasLoose) {
        newErrors.carpetType = "Please select at least one carpet type (fitted or loose)";
      }
      
      if (hasFitted && (!formData.fittedRoomsCount || formData.fittedRoomsCount <= 0)) {
        newErrors.fittedRoomsCount = "Please enter the number of rooms with fitted carpets";
      }
      
      if (hasLoose && (!formData.looseCarpetsCount || formData.looseCarpetsCount <= 0)) {
        newErrors.looseCarpetsCount = "Please enter the number of loose carpets";
      }
      
      if (!formData.roomsFurnitureStatus) {
        newErrors.roomsFurnitureStatus = "Please indicate if rooms have furniture or are empty";
      }
    }

    // Validate office cleaning specific fields
    if (formData.service === 'office') {
      if (!formData.officeSize) {
        newErrors.officeSize = "Please select office size";
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

            {/* Office Details - Show for office service */}
            {formData.service === "office" && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Office details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="officeSize" className="block text-sm font-medium text-gray-700 mb-2">
                      Office Size
                    </label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        id="officeSize"
                        value={formData.officeSize || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || !['small', 'medium', 'large'].includes(value)) {
                            setFormData((prev) => ({ ...prev, officeSize: undefined }));
                          } else {
                            setFormData((prev) => ({ ...prev, officeSize: value as 'small' | 'medium' | 'large' }));
                          }
                          if (errors.officeSize) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.officeSize;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                          errors.officeSize ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select office size</option>
                        <option value="small">Small (1-3 rooms)</option>
                        <option value="medium">Medium (4-10 rooms)</option>
                        <option value="large">Large (10+ rooms)</option>
                      </select>
                    </div>
                    {errors.officeSize && (
                      <p className="mt-1 text-sm text-red-600">{errors.officeSize}</p>
                    )}
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
            )}

            {/* House Details - Show for non-office, non-carpet-cleaning services */}
            {formData.service !== "carpet-cleaning" && formData.service !== "office" && (
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
            )}

            {/* Carpet Cleaning Details - Show only for carpet-cleaning service */}
            {formData.service === "carpet-cleaning" && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Carpet Details</h2>
                
                {/* Carpet Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of carpets do you have?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasFittedCarpets}
                        onChange={(e) => {
                          setHasFittedCarpets(e.target.checked);
                          if (!e.target.checked) {
                            setFormData((prev) => ({ ...prev, fittedRoomsCount: undefined }));
                          } else {
                            setFormData((prev) => ({ ...prev, fittedRoomsCount: prev.fittedRoomsCount || 1 }));
                          }
                          if (errors.carpetType || errors.fittedRoomsCount) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.carpetType;
                              delete newErrors.fittedRoomsCount;
                              return newErrors;
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Fitted in rooms</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLooseCarpets}
                        onChange={(e) => {
                          setHasLooseCarpets(e.target.checked);
                          if (!e.target.checked) {
                            setFormData((prev) => ({ ...prev, looseCarpetsCount: undefined }));
                          } else {
                            setFormData((prev) => ({ ...prev, looseCarpetsCount: prev.looseCarpetsCount || 1 }));
                          }
                          if (errors.carpetType || errors.looseCarpetsCount) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.carpetType;
                              delete newErrors.looseCarpetsCount;
                              return newErrors;
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Loose carpets</span>
                    </label>
                  </div>
                  {errors.carpetType && (
                    <p className="mt-2 text-sm text-red-600">{errors.carpetType}</p>
                  )}
                </div>

                {/* Fitted Rooms Count */}
                {hasFittedCarpets && (
                  <div className="mb-6">
                    <label htmlFor="fittedRoomsCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of rooms with fitted carpets
                    </label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        id="fittedRoomsCount"
                        value={formData.fittedRoomsCount || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setFormData((prev) => ({ ...prev, fittedRoomsCount: value }));
                          if (errors.fittedRoomsCount) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.fittedRoomsCount;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                          errors.fittedRoomsCount ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {Array.from({ length: 21 }, (_, i) => (
                          <option key={i} value={i}>
                            {i} {i === 1 ? "Room" : "Rooms"}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.fittedRoomsCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.fittedRoomsCount}</p>
                    )}
                  </div>
                )}

                {/* Loose Carpets Count */}
                {hasLooseCarpets && (
                  <div className="mb-6">
                    <label htmlFor="looseCarpetsCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of loose carpets
                    </label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        id="looseCarpetsCount"
                        value={formData.looseCarpetsCount || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setFormData((prev) => ({ ...prev, looseCarpetsCount: value }));
                          if (errors.looseCarpetsCount) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.looseCarpetsCount;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                          errors.looseCarpetsCount ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {Array.from({ length: 21 }, (_, i) => (
                          <option key={i} value={i}>
                            {i} {i === 1 ? "Carpet" : "Carpets"}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.looseCarpetsCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.looseCarpetsCount}</p>
                    )}
                  </div>
                )}

                {/* Furniture Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do the rooms have furniture inside or are they empty?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="roomsFurnitureStatus"
                        value="furnished"
                        checked={formData.roomsFurnitureStatus === 'furnished'}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, roomsFurnitureStatus: 'furnished' }));
                          if (errors.roomsFurnitureStatus) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.roomsFurnitureStatus;
                              return newErrors;
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Rooms have furniture inside</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="roomsFurnitureStatus"
                        value="empty"
                        checked={formData.roomsFurnitureStatus === 'empty'}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, roomsFurnitureStatus: 'empty' }));
                          if (errors.roomsFurnitureStatus) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.roomsFurnitureStatus;
                              return newErrors;
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Empty rooms</span>
                    </label>
                  </div>
                  {errors.roomsFurnitureStatus && (
                    <p className="mt-2 text-sm text-red-600">{errors.roomsFurnitureStatus}</p>
                  )}
                </div>
              </section>
            )}

            {/* Extras - Show for standard, airbnb, deep, and move-in-out services */}
            {(formData.service === "standard" || formData.service === "airbnb" || formData.service === "deep" || formData.service === "move-in-out") && (
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
              fittedRoomsCount={formData.fittedRoomsCount}
              looseCarpetsCount={formData.looseCarpetsCount}
              roomsFurnitureStatus={formData.roomsFurnitureStatus}
              officeSize={formData.officeSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
