"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, Home, Star, Package, Calendar, ChefHat, Boxes, Grid, Paintbrush, Shirt, CheckCircle2, AlertCircle, Refrigerator, ChevronDown, FileText, Layers, Car, Sofa, Square, Sparkles, ShoppingBasket, Building2, AppWindow } from "lucide-react";
import { submitQuote, type QuoteFormData } from "@/app/actions/submit-quote";
import { getServiceLocations, getAdditionalServices } from "@/app/actions/booking-data";
import { FALLBACK_LOCATIONS, FALLBACK_EXTRAS } from "@/lib/supabase/booking-data-fallbacks";
import { type ServiceLocation, type AdditionalService } from "@/lib/supabase/booking-data-types";

// Icon mapping for additional services (by icon_name from database)
const iconMap: Record<string, any> = {
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
  Home,
};

// Service-specific icon mapping (overrides database icon_name for better visual distinction)
const serviceIconMap: Record<string, any> = {
  'ironing': Sparkles, // Ironing icon (sparkles represent pressed/ironed clothes)
  'laundry': ShoppingBasket, // Laundry basket icon
  'balcony-cleaning': Building2, // Balcony/building icon
  'exterior-windows': AppWindow, // Window icon for exterior windows
};

const services = [
  { id: "standard-cleaning", name: "Standard Cleaning", icon: Home },
  { id: "deep-cleaning", name: "Deep Cleaning", icon: Star },
  { id: "moving-cleaning", name: "Moving Cleaning", icon: Package },
  { id: "airbnb-cleaning", name: "Airbnb Cleaning", icon: Calendar },
];

// Define which extras are available for each service type
const SERVICE_EXTRAS_MAP: Record<string, string[]> = {
  'standard-cleaning': [
    'inside-fridge',
    'inside-oven',
    'inside-cabinets',
    'interior-windows',
    'interior-walls',
    'ironing',
    'laundry',
  ],
  'airbnb-cleaning': [
    'inside-fridge',
    'inside-oven',
    'inside-cabinets',
    'interior-windows',
    'interior-walls',
    'ironing',
    'laundry',
  ],
  'deep-cleaning': [
    'carpet-cleaning',
    'ceiling-cleaning',
    'garage-cleaning',
    'balcony-cleaning',
    'couch-cleaning',
  ],
  'moving-cleaning': [
    'carpet-cleaning',
    'ceiling-cleaning',
    'garage-cleaning',
    'balcony-cleaning',
    'couch-cleaning',
  ],
};

