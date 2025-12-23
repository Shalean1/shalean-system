"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { Booking, BookingFormData, ServiceType, FrequencyType, CleanerPreference } from "@/lib/types/booking";
import { adminUpdateBooking } from "@/app/actions/admin-update-booking";
import { useRouter } from "next/navigation";
import { getServiceLocations, getAdditionalServices, getTimeSlots, getCleaners, getFrequencyOptions } from "@/lib/supabase/booking-data";

interface AdminEditBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const services: ServiceType[] = ["standard", "deep", "move-in-out", "airbnb", "office", "holiday", "carpet-cleaning"];

export default function AdminEditBookingModal({ booking, isOpen, onClose, onSuccess }: AdminEditBookingModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    service: booking.service,
    bedrooms: booking.bedrooms,
    bathrooms: booking.bathrooms,
    officeSize: booking.officeSize,
    extras: booking.extras || [],
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    streetAddress: booking.streetAddress,
    aptUnit: booking.aptUnit,
    suburb: booking.suburb,
    city: booking.city,
    cleanerPreference: booking.cleanerPreference,
    frequency: booking.frequency,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    discountCode: booking.discountCode,
    tip: booking.tip,
    specialInstructions: booking.specialInstructions,
  });

  // Dynamic data
  const [locations, setLocations] = useState<Array<{ name: string; city: string }>>([]);
  const [additionalServices, setAdditionalServices] = useState<Array<{ service_id: string; name: string }>>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [cleaners, setCleaners] = useState<Array<{ cleaner_id: string; name: string }>>([]);
  const [frequencies, setFrequencies] = useState<FrequencyType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load dynamic data
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          setIsLoadingData(true);
          const [locationsData, servicesData, slotsData, cleanersData, frequenciesData] = await Promise.all([
            getServiceLocations(),
            getAdditionalServices(),
            getTimeSlots(),
            getCleaners(),
            getFrequencyOptions(),
          ]);

          setLocations(locationsData.map(loc => ({ name: loc.name, city: loc.city })));
          setAdditionalServices(servicesData.map(s => ({ service_id: s.service_id, name: s.name })));
          setTimeSlots(slotsData.map(slot => slot.time_value));
          setCleaners(cleanersData.map(c => ({ cleaner_id: c.cleaner_id, name: c.name })));
          setFrequencies(frequenciesData.map(f => f.frequency_id as FrequencyType));
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoadingData(false);
        }
      };

      loadData();
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        service: booking.service,
        bedrooms: booking.bedrooms,
        bathrooms: booking.bathrooms,
        officeSize: booking.officeSize,
        extras: booking.extras || [],
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        streetAddress: booking.streetAddress,
        aptUnit: booking.aptUnit,
        suburb: booking.suburb,
        city: booking.city,
        cleanerPreference: booking.cleanerPreference,
        frequency: booking.frequency,
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone,
        discountCode: booking.discountCode,
        tip: booking.tip,
        specialInstructions: booking.specialInstructions,
      });
      setError(null);
      setErrors({});
    }
  }, [isOpen, booking]);

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleExtrasToggle = (extraId: string) => {
    setFormData(prev => {
      const currentExtras = prev.extras || [];
      const newExtras = currentExtras.includes(extraId)
        ? currentExtras.filter(id => id !== extraId)
        : [...currentExtras, extraId];
      return { ...prev, extras: newExtras };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setErrors({});

    try {
      const result = await adminUpdateBooking(booking.bookingReference, formData);

      if (result.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(result.message);
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Booking (Admin)</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Service & Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => handleInputChange("service", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </option>
                    ))}
                  </select>
                  {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange("frequency", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq === "one-time" ? "One-time" : freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
                </div>

                {formData.service === "office" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Size *
                      </label>
                      <select
                        value={formData.officeSize || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || !['small', 'medium', 'large'].includes(value)) {
                            handleInputChange("officeSize", undefined);
                          } else {
                            handleInputChange("officeSize", value as 'small' | 'medium' | 'large');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select office size</option>
                        <option value="small">Small (1-3 rooms)</option>
                        <option value="medium">Medium (4-10 rooms)</option>
                        <option value="large">Large (10+ rooms)</option>
                      </select>
                      {errors.officeSize && <p className="mt-1 text-sm text-red-600">{errors.officeSize}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathrooms *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrooms *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathrooms *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
                    </div>
                  </>
                )}
              </div>

              {/* Additional Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Services
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {additionalServices.map((service) => (
                    <label key={service.service_id} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.extras || []).includes(service.service_id)}
                        onChange={() => handleExtrasToggle(service.service_id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate || ""}
                    onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Time *
                  </label>
                  <select
                    value={formData.scheduledTime || ""}
                    onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {(() => {
                          const [hours, minutes] = slot.split(":");
                          const hour = parseInt(hours, 10);
                          const ampm = hour >= 12 ? "PM" : "AM";
                          const displayHour = hour % 12 || 12;
                          return `${displayHour}:${minutes} ${ampm}`;
                        })()}
                      </option>
                    ))}
                  </select>
                  {errors.scheduledTime && <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apt/Unit
                    </label>
                    <input
                      type="text"
                      value={formData.aptUnit || ""}
                      onChange={(e) => handleInputChange("aptUnit", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suburb *
                    </label>
                    <input
                      type="text"
                      value={formData.suburb}
                      onChange={(e) => handleInputChange("suburb", e.target.value)}
                      list="suburbs"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <datalist id="suburbs">
                      {locations.map((loc) => (
                        <option key={loc.name} value={loc.name} />
                      ))}
                    </datalist>
                    {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                </div>
              </div>

              {/* Cleaner Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaner Preference
                </label>
                <select
                  value={formData.cleanerPreference}
                  onChange={(e) => handleInputChange("cleanerPreference", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="no-preference">No Preference</option>
                  {cleaners.map((cleaner) => (
                    <option key={cleaner.cleaner_id} value={cleaner.cleaner_id}>
                      {cleaner.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Discount Code & Tip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    value={formData.discountCode || ""}
                    onChange={(e) => handleInputChange("discountCode", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip Amount (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tip || 0}
                    onChange={(e) => handleInputChange("tip", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions || ""}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoadingData}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
