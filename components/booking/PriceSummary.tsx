"use client";

import { useState, useEffect } from "react";
import { PriceBreakdown } from "@/lib/types/booking";
import { formatPrice, getServiceName, getFrequencyName } from "@/lib/pricing";
import { ServiceType, FrequencyType, CleanerPreference } from "@/lib/types/booking";

interface Cleaner {
  id: CleanerPreference;
  name: string;
  rating?: number;
}

interface PriceSummaryProps {
  service: ServiceType;
  frequency: FrequencyType;
  priceBreakdown: PriceBreakdown;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  scheduledDate: string | null;
  scheduledTime: string | null;
  address?: string;
  cleanerPreference?: CleanerPreference;
  cleaners?: Cleaner[];
  // Carpet cleaning specific fields
  fittedRoomsCount?: number;
  looseCarpetsCount?: number;
  roomsFurnitureStatus?: 'furnished' | 'empty';
  // Office cleaning specific fields
  officeSize?: 'small' | 'medium' | 'large';
}

export default function PriceSummary({
  service,
  frequency,
  priceBreakdown,
  bedrooms,
  bathrooms,
  extras,
  scheduledDate,
  scheduledTime,
  address,
  cleanerPreference,
  cleaners,
  fittedRoomsCount,
  looseCarpetsCount,
  roomsFurnitureStatus,
  officeSize,
}: PriceSummaryProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const extrasNames: Record<string, string> = {
    "inside-fridge": "Inside Fridge",
    "inside-oven": "Inside Oven",
    "inside-cabinets": "Inside Cabinets",
    "interior-windows": "Interior Windows",
    "interior-walls": "Interior Walls",
    "laundry": "Laundry & Ironing",
    "ironing": "Laundry & Ironing",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not selected";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get selected cleaner name
  const getSelectedCleanerName = (): string | null => {
    if (!cleanerPreference || !cleaners || cleaners.length === 0) {
      return null;
    }
    const selectedCleaner = cleaners.find((c) => c.id === cleanerPreference);
    return selectedCleaner?.name || null;
  };

  const selectedCleanerName = getSelectedCleanerName();
  const isCarpetCleaning = service === "carpet-cleaning";
  const isOffice = service === "office";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Service</p>
          <p className="font-medium text-gray-900">{getServiceName(service)}</p>
        </div>

        {isMounted && scheduledDate && (
          <div suppressHydrationWarning>
            <p className="text-sm text-gray-600 mb-1">Schedule</p>
            <p className="font-medium text-gray-900">
              {formatDate(scheduledDate)}
              {scheduledTime && ` @ ${scheduledTime}`}
            </p>
          </div>
        )}

        {isMounted && address && (
          <div suppressHydrationWarning>
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <p className="font-medium text-gray-900 text-sm">{address}</p>
          </div>
        )}

        {/* Show carpet cleaning details for carpet-cleaning service */}
        {isCarpetCleaning ? (
          <>
            {(fittedRoomsCount && fittedRoomsCount > 0) && (
              <div suppressHydrationWarning>
                <p className="text-sm text-gray-600 mb-1">Fitted Carpets</p>
                <p className="font-medium text-gray-900">
                  {fittedRoomsCount} {fittedRoomsCount === 1 ? "Room" : "Rooms"}
                </p>
              </div>
            )}
            {(looseCarpetsCount && looseCarpetsCount > 0) && (
              <div suppressHydrationWarning>
                <p className="text-sm text-gray-600 mb-1">Loose Carpets</p>
                <p className="font-medium text-gray-900">
                  {looseCarpetsCount} {looseCarpetsCount === 1 ? "Carpet" : "Carpets"}
                </p>
              </div>
            )}
            {roomsFurnitureStatus && (
              <div suppressHydrationWarning>
                <p className="text-sm text-gray-600 mb-1">Furniture Status</p>
                <p className="font-medium text-gray-900">
                  {roomsFurnitureStatus === 'furnished' ? 'Rooms have furniture inside' : 'Empty rooms'}
                </p>
              </div>
            )}
          </>
        ) : isOffice ? (
          /* Show office details for office service */
          officeSize && ['small', 'medium', 'large'].includes(officeSize) ? (
            <div suppressHydrationWarning>
              <p className="text-sm text-gray-600 mb-1">Office</p>
              <p className="font-medium text-gray-900">
                {officeSize.charAt(0).toUpperCase() + officeSize.slice(1)} office, {bathrooms} {bathrooms === 1 ? "bathroom" : "bathrooms"}
              </p>
            </div>
          ) : null
        ) : (
          /* Show property details for other services (not office, not carpet-cleaning) */
          <div suppressHydrationWarning>
            <p className="text-sm text-gray-600 mb-1">Property</p>
            <p className="font-medium text-gray-900">
              {bedrooms} bed, {bathrooms} {bathrooms === 1 ? "bath" : "baths"}
            </p>
          </div>
        )}

        {extras.length > 0 && (
          <div suppressHydrationWarning>
            <p className="text-sm text-gray-600 mb-1">Extras</p>
            <p className="font-medium text-gray-900 text-sm">
              {extras.map((id) => extrasNames[id] || id).join(", ")}
            </p>
          </div>
        )}

        {isMounted && selectedCleanerName && (
          <div suppressHydrationWarning>
            <p className="text-sm text-gray-600 mb-1">
              {cleanerPreference && cleanerPreference.startsWith('team-') ? 'Team' : 'Cleaner'}
            </p>
            <p className="font-medium text-gray-900">{selectedCleanerName}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Price</span>
          <span className="font-medium text-gray-900" suppressHydrationWarning>
            {isMounted ? formatPrice(priceBreakdown.basePrice) : `R ${priceBreakdown.basePrice.toFixed(2)}`}
          </span>
        </div>

        {/* Show carpet cleaning pricing breakdown for carpet-cleaning service */}
        {isCarpetCleaning ? (
          <>
            {(fittedRoomsCount && fittedRoomsCount > 0) && priceBreakdown.roomPrice > 0 && (
              <div className="flex justify-between text-sm" suppressHydrationWarning>
                <span className="text-gray-600">
                  Fitted Carpets ({fittedRoomsCount} {fittedRoomsCount === 1 ? "Room" : "Rooms"})
                </span>
                <span className="font-medium text-gray-900" suppressHydrationWarning>
                  {isMounted ? formatPrice(priceBreakdown.roomPrice) : `R ${priceBreakdown.roomPrice.toFixed(2)}`}
                </span>
              </div>
            )}
            {(looseCarpetsCount && looseCarpetsCount > 0) && priceBreakdown.extrasPrice > 0 && (
              <div className="flex justify-between text-sm" suppressHydrationWarning>
                <span className="text-gray-600">
                  Loose Carpets ({looseCarpetsCount} {looseCarpetsCount === 1 ? "Carpet" : "Carpets"})
                </span>
                <span className="font-medium text-gray-900" suppressHydrationWarning>
                  {isMounted ? formatPrice(priceBreakdown.extrasPrice) : `R ${priceBreakdown.extrasPrice.toFixed(2)}`}
                </span>
              </div>
            )}
            {priceBreakdown.furnitureFee && priceBreakdown.furnitureFee > 0 && (
              <div className="flex justify-between text-sm" suppressHydrationWarning>
                <span className="text-gray-600">Furniture Fee</span>
                <span className="font-medium text-gray-900" suppressHydrationWarning>
                  {isMounted ? formatPrice(priceBreakdown.furnitureFee) : `R ${priceBreakdown.furnitureFee.toFixed(2)}`}
                </span>
              </div>
            )}
          </>
        ) : isOffice ? (
          /* Show office pricing for office service */
          officeSize && ['small', 'medium', 'large'].includes(officeSize) && priceBreakdown.roomPrice > 0 ? (
            <div className="flex justify-between text-sm" suppressHydrationWarning>
              <span className="text-gray-600">
                Office Size & Bathrooms ({officeSize.charAt(0).toUpperCase() + officeSize.slice(1)} office, {bathrooms} {bathrooms === 1 ? "bathroom" : "bathrooms"})
              </span>
              <span className="font-medium text-gray-900" suppressHydrationWarning>
                {isMounted ? formatPrice(priceBreakdown.roomPrice) : `R ${priceBreakdown.roomPrice.toFixed(2)}`}
              </span>
            </div>
          ) : null
        ) : (
          /* Show room pricing for other services (not office, not carpet-cleaning) */
          (bedrooms > 0 || bathrooms > 0) && (
            <div className="flex justify-between text-sm" suppressHydrationWarning>
              <span className="text-gray-600">
                Bedrooms & Bathrooms ({bedrooms} bed, {bathrooms} {bathrooms === 1 ? "bath" : "baths"})
              </span>
              <span className="font-medium text-gray-900" suppressHydrationWarning>
                {isMounted ? formatPrice(priceBreakdown.roomPrice) : `R ${priceBreakdown.roomPrice.toFixed(2)}`}
              </span>
            </div>
          )
        )}

        {/* Show extras only for non-carpet-cleaning services */}
        {!isCarpetCleaning && priceBreakdown.extrasPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Extras</span>
            <span className="font-medium text-gray-900" suppressHydrationWarning>
              {isMounted ? formatPrice(priceBreakdown.extrasPrice) : `R ${priceBreakdown.extrasPrice.toFixed(2)}`}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900" suppressHydrationWarning>
            {isMounted ? formatPrice(priceBreakdown.subtotal) : `R ${priceBreakdown.subtotal.toFixed(2)}`}
          </span>
        </div>

        {priceBreakdown.frequencyDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>
              {getFrequencyName(frequency)} Discount ({Math.round((priceBreakdown.frequencyDiscount / priceBreakdown.subtotal) * 100)}%)
            </span>
            <span className="font-medium" suppressHydrationWarning>
              -{isMounted ? formatPrice(priceBreakdown.frequencyDiscount) : `R ${priceBreakdown.frequencyDiscount.toFixed(2)}`}
            </span>
          </div>
        )}

        {priceBreakdown.discountCodeDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount Code</span>
            <span className="font-medium" suppressHydrationWarning>
              -{isMounted ? formatPrice(priceBreakdown.discountCodeDiscount) : `R ${priceBreakdown.discountCodeDiscount.toFixed(2)}`}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium text-gray-900" suppressHydrationWarning>
            {isMounted ? formatPrice(priceBreakdown.serviceFee) : `R ${priceBreakdown.serviceFee.toFixed(2)}`}
          </span>
        </div>

        {priceBreakdown.tip > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Tip</span>
            <span className="font-medium" suppressHydrationWarning>
              {isMounted ? formatPrice(priceBreakdown.tip) : `R ${priceBreakdown.tip.toFixed(2)}`}
            </span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t-2 border-gray-300">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600" suppressHydrationWarning>
            {isMounted ? formatPrice(priceBreakdown.total) : `R ${priceBreakdown.total.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
