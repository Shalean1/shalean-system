"use server";

import { createClient } from "@/lib/supabase/server";

export interface DiscountCodeValidationResult {
  success: boolean;
  discountAmount: number;
  discountType: string | null;
  discountValue: number | null;
  message: string;
}

/**
 * Validate a discount code
 */
export async function validateDiscountCode(
  code: string,
  orderTotal: number
): Promise<DiscountCodeValidationResult> {
  if (!code || !code.trim()) {
    return {
      success: false,
      discountAmount: 0,
      discountType: null,
      discountValue: null,
      message: "Please enter a discount code",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("validate_discount_code", {
      p_code: code.trim().toUpperCase(),
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error validating discount code:", error);
      return {
        success: false,
        discountAmount: 0,
        discountType: null,
        discountValue: null,
        message: "Error validating discount code. Please try again.",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        discountAmount: 0,
        discountType: null,
        discountValue: null,
        message: "Invalid or expired discount code",
      };
    }

    const result = data[0];
    return {
      success: result.is_valid,
      discountAmount: Number(result.discount_amount) || 0,
      discountType: result.discount_type,
      discountValue: result.discount_value ? Number(result.discount_value) : null,
      message: result.message || "",
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return {
      success: false,
      discountAmount: 0,
      discountType: null,
      discountValue: null,
      message: "Error validating discount code. Please try again.",
    };
  }
}

/**
 * Record discount code usage after successful booking
 */
export async function recordDiscountCodeUsage(
  code: string,
  bookingReference: string,
  userEmail: string,
  discountAmount: number,
  orderTotal: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("record_discount_code_usage", {
      p_code: code.trim().toUpperCase(),
      p_booking_reference: bookingReference,
      p_user_email: userEmail,
      p_discount_amount: discountAmount,
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error recording discount code usage:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Error recording discount code usage:", error);
    return false;
  }
}