export default function QuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuoteFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    customLocation: "",
    service: null,
    bedrooms: 0,
    bathrooms: 1,
    additionalServices: [],
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Dynamic data from Supabase
  const [locations, setLocations] = useState<string[]>(FALLBACK_LOCATIONS);
  const [additionalServices, setAdditionalServices] = useState<Array<{ id: string; name: string; icon: any }>>(
    FALLBACK_EXTRAS.map(extra => {
      // Use service-specific icon if available, otherwise use icon from fallback
      const icon = serviceIconMap[extra.id] || iconMap[extra.icon] || Shirt;
      return { ...extra, icon };
    })
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch dynamic data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch locations
        const locationsData = await getServiceLocations();
        if (locationsData.length > 0) {
          setLocations(locationsData.map(loc => loc.name));
        }
        
        // Fetch additional services
        const additionalServicesData = await getAdditionalServices();
        if (additionalServicesData.length > 0) {
          setAdditionalServices(
            additionalServicesData.map(service => {
              // Use service-specific icon if available, otherwise use icon_name from database
              const icon = serviceIconMap[service.service_id] || iconMap[service.icon_name || "Shirt"] || Shirt;
              return {
                id: service.service_id,
                name: service.name,
                icon: icon,
              };
            })
          );
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

  const handleInputChange = (field: keyof QuoteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    // Set the selected service in formData
    handleInputChange("service", serviceId);
    
    // Clear any additional services that are not valid for the new service
    const validExtras = SERVICE_EXTRAS_MAP[serviceId] || [];

    // Filter out invalid extras
    setFormData((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.filter(id => validExtras.includes(id)),
    }));
  };

  // Function to redirect to full booking form (used by "Skip to Full Booking" link)
  const handleSkipToBooking = () => {
    if (!formData.service) {
      // If no service selected, go to standard booking
      router.push("/booking/service/standard/details");
      return;
    }
    
    // Map quote page service IDs to booking form types
    const serviceTypeMap: Record<string, string> = {
      "standard-cleaning": "standard",
      "deep-cleaning": "deep",
      "moving-cleaning": "move-in-out",
      "airbnb-cleaning": "airbnb"
    };
    
    const serviceType = serviceTypeMap[formData.service] || "standard";
    router.push(`/booking/service/${serviceType}/details`);
  };

  const handleAdditionalServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const current = prev.additionalServices;
      const updated = current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId];
      return { ...prev, additionalServices: updated };
    });
  };

  // Filter additional services based on selected service type
  const getFilteredAdditionalServices = () => {
    if (!formData.service) {
      return []; // Show no extras if no service is selected
    }

    const validExtras = SERVICE_EXTRAS_MAP[formData.service] || [];
    
    // Filter additional services to only show those valid for the selected service
    return additionalServices.filter(service => validExtras.includes(service.id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    if (formData.location === "other" && !formData.customLocation?.trim()) {
      newErrors.customLocation = "Please specify your location";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (formData.bedrooms < 0) {
      newErrors.bedrooms = "Invalid number of bedrooms";
    }

    if (formData.bathrooms < 1) {
      newErrors.bathrooms = "At least one bathroom is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitQuote(formData);

      if (result.success) {
        // Redirect to confirmation page
        router.push("/booking/quote/confirmation");
      } else {
        setSubmitStatus({ type: "error", message: result.message });
        if (result.errors) {
          setErrors(result.errors);
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const formatLocation = () => {
    if (formData.location === "other") {
      return formData.customLocation || "Not specified";
    }
    return formData.location || "Not selected";
  };

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm" suppressHydrationWarning>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Bokkie
              </span>
            </Link>

            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-blue-500">Service & Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm font-medium text-gray-500">Contact Info</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-gray-500">Review & Submit</span>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="hidden md:block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Become a Cleaner
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </div>
          </div>
          
          {/* Progress Indicator - Mobile */}
          <div className="md:hidden mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <span className="text-xs font-medium text-blue-500">Service & Details</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <span className="text-xs font-medium text-gray-500">Contact</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                3
              </div>
              <span className="text-xs font-medium text-gray-500">Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Free Quote Request
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get Your Free Cleaning Quote
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tell us about your cleaning needs and we'll get back to you with a personalized quote
            </p>
          </div>

          {/* Success/Error Message */}
          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                submitStatus.type === "success"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p>{submitStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form Sections */}
              <div className="lg:col-span-2 space-y-8">
                {/* Section 1: Contact Information */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    1. Your Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.firstName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="John"
                          required
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.lastName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Doe"
                          required
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="+27 12 345 6789"
                          required
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                            errors.location ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        >
                          <option value="">Select your location</option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                      )}
                      {formData.location === "other" && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={formData.customLocation || ""}
                            onChange={(e) => handleInputChange("customLocation", e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.customLocation ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Please specify your location"
                            required={formData.location === "other"}
                          />
                          {errors.customLocation && (
                            <p className="mt-1 text-sm text-red-600">{errors.customLocation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section 2: Service Selection */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    2. Select Your Service
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {services.map((service) => {
                      const Icon = service.icon;
                      const isSelected = formData.service === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service.id)}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                          <p className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                            {service.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.service && (
                    <p className="mt-2 text-sm text-red-600">{errors.service}</p>
                  )}
                </section>

                {/* Section 3: Home Details */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    3. Home Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrooms
                      </label>
                      <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          id="bedrooms"
                          value={formData.bedrooms}
                          onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value))}
                          className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                            errors.bedrooms ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>
                            {i} {i === 1 ? "Bedroom" : "Bedrooms"}
                          </option>
                        ))}
                        <option value={11}>10+ Bedrooms</option>
                      </select>
                      </div>
                      {errors.bedrooms && (
                        <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
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
                          value={formData.bathrooms}
                          onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value))}
                          className={`w-full px-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
                            errors.bathrooms ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? "Bathroom" : "Bathrooms"}
                          </option>
                        ))}
                        <option value={11}>10+ Bathrooms</option>
                      </select>
                      </div>
                      {errors.bathrooms && (
                        <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Bedrooms and bathrooms affect the base price.
                  </p>
                </section>

                {/* Section 4: Additional Services */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Boxes className="w-6 h-6 text-gray-700" />
                    4. Additional Services (Optional)
                  </h2>
                  {formData.service ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {getFilteredAdditionalServices().map((service) => {
                        const Icon = service.icon;
                        const isSelected = formData.additionalServices.includes(service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleAdditionalServiceToggle(service.id)}
                            className={`p-4 border-2 rounded-lg transition-all text-center ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                            <p className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                              {service.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Please select a service first to see available additional services.
                    </p>
                  )}
                </section>

                {/* Section 5: Additional Notes */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    5. Additional Notes (Optional)
                  </h2>
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                      Any additional information or special requests?
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        id="note"
                        value={formData.note || ""}
                        onChange={(e) => handleInputChange("note", e.target.value)}
                        rows={4}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          errors.note ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tell us about any special requirements, preferred times, or other details that might help us provide a better quote..."
                      />
                    </div>
                    {errors.note && (
                      <p className="mt-1 text-sm text-red-600">{errors.note}</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column - Quote Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Your Quote</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Service</p>
                      <p className="font-medium text-gray-900">
                        {formData.service
                          ? services.find((s) => s.id === formData.service)?.name || "Not selected"
                          : "Not selected"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-medium text-gray-900">{formatLocation()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Home details</p>
                      <p className="font-medium text-gray-900">
                        {formData.bedrooms} Bed • {formData.bathrooms} Bath
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Extras</p>
                      <p className="font-medium text-gray-900">
                        {formData.additionalServices.length > 0
                          ? formData.additionalServices
                              .map((id) => additionalServices.find((s) => s.id === id)?.name || id)
                              .join(", ")
                          : "None"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-1">Custom Quote</h3>
                    <p className="text-sm text-gray-600">
                      We'll provide a personalized quote based on your selections
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Quote & Continue"}
                    {!isSubmitting && <span>→</span>}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipToBooking}
                    className="block w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center"
                  >
                    Skip to Full Booking
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    We will email this quote to your email.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
