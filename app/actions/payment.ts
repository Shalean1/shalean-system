"use server";

import { BookingFormData } from "@/lib/types/booking";
import { calculatePrice } from "@/lib/pricing";

export interface PaymentInitResult {
  success: boolean;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
  message?: string;
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
    // Calculate total amount
    const priceBreakdown = calculatePrice(bookingData);
    
    // Generate payment reference
    const reference = `shalean-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    // ZAR amounts are multiplied by 100 to convert to cents
    const amountInCents = priceBreakdown.total * 100;

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
