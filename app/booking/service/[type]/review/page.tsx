"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Calendar,
  Edit,
  Shield,
  AlertCircle,
  Loader2,
  Save,
  X,
  ChevronDown,
  Refrigerator,
  ChefHat,
  Boxes,
  Grid,
  Paintbrush,
  Shirt,
  Layers,
  Car,
  Sofa,
  Square,
  CreditCard,
  Coins,
} from "lucide-react";
import ServiceCard from "@/components/booking/ServiceCard";
import PriceSummary from "@/components/booking/PriceSummary";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import DiscountCodeInput from "@/components/booking/DiscountCodeInput";
import { BookingFormData, ServiceType, FrequencyType, CleanerPreference } from "@/lib/types/booking";
import { calculatePrice, getServiceName, formatPrice, getFrequencyName, fetchPricingConfig, PricingConfig } from "@/lib/pricing";
import { initializePayment } from "@/app/actions/payment";
import { submitBooking } from "@/app/actions/submit-booking";
import { getUserCreditBalanceAction } from "@/app/actions/credits";
import { initializePaystack } from "@/lib/paystack";
import {
  getAdditionalServices,
  getTimeSlots,
  getCleaners,
  getTeams,
  FALLBACK_EXTRAS,
  FALLBACK_TIME_SLOTS,
  FALLBACK_CLEANERS,
  FALLBACK_TEAMS,
} from "@/lib/supabase/booking-data";
import { useUser } from "@/lib/hooks/useSupabase";
import { getUserProfileClient } from "@/lib/storage/profile-supabase-client";

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
const frequencies: FrequencyType[] = ["one-time", "weekly", "bi-weekly", "monthly"];

