"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { MapPin, User, Heart, AlertCircle, ChevronDown, X } from "lucide-react";
import CleanerCard from "@/components/booking/CleanerCard";
import TeamCard from "@/components/booking/TeamCard";
import FrequencyCard from "@/components/booking/FrequencyCard";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import { BookingFormData, CleanerPreference, FrequencyType } from "@/lib/types/booking";
import { calculatePrice, fetchPricingConfig, PricingConfig } from "@/lib/pricing";
import {
  getCleaners,
  getTeams,
  getTeamMembers,
  checkTeamAvailability,
  getFrequencyOptions,
  getSystemSetting,
  getServiceLocations,
  getAdditionalServices,
  ServiceLocation,
  Team,
  FALLBACK_CLEANERS,
  FALLBACK_TEAMS,
  FALLBACK_FREQUENCIES,
  FALLBACK_EXTRAS,
} from "@/lib/supabase/booking-data";

const STORAGE_KEY = "shalean_booking_data";

export default function SchedulePage() {
  const router = useRouter();
  const params = useParams();
  const serviceType = params?.type as string;

  // Initialize formData with consistent defaults (same on server and client)
  // localStorage will be loaded in useEffect after hydration to avoid mismatch
  const getInitialFormData = (): Partial<BookingFormData> => {
    return {
      service: serviceType as any,
      bedrooms: 0,
      bathrooms: 1,
      extras: [],
      frequency: "one-time",
      cleanerPreference: "no-preference",
      streetAddress: "",
      suburb: "",
      city: "Cape Town",
    };
  };

  const [formData, setFormData] = useState<Partial<BookingFormData>>(getInitialFormData);
  const [isClient, setIsClient] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [allExtras, setAllExtras] = useState<Array<{ id: string; name: string }>>(
    FALLBACK_EXTRAS.map(extra => ({ id: extra.id, name: extra.name }))
  );
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
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [suburbSearchQuery, setSuburbSearchQuery] = useState("");
  const [isSuburbDropdownOpen, setIsSuburbDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suburbDropdownRef = useRef<HTMLDivElement>(null);
  const suburbInputRef = useRef<HTMLInputElement>(null);

  // Determine if this is a team service (deep or move-in-out)
  const isTeamService = serviceType === 'deep' || serviceType === 'move-in-out';
  
  // Teams state for team services
  const [teams, setTeams] = useState<Team[]>(
    FALLBACK_TEAMS.map(t => ({ 
      team_id: t.id, 
      id: t.id, 
      name: t.name, 
      display_order: 0, 
      is_active: true,
      memberCount: 0,
      isAvailable: true
    }))
  );

  // Fetch dynamic data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch extras data for displaying names
        const extrasData = await getAdditionalServices();
        if (extrasData.length > 0) {
          setAllExtras(extrasData.map(service => ({ id: service.service_id, name: service.name })));
        }
        
        if (isTeamService) {
          // For deep/move-in-out services, fetch teams
          const [teamsData, frequencyOptionsData, cityData, locationsData, pricing] = await Promise.all([
            getTeams(),
            getFrequencyOptions(),
            getSystemSetting("default_city"),
            getServiceLocations(),
            fetchPricingConfig(),
          ]);
          
          // Fetch team members for each team
          const teamsWithMembers = await Promise.all(
            (teamsData.length > 0 ? teamsData : FALLBACK_TEAMS.map(t => ({ id: t.id, team_id: t.id, name: t.name, display_order: 0, is_active: true }))).map(async (team) => {
              const members = await getTeamMembers(team.team_id);
              return {
                ...team,
                memberCount: members.length,
              };
            })
          );
          
          setTeams(teamsWithMembers);
        } else {
          // For other services, fetch cleaners
          // Pass date, suburb, and service type filters if available from formData
          const [cleanersData, frequencyOptionsData, cityData, locationsData, pricing] = await Promise.all([
            getCleaners(formData.scheduledDate || undefined, formData.suburb || undefined, serviceType),
            getFrequencyOptions(),
            getSystemSetting("default_city"),
            getServiceLocations(),
            fetchPricingConfig(),
          ]);
          
          // Extras already fetched above
          
          // Set cleaners - always include "no-preference" option
          const cleanersList = cleanersData.map(cleaner => ({
            id: cleaner.cleaner_id as CleanerPreference,
            name: cleaner.name,
            rating: cleaner.rating || undefined,
          }));
          
          // Ensure "no-preference" is always included
          const noPreferenceOption = FALLBACK_CLEANERS.find(c => c.id === "no-preference");
          if (noPreferenceOption && !cleanersList.find(c => c.id === "no-preference")) {
            cleanersList.unshift({
              id: "no-preference" as CleanerPreference,
              name: noPreferenceOption.name,
              rating: undefined,
            });
          }
          
          setCleaners(cleanersList);
          
          // Set frequency options
          if (frequencyOptionsData.length > 0) {
            setFrequencies(frequencyOptionsData.map(f => f.frequency_id as FrequencyType));
            
            const discounts: Record<FrequencyType, string> = {} as any;
            frequencyOptionsData.forEach(f => {
              discounts[f.frequency_id as FrequencyType] = f.display_label || "";
            });
            setFrequencyDiscounts(discounts);
          }
          
          // Set default city
          if (cityData) {
            setDefaultCity(cityData);
          }
          
          // Set service locations
          if (locationsData.length > 0) {
            setServiceLocations(locationsData);
          }
          
          // Set pricing config
          setPricingConfig(pricing);
          return;
        }
        
        // Set frequency options (for team services)
        const frequencyOptionsData = await getFrequencyOptions();
        if (frequencyOptionsData.length > 0) {
          setFrequencies(frequencyOptionsData.map(f => f.frequency_id as FrequencyType));
          
          const discounts: Record<FrequencyType, string> = {} as any;
          frequencyOptionsData.forEach(f => {
            discounts[f.frequency_id as FrequencyType] = f.display_label || "";
          });
          setFrequencyDiscounts(discounts);
        }
        
        // Set default city
        const cityData = await getSystemSetting("default_city");
        if (cityData) {
          setDefaultCity(cityData);
        }
        
        // Set service locations
        const locationsData = await getServiceLocations();
        if (locationsData.length > 0) {
          setServiceLocations(locationsData);
        }
        
        // Set pricing config
        const pricing = await fetchPricingConfig();
        setPricingConfig(pricing);
        
        // Set frequency options
        if (frequencyOptionsData.length > 0) {
          setFrequencies(frequencyOptionsData.map(f => f.frequency_id as FrequencyType));
          
          const discounts: Record<FrequencyType, string> = {} as any;
          frequencyOptionsData.forEach(f => {
            discounts[f.frequency_id as FrequencyType] = f.display_label || "";
          });
          setFrequencyDiscounts(discounts);
        }
        
        // Set default city
        if (cityData) {
          setDefaultCity(cityData);
        }
        
        // Set service locations
        if (locationsData.length > 0) {
          setServiceLocations(locationsData);
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
        const parsed = JSON.parse(saved);
        // Merge saved data with defaults to ensure all fields are present
        // Preserve ALL step 1 data (bedrooms, bathrooms, extras, date, time, service, carpet cleaning details, office details)
        setFormData({
          service: parsed.service || (serviceType as any),
          bedrooms: parsed.bedrooms ?? 0,
          bathrooms: parsed.bathrooms ?? 1,
          extras: parsed.extras || [],
          scheduledDate: parsed.scheduledDate || null,
          scheduledTime: parsed.scheduledTime || null,
          specialInstructions: parsed.specialInstructions || undefined,
          // Carpet cleaning specific fields
          fittedRoomsCount: parsed.fittedRoomsCount ?? undefined,
          looseCarpetsCount: parsed.looseCarpetsCount ?? undefined,
          roomsFurnitureStatus: parsed.roomsFurnitureStatus ?? undefined,
          // Office cleaning specific fields
          officeSize: parsed.officeSize ?? undefined,
          frequency: parsed.frequency || "one-time",
          cleanerPreference: parsed.cleanerPreference || "no-preference",
          streetAddress: parsed.streetAddress || "",
          aptUnit: parsed.aptUnit || undefined,
          suburb: parsed.suburb || "",
          city: parsed.city || "Cape Town",
        });
      } catch {
        // Ignore parse errors, keep defaults
      }
    }
  }, [serviceType]);

  // Sync search query when suburb changes externally (but not from user input)
  useEffect(() => {
    if (formData.suburb && formData.suburb !== suburbSearchQuery) {
      setSuburbSearchQuery(formData.suburb);
    }
  }, [formData.suburb]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check team availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (isTeamService && formData.scheduledDate && teams.length > 0) {
        const updatedTeams = await Promise.all(
          teams.map(async (team) => {
            const isAvailable = await checkTeamAvailability(team.team_id, formData.scheduledDate!);
            return { ...team, isAvailable };
          })
        );
        setTeams(updatedTeams);
      }
    };

    checkAvailability();
  }, [formData.scheduledDate, isTeamService]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch cleaners when date or suburb changes (for non-team services)
  useEffect(() => {
    const fetchFilteredCleaners = async () => {
      if (!isTeamService) {
        try {
          const cleanersData = await getCleaners(
            formData.scheduledDate || undefined,
            formData.suburb || undefined,
            serviceType
          );
          
          // Map cleaners - always include "no-preference" option
          const cleanersList = cleanersData.map(cleaner => ({
            id: cleaner.cleaner_id as CleanerPreference,
            name: cleaner.name,
            rating: cleaner.rating || undefined,
          }));
          
          // Ensure "no-preference" is always included
          const noPreferenceOption = FALLBACK_CLEANERS.find(c => c.id === "no-preference");
          if (noPreferenceOption && !cleanersList.find(c => c.id === "no-preference")) {
            cleanersList.unshift({
              id: "no-preference" as CleanerPreference,
              name: noPreferenceOption.name,
              rating: undefined,
            });
          }
          
          setCleaners(cleanersList);
        } catch (error) {
          console.error("Error fetching filtered cleaners:", error);
        }
      }
    };

    fetchFilteredCleaners();
  }, [formData.scheduledDate, formData.suburb, isTeamService]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Save to localStorage only after client-side hydration
    // This ensures Step 1 data (bedrooms, bathrooms, extras, date, time) is never lost
    if (isClient) {
      const dataToSave: Partial<BookingFormData> = {
        ...formData,
        // Explicitly preserve Step 1 fields to prevent data loss
        bedrooms: formData.bedrooms ?? 0,
        bathrooms: formData.bathrooms ?? 1,
        extras: formData.extras || [],
        service: formData.service || (serviceType as any),
        scheduledDate: formData.scheduledDate || null,
        scheduledTime: formData.scheduledTime || null,
        specialInstructions: formData.specialInstructions || undefined,
        // Preserve carpet cleaning specific fields
        fittedRoomsCount: formData.fittedRoomsCount ?? undefined,
        looseCarpetsCount: formData.looseCarpetsCount ?? undefined,
        roomsFurnitureStatus: formData.roomsFurnitureStatus ?? undefined,
        // Preserve office cleaning specific fields
        officeSize: formData.officeSize ?? undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData, serviceType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suburbDropdownRef.current &&
        !suburbDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSuburbDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter locations based on search query
  const filteredLocations = serviceLocations.filter((location) =>
    location.name.toLowerCase().includes(suburbSearchQuery.toLowerCase())
  );

  const handleSuburbSelect = (location: ServiceLocation) => {
    setFormData((prev) => ({
      ...prev,
      suburb: location.name,
      city: location.city || prev.city || defaultCity,
    }));
    setSuburbSearchQuery(location.name);
    setIsSuburbDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSuburbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSuburbSearchQuery(value);
    setIsSuburbDropdownOpen(true);
    setHighlightedIndex(-1);
    
    // Clear suburb if input is cleared
    if (!value) {
      setFormData((prev) => ({ ...prev, suburb: "" }));
    }
  };

  const handleSuburbInputFocus = () => {
    setIsSuburbDropdownOpen(true);
  };

  const handleSuburbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuburbDropdownOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsSuburbDropdownOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredLocations.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuburbSelect(filteredLocations[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsSuburbDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const clearSuburb = () => {
    setSuburbSearchQuery("");
    setFormData((prev) => ({ ...prev, suburb: "" }));
    setIsSuburbDropdownOpen(false);
    setHighlightedIndex(-1);
    suburbInputRef.current?.focus();
  };

  const priceBreakdown = calculatePrice(
    formData as Partial<BookingFormData>,
    pricingConfig || undefined
  );

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
                  <div className="relative" ref={suburbDropdownRef}>
                    <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                      Suburb *
                    </label>
                    <div className="relative">
                      <input
                        ref={suburbInputRef}
                        type="text"
                        id="suburb"
                        value={suburbSearchQuery}
                        onChange={handleSuburbInputChange}
                        onFocus={handleSuburbInputFocus}
                        onKeyDown={handleSuburbKeyDown}
                        placeholder="Search or select a suburb"
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.suburb ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {suburbSearchQuery && (
                          <button
                            type="button"
                            onClick={clearSuburb}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Clear suburb"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isSuburbDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                    {isSuburbDropdownOpen && filteredLocations.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredLocations.map((location, index) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => handleSuburbSelect(location)}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                              index === highlightedIndex ? "bg-blue-50" : ""
                            } ${
                              formData.suburb === location.name ? "bg-blue-100 font-medium" : ""
                            }`}
                          >
                            {location.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {isSuburbDropdownOpen && filteredLocations.length === 0 && suburbSearchQuery && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No locations found
                        </div>
                      </div>
                    )}
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

            {/* Cleaner/Team Selection */}
            {isTeamService ? (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Select your preferred team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.team_id}
                      id={team.team_id}
                      name={team.name}
                      memberCount={team.memberCount}
                      isSelected={formData.cleanerPreference === team.team_id}
                      isAvailable={team.isAvailable}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, cleanerPreference: team.team_id as CleanerPreference }))
                      }
                    />
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Select your preferred cleaner</h2>
                {cleaners.length === 1 && cleaners[0].id === "no-preference" && (formData.scheduledDate || formData.suburb) ? (
                  <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">No specific cleaners available</p>
                      <p className="text-sm mt-1">
                        No cleaners match your selected {formData.scheduledDate && formData.suburb ? 'date and location' : formData.scheduledDate ? 'date' : 'location'}. 
                        You can select "No preference" to let us assign the best available cleaner, or try selecting a different {formData.scheduledDate && formData.suburb ? 'date or location' : formData.scheduledDate ? 'date' : 'location'}.
                      </p>
                    </div>
                  </div>
                ) : null}
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
            )}

            {/* Frequency Selection - Hidden for carpet cleaning */}
            {!isTeamService && serviceType !== 'carpet-cleaning' && (
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
            )}

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
              cleanerPreference={formData.cleanerPreference}
              cleaners={isTeamService ? teams.map(t => ({ id: t.team_id as CleanerPreference, name: t.name })) : cleaners}
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
