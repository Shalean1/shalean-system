export type ServiceType = "standard" | "deep" | "move-in-out" | "airbnb";

export type FrequencyType = "one-time" | "weekly" | "bi-weekly" | "monthly";

export type CleanerPreference = "no-preference" | "natasha-m" | "estery-p" | "beaul";

export interface BookingFormData {
  // Step 1: Service & Details
  service: ServiceType;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  scheduledDate: string | null;
  scheduledTime: string | null;
  specialInstructions?: string;

  // Step 2: Schedule & Cleaner
  streetAddress: string;
  aptUnit?: string;
  suburb: string;
  city: string;
  cleanerPreference: CleanerPreference;
  frequency: FrequencyType;

  // Step 3: Contact & Review
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  discountCode?: string;
}

export interface Booking extends BookingFormData {
  id: string;
  bookingReference: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentReference?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface PriceBreakdown {
  basePrice: number;
  roomPrice: number;
  extrasPrice: number;
  subtotal: number;
  frequencyDiscount: number;
  discountCodeDiscount: number;
  serviceFee: number;
  total: number;
}
