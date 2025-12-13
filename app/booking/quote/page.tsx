"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, Home, Star, Package, Calendar, ChefHat, Boxes, Grid, Paintbrush, Shirt, CheckCircle2, AlertCircle, Refrigerator, ChevronDown } from "lucide-react";
import { submitQuote, type QuoteFormData } from "@/app/actions/submit-quote";

// Location options from sitemap
const locations = [
  "Sea Point",
  "Camps Bay",
  "Claremont",
  "Green Point",
  "V&A Waterfront",
  "Constantia",
  "Newlands",
  "Rondebosch",
  "Observatory",
  "Woodstock",
  "City Bowl",
  "Gardens",
  "Tamboerskloof",
  "Oranjezicht",
  "Vredehoek",
  "Devils Peak",
  "Mouille Point",
  "Three Anchor Bay",
  "Bantry Bay",
  "Fresnaye",
  "Bakoven",
  "Llandudno",
  "Hout Bay",
  "Wynberg",
  "Kenilworth",
  "Plumstead",
  "Diep River",
  "Bergvliet",
  "Tokai",
  "Steenberg",
  "Muizenberg",
  "Kalk Bay",
  "Fish Hoek",
  "Simons Town",
];

const services = [
  { id: "standard-cleaning", name: "Standard Cleaning", icon: Home },
  { id: "deep-cleaning", name: "Deep Cleaning", icon: Star },
  { id: "moving-cleaning", name: "Moving Cleaning", icon: Package },
  { id: "airbnb-cleaning", name: "Airbnb Cleaning", icon: Calendar },
];

const additionalServices = [
  { id: "inside-fridge", name: "Inside Fridge", icon: Refrigerator },
  { id: "inside-oven", name: "Inside Oven", icon: ChefHat },
  { id: "inside-cabinets", name: "Inside Cabinets", icon: Boxes },
  { id: "interior-windows", name: "Interior Windows", icon: Grid },
  { id: "interior-walls", name: "Interior Walls", icon: Paintbrush },
  { id: "ironing", name: "Ironing", icon: Shirt },
  { id: "laundry", name: "Laundry", icon: Shirt },
];

export default function QuotePage() {
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
    handleInputChange("service", serviceId);
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
        setSubmitStatus({ type: "success", message: result.message });
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
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
          });
          setSubmitStatus(null);
        }, 5000);
      } else {
        setSubmitStatus({ type: "error", message: result.message });
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Shalean
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
                <span className="text-sm font-medium text-gray-500">Schedule & Cleaner</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-gray-500">Contact & Review</span>
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
              <span className="text-xs font-medium text-gray-500">Schedule</span>
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
                  ? "bg-green-50 text-green-800 border border-green-200"
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

          <form onSubmit={handleSubmit}>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    4. Additional Services (Optional)
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {additionalServices.map((service) => {
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
                        {formData.bedrooms} bd • {formData.bathrooms} ba
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Extras</p>
                      <p className="font-medium text-gray-900">{formData.additionalServices.length}</p>
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

                  <Link
                    href="#"
                    className="block w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center"
                  >
                    Skip to Full Booking
                  </Link>

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