const STORAGE_KEY = "shalean_booking_data";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const serviceType = params?.type as string;
  const { user, loading: userLoading } = useUser();

  // Initialize formData with data from localStorage immediately (client-side)
  const getInitialFormData = (): Partial<BookingFormData> => {
    if (typeof window === "undefined") {
      // Server-side: return empty object to avoid hydration mismatch
      return {};
    }
    
    // Client-side: load from localStorage immediately
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<BookingFormData>;
        // Ensure all fields from Steps 1 and 2 are preserved
        return {
          service: parsed.service || (serviceType as ServiceType),
          bedrooms: parsed.bedrooms ?? 0,
          bathrooms: parsed.bathrooms ?? 1,
          extras: parsed.extras || [],
          scheduledDate: parsed.scheduledDate || null,
          scheduledTime: parsed.scheduledTime || null,
          specialInstructions: parsed.specialInstructions || undefined,
          frequency: parsed.frequency || ("one-time" as FrequencyType),
          cleanerPreference: parsed.cleanerPreference || ("no-preference" as CleanerPreference),
          streetAddress: parsed.streetAddress || "",
          aptUnit: parsed.aptUnit || undefined,
          suburb: parsed.suburb || "",
          city: parsed.city || "",
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          discountCode: parsed.discountCode || undefined,
        };
      } catch {
        // If parse fails, return empty object
      }
    }
    
    return {};
  };

  const [formData, setFormData] = useState<Partial<BookingFormData>>(getInitialFormData);
  const [tempFormData, setTempFormData] = useState<Partial<BookingFormData>>(getInitialFormData());
  const [isMounted, setIsMounted] = useState(false);
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);

  // Function to populate form with user profile data
  const populateUserProfileData = (profile: { firstName: string | null; lastName: string | null; email: string; phone: string | null }, currentData: Partial<BookingFormData>) => {
    const updatedData: Partial<BookingFormData> = { ...currentData };
    let hasUpdates = false;

    if (!updatedData.firstName && profile.firstName) {
      updatedData.firstName = profile.firstName;
      hasUpdates = true;
    }
    if (!updatedData.lastName && profile.lastName) {
      updatedData.lastName = profile.lastName;
      hasUpdates = true;
    }
    if (!updatedData.email && profile.email) {
      updatedData.email = profile.email;
      hasUpdates = true;
    }
    if (!updatedData.phone && profile.phone) {
      updatedData.phone = profile.phone;
      hasUpdates = true;
    }

    return { updatedData, hasUpdates };
  };

  // Edit mode states for each section
  const [editingSection, setEditingSection] = useState<"service" | "schedule" | "contact" | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountCodeAmount, setDiscountCodeAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>("");
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "credits">("card");
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Dynamic data for editing
  const [allExtras, setAllExtras] = useState<Array<{ id: string; name: string; icon: any }>>(
    FALLBACK_EXTRAS.map(extra => ({ ...extra, icon: iconMap[extra.icon] || Shirt }))
  );
  const [extras, setExtras] = useState<Array<{ id: string; name: string; icon: any }>>(
    FALLBACK_EXTRAS.map(extra => ({ ...extra, icon: iconMap[extra.icon] || Shirt }))
  );
  const [timeSlots, setTimeSlots] = useState<string[]>(FALLBACK_TIME_SLOTS);
  const isTeamService = serviceType === 'deep' || serviceType === 'move-in-out';
  
  const [cleaners, setCleaners] = useState<{ id: CleanerPreference; name: string; rating?: number }[]>(
    FALLBACK_CLEANERS.map(c => ({ id: c.id as CleanerPreference, name: c.name, rating: c.rating }))
  );
  const [teams, setTeams] = useState<Array<{ id: CleanerPreference; name: string }>>(
    FALLBACK_TEAMS.map(t => ({ id: t.id as CleanerPreference, name: t.name }))
  );

  // Load credit balance when user is logged in
  useEffect(() => {
    if (user && !userLoading) {
      loadCreditBalance();
    }
  }, [user, userLoading]);

  const loadCreditBalance = async () => {
    setLoadingCredits(true);
    try {
      const result = await getUserCreditBalanceAction();
      if (result.success && result.balance !== undefined) {
        setCreditBalance(result.balance);
      }
    } catch (error) {
      console.error("Error loading credit balance:", error);
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    // Mark as mounted and sync with localStorage (in case it was updated externally)
    setIsMounted(true);
    
    const loadData = async () => {
      // Load form data from localStorage and merge with current state
      let loadedFormData: Partial<BookingFormData> = formData;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<BookingFormData>;
            loadedFormData = {
              ...formData,
              ...parsed,
              // Explicitly preserve all Step 1 and Step 2 fields
              service: parsed.service || formData.service || (serviceType as ServiceType),
              bedrooms: parsed.bedrooms ?? formData.bedrooms ?? 0,
              bathrooms: parsed.bathrooms ?? formData.bathrooms ?? 1,
              extras: parsed.extras || formData.extras || [],
              scheduledDate: parsed.scheduledDate ?? formData.scheduledDate ?? null,
              scheduledTime: parsed.scheduledTime ?? formData.scheduledTime ?? null,
              frequency: (parsed.frequency || formData.frequency || "one-time") as FrequencyType,
              cleanerPreference: (parsed.cleanerPreference || formData.cleanerPreference || "no-preference") as CleanerPreference,
              tip: parsed.tip || formData.tip || undefined,
            };
            // Initialize tip amount state if tip exists
            if (parsed.tip && parsed.tip > 0) {
              setTipAmount(parsed.tip);
            }
            setFormData(loadedFormData);
            setTempFormData(loadedFormData);
          } catch {
            // Ignore parse errors, keep current formData
          }
        }
      }
      
      // If user is logged in and form fields are empty, fetch and populate user profile
      // Only populate contact fields (firstName, lastName, email, phone), preserve all Step 1 & 2 data
      if (!userLoading && user && !userProfileLoaded) {
        try {
          const profile = await getUserProfileClient();
          if (profile) {
            const { updatedData, hasUpdates } = populateUserProfileData(profile, loadedFormData);
            if (hasUpdates) {
              // Merge user profile data while preserving all Step 1 & 2 data
              const mergedData: Partial<BookingFormData> = {
                ...loadedFormData,
                ...updatedData,
                // Explicitly preserve Step 1 & 2 fields
                service: loadedFormData.service || updatedData.service || (serviceType as ServiceType),
                bedrooms: loadedFormData.bedrooms ?? updatedData.bedrooms ?? 0,
                bathrooms: loadedFormData.bathrooms ?? updatedData.bathrooms ?? 1,
                extras: loadedFormData.extras || updatedData.extras || [],
                scheduledDate: loadedFormData.scheduledDate ?? updatedData.scheduledDate ?? null,
                scheduledTime: loadedFormData.scheduledTime ?? updatedData.scheduledTime ?? null,
                frequency: (loadedFormData.frequency || updatedData.frequency || "one-time") as FrequencyType,
                cleanerPreference: (loadedFormData.cleanerPreference || updatedData.cleanerPreference || "no-preference") as CleanerPreference,
                streetAddress: loadedFormData.streetAddress || updatedData.streetAddress || "",
                suburb: loadedFormData.suburb || updatedData.suburb || "",
                city: loadedFormData.city || updatedData.city || "",
              };
              setFormData(mergedData);
              setTempFormData(mergedData);
              // Save to localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
              }
            }
            setUserProfileLoaded(true);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserProfileLoaded(true); // Set to true even on error to prevent retries
        }
      }
      
      // Fetch pricing config, extras, time slots, and cleaners/teams
      try {
        if (isTeamService) {
          const [pricing, additionalServicesData, timeSlotsData, teamsData] = await Promise.all([
            fetchPricingConfig(),
            getAdditionalServices(),
            getTimeSlots(),
            getTeams(),
          ]);
          
          // Set teams
          if (teamsData.length > 0) {
            setTeams(
              teamsData.map(team => ({
                id: team.team_id as CleanerPreference,
                name: team.name,
              }))
            );
          }
          
          // Set pricing config
          setPricingConfig(pricing);
          
          // Set extras
          if (additionalServicesData.length > 0) {
            setExtras(additionalServicesData);
          } else {
            setExtras(FALLBACK_EXTRAS);
          }
          
          // Set time slots
          if (timeSlotsData.length > 0) {
            setTimeSlots(timeSlotsData.map(ts => ts.time_value));
          } else {
            setTimeSlots(FALLBACK_TIME_SLOTS);
          }
        } else {
          const [pricing, additionalServicesData, timeSlotsData, cleanersData] = await Promise.all([
            fetchPricingConfig(),
            getAdditionalServices(),
            getTimeSlots(),
            getCleaners(),
          ]);
          
          // Set cleaners
          if (cleanersData.length > 0) {
            setCleaners(
              cleanersData.map(cleaner => ({
                id: cleaner.cleaner_id as CleanerPreference,
                name: cleaner.name,
                rating: cleaner.rating || undefined,
              }))
            );
          }
          
          // Set pricing config
          setPricingConfig(pricing);
        
          // Set additional services/extras
          if (additionalServicesData.length > 0) {
            const mappedExtras = additionalServicesData.map(service => ({
              id: service.service_id,
              name: service.name,
              icon: iconMap[service.icon_name || "Shirt"] || Shirt,
            }));
            setAllExtras(mappedExtras);
            
            // Filter based on current service type
            const currentServiceType = loadedFormData.service || formData.service || "standard";
            const isDeepOrMoveInOut = currentServiceType === 'deep' || currentServiceType === 'move-in-out';
            const isStandardOrAirbnb = currentServiceType === 'standard' || currentServiceType === 'airbnb';
            
            setExtras(
              mappedExtras.filter(service => {
                if (DEEP_SERVICES_ONLY.includes(service.id)) {
                  return isDeepOrMoveInOut;
                }
                return isStandardOrAirbnb && !DEEP_SERVICES_ONLY.includes(service.id);
              })
            );
          } else {
            setExtras(FALLBACK_EXTRAS);
          }
          
          // Set time slots
          if (timeSlotsData.length > 0) {
            setTimeSlots(timeSlotsData.map(slot => slot.time_value));
          } else {
            setTimeSlots(FALLBACK_TIME_SLOTS);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  useEffect(() => {
    // Save to localStorage (only when not in edit mode)
    // Ensure all fields from Steps 1 and 2 are preserved
    if (typeof window !== "undefined" && !editingSection) {
      const dataToSave: Partial<BookingFormData> = {
        ...formData,
        // Explicitly preserve Step 1 fields
        bedrooms: formData.bedrooms ?? 0,
        bathrooms: formData.bathrooms ?? 1,
        extras: formData.extras || [],
        service: formData.service || (serviceType as ServiceType),
        scheduledDate: formData.scheduledDate || null,
        scheduledTime: formData.scheduledTime || null,
        // Explicitly preserve Step 2 fields
        frequency: (formData.frequency || "one-time") as FrequencyType,
        cleanerPreference: (formData.cleanerPreference || "no-preference") as CleanerPreference,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData, editingSection, serviceType]);

  // Handle user login - populate form if user logs in
  useEffect(() => {
    const populateUserProfile = async () => {
      // Only run if user is logged in, not loading, and we haven't loaded profile yet
      if (!userLoading && user && !userProfileLoaded && isMounted) {
        setUserProfileLoaded(true);
        try {
          const profile = await getUserProfileClient();
          if (profile) {
            setFormData((prevData) => {
              const { updatedData, hasUpdates } = populateUserProfileData(profile, prevData);
              if (hasUpdates) {
                // Merge user profile data while preserving all Step 1 & 2 data
                const mergedData: Partial<BookingFormData> = {
                  ...prevData,
                  ...updatedData,
                  // Explicitly preserve Step 1 & 2 fields
                  service: prevData.service || updatedData.service || (serviceType as ServiceType),
                  bedrooms: prevData.bedrooms ?? updatedData.bedrooms ?? 0,
                  bathrooms: prevData.bathrooms ?? updatedData.bathrooms ?? 1,
                  extras: prevData.extras || updatedData.extras || [],
                  scheduledDate: prevData.scheduledDate ?? updatedData.scheduledDate ?? null,
                  scheduledTime: prevData.scheduledTime ?? updatedData.scheduledTime ?? null,
                  frequency: (prevData.frequency || updatedData.frequency || "one-time") as FrequencyType,
                  cleanerPreference: (prevData.cleanerPreference || updatedData.cleanerPreference || "no-preference") as CleanerPreference,
                  streetAddress: prevData.streetAddress || updatedData.streetAddress || "",
                  suburb: prevData.suburb || updatedData.suburb || "",
                  city: prevData.city || updatedData.city || "",
                };
                // Save to localStorage
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
                }
                setTempFormData(mergedData);
                return mergedData;
              }
              return prevData;
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };

    populateUserProfile();
  }, [user, userLoading, userProfileLoaded, isMounted, serviceType]);

  // Use tempFormData for price calculation when editing, otherwise use formData
  const dataForPricing = editingSection ? tempFormData : formData;
  
  // Calculate price breakdown without discount code for validation purposes
  const priceBreakdownWithoutDiscount = calculatePrice(
    dataForPricing as Partial<BookingFormData>,
    pricingConfig || undefined,
    0
  );
  
  // Get tip amount from formData or state
  const currentTip = (dataForPricing as Partial<BookingFormData>).tip || tipAmount || 0;
  
  // Calculate final price breakdown with discount code and tip applied
  const priceBreakdown = calculatePrice(
    {
      ...(dataForPricing as Partial<BookingFormData>),
      tip: currentTip,
    },
    pricingConfig || undefined,
    discountCodeAmount
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Use formData for validation (always validate saved data, not temp)
    const dataToValidate = formData;

    if (!dataToValidate.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!dataToValidate.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!dataToValidate.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToValidate.email || "")) {
      newErrors.email = "Valid email is required";
    }

    if (!dataToValidate.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmAndPay = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure discount code and tip are included in booking data
      const bookingDataWithDiscount: BookingFormData = {
        ...(formData as BookingFormData),
        discountCode: discountCode || undefined,
        tip: tipAmount > 0 ? tipAmount : undefined,
      };

      // Calculate final price
      const finalPrice = priceBreakdown.total;

      // Handle credit payment
      if (paymentMethod === "credits") {
        if (!user) {
          setErrors({ payment: "Please log in to use ShalCred credits" });
          setIsProcessing(false);
          return;
        }

        // Check if user has sufficient credits
        if (creditBalance < finalPrice) {
          setErrors({
            payment: `Insufficient credits. You have R${creditBalance.toFixed(2)}, but need R${finalPrice.toFixed(2)}`,
          });
          setIsProcessing(false);
          return;
        }

        // Submit booking with credit payment
        const result = await submitBooking(bookingDataWithDiscount, undefined, "credits");

        if (!result.success) {
          setErrors({ payment: result.message || "Failed to process booking" });
          setIsProcessing(false);
          return;
        }

        // Reload credit balance
        await loadCreditBalance();

        // Redirect to confirmation page
        router.push(`/booking/service/${serviceType}/confirmation?ref=${result.bookingReference}`);
        return;
      }

      // Handle card payment
      // Initialize payment
      const paymentInit = await initializePayment(
        bookingDataWithDiscount,
        formData.email || ""
      );

      if (!paymentInit.success || !paymentInit.publicKey || !paymentInit.amount || !paymentInit.reference) {
        throw new Error(paymentInit.message || "Failed to initialize payment");
      }

      // Initialize Paystack payment
      // Serialize booking_data as JSON string since Paystack metadata values should be strings/numbers
      initializePaystack({
        publicKey: paymentInit.publicKey,
        amount: paymentInit.amount,
        email: paymentInit.email!,
        reference: paymentInit.reference,
        callback_url: `${window.location.origin}/booking/service/${serviceType}/confirmation?ref=${paymentInit.reference}`,
        metadata: {
          booking_data: JSON.stringify(bookingDataWithDiscount),
        },
        onClose: () => {
          // Reset processing state when payment popup is closed
          setIsProcessing(false);
        },
      });

      // Reset processing state after payment popup opens
      // Small delay to ensure popup is fully opened
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);

      // Note: Paystack will handle the payment flow
      // After successful payment, Paystack redirects to callback_url
      // We'll handle the booking submission in the confirmation page or via webhook
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsProcessing(false);
      alert(error instanceof Error ? error.message : "Failed to initialize payment. Please try again.");
    }
  };

  // Handle payment callback (if redirected back from Paystack)
  // Note: This is a fallback - the confirmation page also handles booking submission
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // Paystack callback uses 'ref' parameter, not 'reference'
    const paymentRef = urlParams.get("ref") || urlParams.get("reference");
    const status = urlParams.get("status");

    // If we have a payment reference and form data, submit the booking
    // Status check is optional as Paystack redirects may not always include it
    if (paymentRef && formData.email && formData.service) {
      // Only submit if we're still on the review page (not redirected to confirmation)
      // The confirmation page will handle submission if we've been redirected
      if (window.location.pathname.includes("/review")) {
        handleBookingSubmission(paymentRef);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.service, serviceType]);

  const handleBookingSubmission = async (paymentReference: string) => {
    try {
      setIsProcessing(true);
      // Ensure discount code and tip are included in formData
      const bookingData: BookingFormData = {
        ...(formData as BookingFormData),
        discountCode: discountCode || undefined,
        tip: tipAmount > 0 ? tipAmount : undefined,
      };
      const result = await submitBooking(bookingData, paymentReference);

      if (result.success && result.bookingReference) {
        // Record discount code usage if applicable
        if (discountCode && discountCodeAmount > 0 && formData.email) {
          try {
            const { recordDiscountCodeUsage } = await import("@/app/actions/discount");
            await recordDiscountCodeUsage(
              discountCode,
              result.bookingReference,
              formData.email,
              discountCodeAmount,
              priceBreakdown.total
            );
          } catch (error) {
            console.error("Failed to record discount code usage (non-critical):", error);
          }
        }
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        // Redirect to confirmation page
        router.push(`/booking/service/${serviceType}/confirmation?ref=${result.bookingReference}`);
      } else {
        throw new Error(result.message || "Failed to submit booking");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit booking. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(`/booking/service/${serviceType}/schedule`);
  };

  // Edit mode handlers
  const handleEditSection = (section: "service" | "schedule" | "contact") => {
    setEditingSection(section);
    setTempFormData({ ...formData });
    setHasUnsavedChanges(false);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setTempFormData({ ...formData });
    setHasUnsavedChanges(false);
    setErrors({});
  };

  const handleSaveAll = () => {
    // Update formData with tempFormData
    setFormData({ ...tempFormData });
    setEditingSection(null);
    setHasUnsavedChanges(false);
    setErrors({});
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempFormData));
    }
  };

  const handleTempDataChange = (updates: Partial<BookingFormData>) => {
    const updated = { ...tempFormData, ...updates };
    setTempFormData(updated);
    setHasUnsavedChanges(true);
    
    // Update extras filter when service type changes
    if (updates.service && updates.service !== formData.service) {
      const isDeepOrMoveInOut = updates.service === 'deep' || updates.service === 'move-in-out';
      const isStandardOrAirbnb = updates.service === 'standard' || updates.service === 'airbnb';
      
      setExtras(
        allExtras.filter(service => {
          if (DEEP_SERVICES_ONLY.includes(service.id)) {
            return isDeepOrMoveInOut;
          }
          return isStandardOrAirbnb && !DEEP_SERVICES_ONLY.includes(service.id);
        })
      );
      
      // Clear extras if service doesn't support them
      if (!isStandardOrAirbnb) {
        updated.extras = [];
      }
    }
  };

  const handleExtrasToggle = (extraId: string) => {
    const current = tempFormData.extras || [];
    const updated = current.includes(extraId)
      ? current.filter((id) => id !== extraId)
      : [...current, extraId];
    handleTempDataChange({ extras: updated });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Use tempFormData for address when editing, otherwise use formData
  const addressData = editingSection === "contact" ? tempFormData : formData;
  const address = addressData.streetAddress
    ? `${addressData.streetAddress}${addressData.aptUnit ? `, ${addressData.aptUnit}` : ""}, ${addressData.suburb || ""}, ${addressData.city || ""}`
    : undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Progress Indicator */}
        <div className="md:hidden mb-6 flex justify-center">
          <ProgressIndicator currentStep={3} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Review your booking</h1>
        <p className="text-lg text-gray-600 mb-8">Please review all details before confirming your booking</p>

        {/* Global Save Button - appears when any section is being edited */}
        {editingSection && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                You have unsaved changes. Click Save to apply all changes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAll}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

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
          {/* Left Column - Review Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service & Property */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-500" />
                  Service & Property
                </h2>
                {editingSection === "service" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAll}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditSection("service")}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                )}
              </div>
              {editingSection === "service" ? (
                <div className="space-y-6">
                  {/* Service Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Service Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <ServiceCard
                          key={service}
                          service={service}
                          isSelected={(tempFormData.service || "standard") === service}
                          onClick={() => handleTempDataChange({ service })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrooms
                      </label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          id="bedrooms"
                          value={tempFormData.bedrooms ?? 0}
                          onChange={(e) => handleTempDataChange({ bedrooms: parseInt(e.target.value) })}
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
                          value={tempFormData.bathrooms ?? 1}
                          onChange={(e) => handleTempDataChange({ bathrooms: parseInt(e.target.value) })}
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

                  {/* Extras - Only show for standard and airbnb services */}
                  {((tempFormData.service === "standard" || tempFormData.service === "airbnb") && extras.length > 0) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Extras
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {extras.map((extra) => {
                          const Icon = extra.icon;
                          const isSelected = tempFormData.extras?.includes(extra.id) || false;
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
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Service Type:</strong> {getServiceName(formData.service || "standard")}</p>
                  <p suppressHydrationWarning>
                    <strong>Bedrooms:</strong> {isMounted ? (formData.bedrooms ?? 0) : 0}
                  </p>
                  <p suppressHydrationWarning>
                    <strong>Bathrooms:</strong> {isMounted ? (formData.bathrooms ?? 1) : 1}
                  </p>
                  {isMounted && formData.extras && formData.extras.length > 0 ? (
                    <p suppressHydrationWarning>
                      <strong>Extras:</strong> {formData.extras.length} selected
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            {/* Schedule */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Schedule
                </h2>
                {editingSection === "schedule" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAll}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditSection("schedule")}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                )}
              </div>
              {editingSection === "schedule" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        id="scheduledDate"
                        value={tempFormData.scheduledDate || ""}
                        onChange={(e) => handleTempDataChange({ scheduledDate: e.target.value, scheduledTime: null })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          id="scheduledTime"
                          value={tempFormData.scheduledTime || ""}
                          onChange={(e) => handleTempDataChange({ scheduledTime: e.target.value })}
                          disabled={!tempFormData.scheduledDate}
                          className={`w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                            !tempFormData.scheduledDate ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="">
                            {tempFormData.scheduledDate ? "Select a time" : "Select date first"}
                          </option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        id="frequency"
                        value={tempFormData.frequency || "one-time"}
                        onChange={(e) => handleTempDataChange({ frequency: e.target.value as FrequencyType })}
                        className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        {frequencies.map((freq) => (
                          <option key={freq} value={freq}>
                            {getFrequencyName(freq)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2" suppressHydrationWarning>
                  <p suppressHydrationWarning>
                    <strong>Date:</strong> {isMounted ? formatDate(formData.scheduledDate || null) : "Not scheduled"}
                  </p>
                  <p suppressHydrationWarning>
                    <strong>Time:</strong> {isMounted ? (formData.scheduledTime || "Not specified") : "Not specified"}
                  </p>
                  <p><strong>Frequency:</strong> {getFrequencyName(formData.frequency || "one-time")}</p>
                </div>
              )}
            </section>

            {/* Contact & Address */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Contact & Address
                </h2>
                {editingSection === "contact" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAll}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditSection("contact")}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                )}
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        value={editingSection === "contact" ? (tempFormData.firstName || "") : (formData.firstName || "")}
                        onChange={(e) => {
                          if (editingSection === "contact") {
                            handleTempDataChange({ firstName: e.target.value });
                          } else {
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Thabo"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="lastName"
                        value={editingSection === "contact" ? (tempFormData.lastName || "") : (formData.lastName || "")}
                        onChange={(e) => {
                          if (editingSection === "contact") {
                            handleTempDataChange({ lastName: e.target.value });
                          } else {
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Mokoena"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={editingSection === "contact" ? (tempFormData.email || "") : (formData.email || "")}
                        onChange={(e) => {
                          if (editingSection === "contact") {
                            handleTempDataChange({ email: e.target.value });
                          } else {
                            setFormData((prev) => ({ ...prev, email: e.target.value }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., thabo@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={editingSection === "contact" ? (tempFormData.phone || "") : (formData.phone || "")}
                        onChange={(e) => {
                          if (editingSection === "contact") {
                            handleTempDataChange({ phone: e.target.value });
                          } else {
                            setFormData((prev) => ({ ...prev, phone: e.target.value }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0821234567 or +27821234567"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Service Address */}
              <div suppressHydrationWarning>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Address
                </h3>
                {editingSection === "contact" ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="streetAddress"
                        value={tempFormData.streetAddress || ""}
                        onChange={(e) => handleTempDataChange({ streetAddress: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 123 Nelson Mandela Avenue"
                      />
                    </div>
                    <div>
                      <label htmlFor="aptUnit" className="block text-sm font-medium text-gray-700 mb-2">
                        Apt / Unit
                      </label>
                      <input
                        type="text"
                        id="aptUnit"
                        value={tempFormData.aptUnit || ""}
                        onChange={(e) => handleTempDataChange({ aptUnit: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Unit 5"
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
                          value={tempFormData.suburb || ""}
                          onChange={(e) => handleTempDataChange({ suburb: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Sandton"
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={tempFormData.city || ""}
                          onChange={(e) => handleTempDataChange({ city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Johannesburg"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700" suppressHydrationWarning>
                    {isMounted ? (address || "Not specified") : "Not specified"}
                  </p>
                )}
              </div>
            </section>

            {/* Total Amount & Payment */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Total Amount</h2>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(priceBreakdown.total)}
                </div>
                <p className="text-sm text-gray-600">All fees included</p>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service & rooms:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(priceBreakdown.subtotal - priceBreakdown.frequencyDiscount)}
                  </span>
                </div>
                {priceBreakdown.frequencyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Frequency Discount:</span>
                    <span>-{formatPrice(priceBreakdown.frequencyDiscount)}</span>
                  </div>
                )}
                {priceBreakdown.discountCodeDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Code:</span>
                    <span>-{formatPrice(priceBreakdown.discountCodeDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee:</span>
                  <span className="font-medium text-gray-900">
                    +{formatPrice(priceBreakdown.serviceFee)}
                  </span>
                </div>
                {priceBreakdown.tip > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tip:</span>
                    <span className="font-medium">+{formatPrice(priceBreakdown.tip)}</span>
                  </div>
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <DiscountCodeInput
                  onDiscountApplied={(amount, code) => {
                    setDiscountCodeAmount(amount);
                    setDiscountCode(code);
                    setFormData((prev) => ({ ...prev, discountCode: code }));
                  }}
                  onDiscountRemoved={() => {
                    setDiscountCodeAmount(0);
                    setDiscountCode("");
                    setFormData((prev) => ({ ...prev, discountCode: undefined }));
                  }}
                  orderTotal={priceBreakdownWithoutDiscount.subtotal - priceBreakdownWithoutDiscount.frequencyDiscount}
                  currentDiscountCode={discountCode}
                  currentDiscountAmount={discountCodeAmount}
                />
              </div>

              {/* Tip Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tip for Cleaner (Optional)
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 150, 200].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          const tip = tipAmount === amount ? 0 : amount;
                          setTipAmount(tip);
                          setCustomTip("");
                          setFormData((prev) => ({ ...prev, tip: tip || undefined }));
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          tipAmount === amount && !customTip
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                            : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        R {amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Custom:</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={customTip}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomTip(value);
                          const numValue = value === "" ? 0 : parseFloat(value) || 0;
                          setTipAmount(numValue);
                          setFormData((prev) => ({ ...prev, tip: numValue > 0 ? numValue : undefined }));
                        }}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {tipAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTipAmount(0);
                          setCustomTip("");
                          setFormData((prev) => ({ ...prev, tip: undefined }));
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {tipAmount > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Thank you! Your tip of {formatPrice(tipAmount)} will go directly to your cleaner.
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Selection */}
              {user && (
                <div className="pt-4 border-t border-gray-200 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                      <p className="font-medium text-sm text-gray-700">Card Payment</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credits")}
                      disabled={creditBalance < priceBreakdown.total}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === "credits"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } ${creditBalance < priceBreakdown.total ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Coins className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                      <p className="font-medium text-sm text-gray-700">ShalCred</p>
                      {loadingCredits ? (
                        <p className="text-xs text-gray-500 mt-1">Loading...</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          R{creditBalance.toFixed(2)} available
                        </p>
                      )}
                    </button>
                  </div>
                  {paymentMethod === "credits" && creditBalance < priceBreakdown.total && (
                    <p className="mt-2 text-sm text-red-600">
                      Insufficient credits. You need R{priceBreakdown.total.toFixed(2)} but only have R{creditBalance.toFixed(2)}
                    </p>
                  )}
                  {paymentMethod === "credits" && creditBalance >= priceBreakdown.total && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ You have sufficient credits to pay for this booking
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Amount due today: <span className="font-bold text-gray-900">{formatPrice(priceBreakdown.total)}</span>
                </p>
                {paymentMethod === "card" && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure payment powered by Paystack
                  </p>
                )}
                {paymentMethod === "credits" && user && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    Payment will be deducted from your ShalCred balance
                  </p>
                )}
              </div>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirmAndPay}
                disabled={
                  isProcessing ||
                  editingSection !== null ||
                  (paymentMethod === "credits" && (!user || creditBalance < priceBreakdown.total))
                }
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : editingSection ? (
                  "Please save changes first"
                ) : paymentMethod === "credits" ? (
                  `Confirm & Pay with Credits (R${priceBreakdown.total.toFixed(2)})`
                ) : (
                  `Confirm & Pay ${formatPrice(priceBreakdown.total)}`
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1" suppressHydrationWarning>
            <PriceSummary
              service={dataForPricing.service || "standard"}
              frequency={dataForPricing.frequency || "one-time"}
              priceBreakdown={priceBreakdown}
              bedrooms={dataForPricing.bedrooms || 0}
              bathrooms={dataForPricing.bathrooms || 1}
              extras={dataForPricing.extras || []}
              scheduledDate={dataForPricing.scheduledDate || null}
              scheduledTime={dataForPricing.scheduledTime || null}
              address={address}
              cleanerPreference={formData.cleanerPreference}
              cleaners={isTeamService ? teams : cleaners}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
