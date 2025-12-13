"use client";

import { PriceBreakdown } from "@/lib/types/booking";
import { formatPrice, getServiceName, getFrequencyName } from "@/lib/pricing";
import { ServiceType, FrequencyType } from "@/lib/types/booking";

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
}: PriceSummaryProps) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Service</p>
          <p className="font-medium text-gray-900">{getServiceName(service)}</p>
        </div>

        {scheduledDate && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Schedule</p>
            <p className="font-medium text-gray-900">
              {formatDate(scheduledDate)}
              {scheduledTime && ` @ ${scheduledTime}`}
            </p>
          </div>
        )}

        {address && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <p className="font-medium text-gray-900 text-sm">{address}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-1">Property</p>
          <p className="font-medium text-gray-900">
            {bedrooms} bed, {bathrooms} {bathrooms === 1 ? "bath" : "baths"}
          </p>
        </div>

        {extras.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Extras</p>
            <p className="font-medium text-gray-900 text-sm">
              {extras.map((id) => extrasNames[id] || id).join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Price</span>
          <span className="font-medium text-gray-900">{formatPrice(priceBreakdown.basePrice)}</span>
        </div>

        {(bedrooms > 0 || bathrooms > 0) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Bedrooms & Bathrooms ({bedrooms} bed, {bathrooms} {bathrooms === 1 ? "bath" : "baths"})
            </span>
            <span className="font-medium text-gray-900">{formatPrice(priceBreakdown.roomPrice)}</span>
          </div>
        )}

        {priceBreakdown.extrasPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Extras</span>
            <span className="font-medium text-gray-900">{formatPrice(priceBreakdown.extrasPrice)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(priceBreakdown.subtotal)}</span>
        </div>

        {priceBreakdown.frequencyDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>
              {getFrequencyName(frequency)} Discount ({Math.round((priceBreakdown.frequencyDiscount / priceBreakdown.subtotal) * 100)}%)
            </span>
            <span className="font-medium">-{formatPrice(priceBreakdown.frequencyDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium text-gray-900">{formatPrice(priceBreakdown.serviceFee)}</span>
        </div>

        <div className="flex justify-between pt-2 border-t-2 border-gray-300">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">{formatPrice(priceBreakdown.total)}</span>
        </div>
      </div>
    </div>
  );
}
