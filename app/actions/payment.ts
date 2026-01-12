"use server";

import { BookingFormData } from "@/lib/types/booking";
import { calculatePrice } from "@/lib/pricing";
import { fetchPricingConfig } from "@/lib/pricing-server";
import { validateDiscountCode } from "@/app/actions/discount";
import { calculateRecurringDates } from "@/lib/utils/recurring-bookings";

export interface PaymentInitResult {
  success: boolean;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
  message?: string;
}

/**
 * Initialize payment with a fixed amount (for rebook scenarios)
 * This bypasses price calculation and uses the provided amount directly
 */
export async function initializePaymentWithAmount(
  amount: number,
  email: string
): Promise<PaymentInitResult> {
  if (!process.env.PAYSTACK_PUBLIC_KEY) {
    return {
      success: false,
      message: "Payment gateway is not configured",
    };
  }

  try {
    // Generate payment reference
    const reference = `bokkie-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    // ZAR amounts are multiplied by 100 to convert to cents
    // Round to ensure we have a valid integer (Paystack requirement)
    const amountInCents = Math.round(amount * 100);

    return {
      success: true,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      amount: amountInCents,
      email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}

/**
 * Initialize payment and return Paystack configuration
 */
export async function initializePayment(
  bookingData: BookingFormData,
  email: string
): Promise<PaymentInitResult> {
  if (!process.env.PAYSTACK_PUBLIC_KEY) {
    return {
      success: false,
      message: "Payment gateway is not configured",
    };
  }

  try {
    // Fetch pricing configuration from database
    const pricingConfig = await fetchPricingConfig();
    
    // Calculate initial price breakdown (without discount code)
    const initialPriceBreakdown = calculatePrice(bookingData, pricingConfig, 0);
    
    // Validate and apply discount code if provided
    let discountCodeAmount = 0;
    if (bookingData.discountCode && bookingData.discountCode.trim()) {
      const discountResult = await validateDiscountCode(
        bookingData.discountCode.trim(),
        initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
      );
      
      if (discountResult.success) {
        discountCodeAmount = discountResult.discountAmount;
      }
      // If discount code is invalid, we still proceed but without discount
      // The booking submission will handle the error
    }
    
    // Calculate final price breakdown with discount code
    const priceBreakdown = calculatePrice(bookingData, pricingConfig, discountCodeAmount);
    
    // For recurring bookings, calculate total for all bookings in the current month
    let totalAmount = priceBreakdown.total;
    const isRecurring = bookingData.frequency !== "one-time";
    
    if (isRecurring && bookingData.scheduledDate) {
      // Calculate all booking dates in the current month
      const recurringDates = calculateRecurringDates(
        bookingData.frequency,
        bookingData.scheduledDate,
        1 // Only current month
      );
      
      // Multiply single booking price by number of bookings in the month
      const numberOfBookings = recurringDates.length;
      totalAmount = priceBreakdown.total * numberOfBookings;
    }
    
    // Generate payment reference
    const reference = `bokkie-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    // ZAR amounts are multiplied by 100 to convert to cents
    // Round to ensure we have a valid integer (Paystack requirement)
    const amountInCents = Math.round(totalAmount * 100);

    return {
      success: true,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      amount: amountInCents,
      email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}
