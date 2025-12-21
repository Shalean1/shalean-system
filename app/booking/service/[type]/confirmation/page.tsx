"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, Phone, ArrowRight, ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Booking, PriceBreakdown, BookingFormData, ServiceType, FrequencyType, CleanerPreference, normalizeCleanerPreference } from "@/lib/types/booking";
import { getServiceName, formatPrice, getFrequencyName, calculatePrice, fetchPricingConfig } from "@/lib/pricing";
import { useAuth } from "@/lib/hooks/useSupabase";
import { submitBooking } from "@/app/actions/submit-booking";
import { validateDiscountCode } from "@/app/actions/discount";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get("ref"); // This is the payment reference from Paystack
  const [booking, setBooking] = useState<Booking | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Pre-load pricing config to avoid dynamic imports
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  
  useEffect(() => {
    // Pre-load pricing config in parallel
    fetchPricingConfig().then(setPricingConfig).catch(console.error);
  }, []);

  // Helper function to calculate price breakdown
  const calculatePriceBreakdown = async (bookingData: Booking | BookingFormData) => {
    if (!pricingConfig) {
      // Fallback: fetch if not pre-loaded
      const config = await fetchPricingConfig();
      setPricingConfig(config);
      return calculatePriceBreakdownWithConfig(bookingData, config);
    }
    return calculatePriceBreakdownWithConfig(bookingData, pricingConfig);
  };

  const calculatePriceBreakdownWithConfig = async (
    bookingData: Booking | BookingFormData,
    config: any
  ): Promise<PriceBreakdown> => {
    // Calculate initial price breakdown (without discount code)
    const initialPriceBreakdown = calculatePrice(bookingData, config, 0);
    
    // Validate and apply discount code if provided
    let discountCodeAmount = 0;
    if (bookingData.discountCode && bookingData.discountCode.trim()) {
      try {
        const discountResult = await validateDiscountCode(
          bookingData.discountCode.trim(),
          initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
        );
        if (discountResult.success) {
          discountCodeAmount = discountResult.discountAmount;
        }
      } catch (error) {
        console.error("Error validating discount code:", error);
      }
    }
    
    // Calculate final price breakdown with discount code
    return calculatePrice(bookingData, config, discountCodeAmount);
  };

  useEffect(() => {
    const loadBooking = async () => {
      // If payment reference is provided, first try to find booking by payment reference
      if (paymentRef) {
        try {
          const response = await fetch(`/api/bookings/payment/${encodeURIComponent(paymentRef)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.booking) {
              const fetchedBooking = data.booking;
              setBooking(fetchedBooking);
              
              // Calculate price breakdown for fetched booking (use pre-loaded config if available)
              try {
                const finalPriceBreakdown = await calculatePriceBreakdown(fetchedBooking);
                setPriceBreakdown(finalPriceBreakdown);
              } catch (error) {
                console.error("Error calculating price breakdown:", error);
              }
              
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching booking by payment reference:", error);
        }

        // Booking not found by payment reference - try to submit it using localStorage data or Paystack metadata
        if (typeof window !== "undefined") {
          let parsed: Partial<BookingFormData> = {};
          let dataSource = "localStorage";
          
          // First, try to get data from localStorage
          const saved = localStorage.getItem("shalean_booking_data");
          if (saved) {
            try {
              parsed = JSON.parse(saved);
              console.log("Parsed booking data from localStorage:", parsed);
            } catch (error) {
              console.error("Error parsing localStorage data:", error);
            }
          }
          
          // Only fetch Paystack metadata if address fields are missing (optimize: avoid unnecessary external API call)
          const needsAddressData = !parsed.streetAddress || !parsed.suburb || !parsed.city;
          if (needsAddressData && paymentRef) {
            try {
              console.log("Address fields missing, fetching from Paystack metadata...");
              // Fetch payment metadata (with AbortController for timeout if needed)
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
              
              const paymentResponse = await fetch(`/api/payment/${encodeURIComponent(paymentRef)}`, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              if (paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                console.log("Payment API response:", paymentData);
                
                if (paymentData.success && paymentData.transaction?.metadata) {
                  const metadata = paymentData.transaction.metadata;
                  console.log("Paystack metadata:", metadata);
                  
                  // Handle different metadata formats
                  let metadataBookingData: any = null;
                  
                  // Try direct booking_data property
                  if (metadata.booking_data) {
                    try {
                      metadataBookingData = typeof metadata.booking_data === 'string' 
                        ? JSON.parse(metadata.booking_data) 
                        : metadata.booking_data;
                    } catch (parseError) {
                      console.error("Error parsing booking_data from metadata:", parseError);
                      // If parsing fails but it's already an object, use it directly
                      if (typeof metadata.booking_data === 'object') {
                        metadataBookingData = metadata.booking_data;
                      }
                    }
                  }
                  // Try if metadata itself is the booking data
                  else if (metadata.streetAddress || metadata.suburb || metadata.city) {
                    metadataBookingData = metadata;
                  }
                  // Try custom_fields array format (Paystack alternative format)
                  else if (Array.isArray(metadata.custom_fields)) {
                    const customFields: Record<string, any> = {};
                    metadata.custom_fields.forEach((field: any) => {
                      if (field.variable_name && field.value) {
                        customFields[field.variable_name] = field.value;
                      }
                    });
                    if (customFields.booking_data) {
                      try {
                        metadataBookingData = typeof customFields.booking_data === 'string'
                          ? JSON.parse(customFields.booking_data)
                          : customFields.booking_data;
                      } catch (parseError) {
                        console.error("Error parsing booking_data from custom_fields:", parseError);
                        if (typeof customFields.booking_data === 'object') {
                          metadataBookingData = customFields.booking_data;
                        }
                      }
                    } else if (customFields.streetAddress || customFields.suburb || customFields.city) {
                      metadataBookingData = customFields;
                    }
                  }
                  
                  if (metadataBookingData && typeof metadataBookingData === 'object') {
                    console.log("Found booking data in Paystack metadata:", metadataBookingData);
                    // Merge metadata data with localStorage data (metadata takes precedence for missing fields)
                    parsed = {
                      ...parsed,
                      ...metadataBookingData,
                      // Preserve any fields that exist in localStorage but not in metadata
                      streetAddress: parsed.streetAddress || metadataBookingData.streetAddress,
                      suburb: parsed.suburb || metadataBookingData.suburb,
                      city: parsed.city || metadataBookingData.city,
                      aptUnit: parsed.aptUnit || metadataBookingData.aptUnit,
                    };
                    dataSource = "Paystack metadata";
                    console.log("Merged booking data:", parsed);
                  } else {
                    console.warn("Could not extract booking data from Paystack metadata structure:", metadata);
                  }
                } else {
                  console.warn("No metadata found in payment transaction:", paymentData);
                }
              }
            } catch (error: any) {
              if (error.name === 'AbortError') {
                console.warn("Payment API request timed out, continuing with localStorage data");
              } else {
                console.error("Error fetching payment metadata:", error);
              }
              // Continue with localStorage data even if Paystack fetch fails
            }
          }
          
          // Validate and normalize the form data before submission
          // Ensure all required fields have proper defaults and are not null/undefined
          const bookingData: BookingFormData = {
            service: (parsed.service || "standard") as ServiceType,
            frequency: (parsed.frequency || "one-time") as FrequencyType,
            scheduledDate: (parsed.scheduledDate && typeof parsed.scheduledDate === "string" && parsed.scheduledDate.trim()) 
              ? parsed.scheduledDate.trim() 
              : (parsed.scheduledDate || null),
            scheduledTime: (parsed.scheduledTime && typeof parsed.scheduledTime === "string" && parsed.scheduledTime.trim()) 
              ? parsed.scheduledTime.trim() 
              : (parsed.scheduledTime || null),
            bedrooms: typeof parsed.bedrooms === "number" ? parsed.bedrooms : 0,
            bathrooms: typeof parsed.bathrooms === "number" && parsed.bathrooms >= 1 ? parsed.bathrooms : 1,
            extras: Array.isArray(parsed.extras) ? parsed.extras : [],
            streetAddress: parsed.streetAddress?.trim() || "",
            aptUnit: parsed.aptUnit?.trim() || undefined,
            suburb: parsed.suburb?.trim() || "",
            city: parsed.city?.trim() || "",
            cleanerPreference: normalizeCleanerPreference(parsed.cleanerPreference),
            specialInstructions: parsed.specialInstructions?.trim() || undefined,
            firstName: parsed.firstName?.trim() || "",
            lastName: parsed.lastName?.trim() || "",
            email: parsed.email?.trim() || "",
            phone: parsed.phone?.trim() || "",
            discountCode: parsed.discountCode?.trim() || undefined,
          };
              
              // Validate required fields before submitting
              const missingFields: string[] = [];
              if (!bookingData.service) missingFields.push("service");
              if (!bookingData.scheduledDate) missingFields.push("scheduledDate");
              if (!bookingData.scheduledTime) missingFields.push("scheduledTime");
              if (!bookingData.streetAddress?.trim()) missingFields.push("streetAddress");
              if (!bookingData.suburb?.trim()) missingFields.push("suburb");
              if (!bookingData.city?.trim()) missingFields.push("city");
              if (!bookingData.firstName?.trim()) missingFields.push("firstName");
              if (!bookingData.lastName?.trim()) missingFields.push("lastName");
              if (!bookingData.email?.trim()) missingFields.push("email");
              if (!bookingData.phone?.trim()) missingFields.push("phone");
              
              if (missingFields.length > 0) {
                console.error("Missing required fields:", missingFields);
                console.error("Data source:", dataSource);
                console.error("Parsed data:", parsed);
                console.error("Normalized booking data:", bookingData);
                
                // If address fields are missing, redirect to schedule page to complete them
                if (missingFields.some(field => ["streetAddress", "suburb", "city"].includes(field))) {
                  alert(`Please complete your address details to finish your booking. You will be redirected to complete this information.`);
                  // Redirect to schedule page to complete address
                  router.push(`/booking/service/${parsed.service || "standard"}/schedule`);
                  setLoading(false);
                  setSubmittingBooking(false);
                  return;
                }
                
                alert(`Missing required fields: ${missingFields.join(", ")}. Please try booking again.`);
                setLoading(false);
                setSubmittingBooking(false);
                return;
              }
              
              // Log normalized data before submission
              console.log("Submitting booking with normalized data:", bookingData);
              
              setSubmittingBooking(true);
              
              try {
                // Submit the booking with payment reference
                const result = await submitBooking(bookingData, paymentRef);
                
                if (result.success && result.bookingReference) {
                  // Booking created successfully, fetch it
                  try {
                    const fetchResponse = await fetch(`/api/bookings/${encodeURIComponent(result.bookingReference)}`);
                    if (fetchResponse.ok) {
                      const fetchData = await fetchResponse.json();
                      if (fetchData.success && fetchData.booking) {
                        const newBooking = fetchData.booking;
                        setBooking(newBooking);
                        
                        // Calculate price breakdown
                        try {
                          const { calculatePrice, fetchPricingConfig } = await import("@/lib/pricing");
                          const { validateDiscountCode } = await import("@/app/actions/discount");
                          const pricingConfig = await fetchPricingConfig();
                          
                          const initialPriceBreakdown = calculatePrice(newBooking, pricingConfig, 0);
                          
                          let discountCodeAmount = 0;
                          if (newBooking.discountCode && newBooking.discountCode.trim()) {
                            try {
                              const discountResult = await validateDiscountCode(
                                newBooking.discountCode.trim(),
                                initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
                              );
                              if (discountResult.success) {
                                discountCodeAmount = discountResult.discountAmount;
                              }
                            } catch (error) {
                              console.error("Error validating discount code:", error);
                            }
                          }
                          
                          const finalPriceBreakdown = calculatePrice(newBooking, pricingConfig, discountCodeAmount);
                          setPriceBreakdown(finalPriceBreakdown);
                        } catch (error) {
                          console.error("Error calculating price breakdown:", error);
                        }
                        
                        // Clear localStorage after successful booking
                        localStorage.removeItem("shalean_booking_data");
                        setLoading(false);
                        setSubmittingBooking(false);
                        return;
                      }
                    }
                    // If fetch failed but booking was created, use the form data to display
                    console.warn("Booking created but fetch failed, using form data");
                  } catch (fetchError) {
                    console.error("Error fetching created booking:", fetchError);
                    // Booking was created, so we'll fall through to use form data
                  }
                } else {
                  console.error("Failed to submit booking:", result.message);
                  console.error("Validation errors:", result.errors);
                  console.error("Submitted booking data:", bookingData);
                  
                  // Show detailed error to user
                  const errorDetails = result.errors 
                    ? Object.entries(result.errors).map(([field, message]) => `${field}: ${message}`).join("\n")
                    : result.message || "Unknown error";
                  alert(`Failed to create booking:\n\n${errorDetails}\n\nPlease contact support if this issue persists.`);
                }
              } catch (error) {
                console.error("Error submitting booking:", error);
              }
              setSubmittingBooking(false);
          }
        }

      // Fallback: Try to load booking from localStorage (for display purposes)
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("shalean_booking_data");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            
            // Calculate price breakdown (use pre-loaded config if available)
            const finalPriceBreakdown = await calculatePriceBreakdown(parsed);
            
            // Create a booking object for display
            const mockBooking: Partial<Booking> = {
              ...parsed,
              bookingReference: paymentRef || "PENDING",
              totalAmount: finalPriceBreakdown.total,
              paymentStatus: paymentRef ? "completed" : "pending",
              status: paymentRef ? "confirmed" : "pending",
              createdAt: new Date().toISOString(),
            };
            setBooking(mockBooking as Booking);
            setPriceBreakdown(finalPriceBreakdown);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing booking data:", error);
          }
        }
      }
      
      setLoading(false);
    };

    // Only load booking if we have a payment reference or can access localStorage
    if (paymentRef || typeof window !== "undefined") {
      loadBooking();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentRef]); // pricingConfig is intentionally excluded - we want to load booking immediately

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">
              We couldn't find your booking. Please contact support if you believe this is an error.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const address = booking.streetAddress
    ? `${booking.streetAddress}${booking.aptUnit ? `, ${booking.aptUnit}` : ""}, ${booking.suburb || ""}, ${booking.city || ""}`
    : "Not specified";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Shalean
              </span>
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
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Thank you for booking with Shalean Cleaning Services. Your booking has been confirmed and payment has been received.
            </p>
            {booking.bookingReference && (
              <div className="mt-4 inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="text-lg font-bold text-blue-600">{booking.bookingReference}</p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="font-medium text-gray-900">
                  {getServiceName(booking.service || "standard")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Frequency</p>
                <p className="font-medium text-gray-900">
                  {getFrequencyName(booking.frequency || "one-time")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule</p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.scheduledDate || null)}
                  {booking.scheduledTime && ` @ ${booking.scheduledTime}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Property</p>
                <p className="font-medium text-gray-900">
                  {booking.bedrooms || 0} bed, {booking.bathrooms || 1}{" "}
                  {booking.bathrooms === 1 ? "bath" : "baths"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Service Address</p>
                <p className="font-medium text-gray-900">{address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="font-medium text-gray-900">
                  {booking.firstName} {booking.lastName}
                </p>
                <p className="text-sm text-gray-600">{booking.email}</p>
                <p className="text-sm text-gray-600">{booking.phone}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {booking.totalAmount ? formatPrice(booking.totalAmount) : "N/A"}
                </p>
                <p className="text-xs text-green-600 mt-1">✓ Payment Confirmed</p>
                
                {/* Discount Information */}
                {priceBreakdown && (priceBreakdown.frequencyDiscount > 0 || priceBreakdown.discountCodeDiscount > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Discounts Applied</p>
                    {priceBreakdown.frequencyDiscount > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">
                            {getFrequencyName(booking.frequency || "one-time")} Discount
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            -{formatPrice(priceBreakdown.frequencyDiscount)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600">✓ Frequency Discount Applied</p>
                      </div>
                    )}
                    {priceBreakdown.discountCodeDiscount > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">
                            Discount Code {booking.discountCode ? `(${booking.discountCode.toUpperCase()})` : ""}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            -{formatPrice(priceBreakdown.discountCodeDiscount)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600">✓ Discount Code Applied</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a confirmation email to {booking.email} with all your booking details.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pre-Service Contact</h3>
                  <p className="text-gray-600 text-sm">
                    Our team will contact you before your scheduled service date to confirm details and answer any questions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Service Day</h3>
                  <p className="text-gray-600 text-sm">
                    Our professional cleaner will arrive at your scheduled time to provide exceptional service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Assistance?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or need to modify your booking, feel free to reach out to us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="mailto:hello@shalean.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  hello@shalean.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="tel:+27123456789" className="text-blue-600 hover:text-blue-700 font-medium">
                  +27 12 345 6789
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/dashboard");
                } else {
                  router.push("/auth/login");
                }
              }}
              disabled={authLoading}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              {authLoading ? "Loading..." : isAuthenticated ? "View Dashboard" : "Sign In"}
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center flex items-center justify-center gap-2"
            >
              Return to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/booking/service/${booking.service || "standard"}/details`}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center"
            >
              Book Another Service
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your email address with all the details of your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
