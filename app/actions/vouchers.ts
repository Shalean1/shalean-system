"use server";

import { createClient } from "@/lib/supabase/server";

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string | null;
  voucher_type: "credit" | "discount_percentage" | "discount_fixed";
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  is_redeemed: boolean;
  redeemed_at: string | null;
  assigned_at: string;
  purchase_price?: number | null;
}

export interface PurchasableVoucher {
  id: string;
  code: string;
  title: string;
  description: string | null;
  voucher_type: "credit" | "discount_percentage" | "discount_fixed";
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  purchase_price: number;
}

export interface VoucherUsageHistory {
  id: string;
  voucher_code: string;
  voucher_type: string;
  value: number;
  booking_reference: string | null;
  order_total: number | null;
  discount_amount: number | null;
  redeemed_at: string;
}

export interface RedeemVoucherResult {
  success: boolean;
  message: string;
  credit_amount?: number;
}

export interface PurchaseVoucherResult {
  success: boolean;
  message: string;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
  user_voucher_id?: string;
}

/**
 * Get all vouchers assigned to the current user
 */
export async function getUserVouchers(): Promise<Voucher[]> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_vouchers")
      .select(`
        id,
        is_redeemed,
        redeemed_at,
        assigned_at,
        vouchers (
          id,
          code,
          title,
          description,
          voucher_type,
          value,
          minimum_order_amount,
          maximum_discount_amount,
          valid_from,
          valid_until,
          is_active
        )
      `)
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("Error fetching user vouchers:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data
      .filter((uv) => uv.vouchers && !Array.isArray(uv.vouchers))
      .map((uv) => {
        const voucher = Array.isArray(uv.vouchers) ? uv.vouchers[0] : uv.vouchers;
        if (!voucher) {
          return null;
        }
        return {
          id: voucher.id,
          code: voucher.code,
          title: voucher.title,
          description: voucher.description,
          voucher_type: voucher.voucher_type,
          value: Number(voucher.value),
          minimum_order_amount: Number(voucher.minimum_order_amount),
          maximum_discount_amount: voucher.maximum_discount_amount
            ? Number(voucher.maximum_discount_amount)
        : null,
          valid_from: voucher.valid_from,
          valid_until: voucher.valid_until,
          is_active: voucher.is_active,
      is_redeemed: uv.is_redeemed,
      redeemed_at: uv.redeemed_at,
      assigned_at: uv.assigned_at,
        };
      })
      .filter((v): v is Voucher => v !== null);
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return [];
  }
}

/**
 * Redeem a credit voucher (adds credits to user account)
 */
export async function redeemCreditVoucher(
  voucherCode: string
): Promise<RedeemVoucherResult> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to redeem vouchers",
      };
    }

    if (!voucherCode || !voucherCode.trim()) {
      return {
        success: false,
        message: "Please enter a voucher code",
      };
    }

    const { data, error } = await supabase.rpc("redeem_credit_voucher", {
      p_user_id: user.id,
      p_voucher_code: voucherCode.trim().toUpperCase(),
    });

    if (error) {
      console.error("Error redeeming voucher:", error);
      return {
        success: false,
        message: error.message || "Error redeeming voucher. Please try again.",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Invalid voucher code or voucher not found",
      };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      credit_amount: result.credit_amount ? Number(result.credit_amount) : undefined,
    };
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    return {
      success: false,
      message: "Error redeeming voucher. Please try again.",
    };
  }
}

/**
 * Get voucher usage history for the current user
 */
export async function getVoucherUsageHistory(): Promise<VoucherUsageHistory[]> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("voucher_usage_history")
      .select("*")
      .eq("user_id", user.id)
      .order("redeemed_at", { ascending: false });

    if (error) {
      // Log more detailed error information
      console.error("Error fetching voucher usage history:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
      // Return empty array instead of throwing - this allows the page to still render
      return [];
    }

    // If no data, return empty array (user has no history yet)
    if (!data) {
      return [];
    }

    return data.map((history) => ({
      id: history.id,
      voucher_code: history.voucher_code,
      voucher_type: history.voucher_type,
      value: Number(history.value),
      booking_reference: history.booking_reference,
      order_total: history.order_total ? Number(history.order_total) : null,
      discount_amount: history.discount_amount
        ? Number(history.discount_amount)
        : null,
      redeemed_at: history.redeemed_at,
    }));
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error fetching voucher usage history:", error);
    // Return empty array to prevent page crash
    return [];
  }
}

/**
 * Validate a discount voucher (for use during booking)
 */
export async function validateDiscountVoucher(
  voucherCode: string,
  orderTotal: number
): Promise<{
  success: boolean;
  discountAmount: number;
  voucherType: string | null;
  voucherValue: number | null;
  message: string;
}> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        discountAmount: 0,
        voucherType: null,
        voucherValue: null,
        message: "You must be logged in to use vouchers",
      };
    }

    if (!voucherCode || !voucherCode.trim()) {
      return {
        success: false,
        discountAmount: 0,
        voucherType: null,
        voucherValue: null,
        message: "Please enter a voucher code",
      };
    }

    const { data, error } = await supabase.rpc("validate_discount_voucher", {
      p_user_id: user.id,
      p_voucher_code: voucherCode.trim().toUpperCase(),
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error validating discount voucher:", error);
      return {
        success: false,
        discountAmount: 0,
        voucherType: null,
        voucherValue: null,
        message: error.message || "Error validating voucher. Please try again.",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        discountAmount: 0,
        voucherType: null,
        voucherValue: null,
        message: "Invalid or expired voucher code",
      };
    }

    const result = data[0];
    return {
      success: result.is_valid,
      discountAmount: Number(result.discount_amount) || 0,
      voucherType: result.voucher_type,
      voucherValue: result.voucher_value ? Number(result.voucher_value) : null,
      message: result.message || "",
    };
  } catch (error) {
    console.error("Error validating discount voucher:", error);
    return {
      success: false,
      discountAmount: 0,
      voucherType: null,
      voucherValue: null,
      message: "Error validating voucher. Please try again.",
    };
  }
}

/**
 * Record discount voucher usage after successful booking
 */
export async function recordDiscountVoucherUsage(
  voucherCode: string,
  bookingReference: string,
  discountAmount: number,
  orderTotal: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase.rpc("record_discount_voucher_usage", {
      p_user_id: user.id,
      p_voucher_code: voucherCode.trim().toUpperCase(),
      p_booking_reference: bookingReference,
      p_discount_amount: discountAmount,
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error recording discount voucher usage:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Error recording discount voucher usage:", error);
    return false;
  }
}

/**
 * Get all purchasable vouchers
 */
export async function getPurchasableVouchers(): Promise<PurchasableVoucher[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_purchasable_vouchers");

    if (error) {
      console.error("Error fetching purchasable vouchers:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((v: any) => ({
      id: v.id,
      code: v.code,
      title: v.title,
      description: v.description,
      voucher_type: v.voucher_type,
      value: Number(v.value),
      minimum_order_amount: Number(v.minimum_order_amount),
      maximum_discount_amount: v.maximum_discount_amount
        ? Number(v.maximum_discount_amount)
        : null,
      valid_from: v.valid_from,
      valid_until: v.valid_until,
      purchase_price: Number(v.purchase_price),
    }));
  } catch (error) {
    console.error("Error fetching purchasable vouchers:", error);
    return [];
  }
}

/**
 * Purchase a voucher (initialize payment)
 */
export async function purchaseVoucher(
  voucherId: string
): Promise<PurchaseVoucherResult> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to purchase vouchers",
      };
    }

    const email = user.email;
    if (!email) {
      return {
        success: false,
        message: "User email not found",
      };
    }

    // Get voucher details to check purchase price
    const { data: voucherData, error: voucherError } = await supabase
      .from("vouchers")
      .select("id, code, title, purchase_price, is_active, valid_from, valid_until")
      .eq("id", voucherId)
      .single();

    if (voucherError || !voucherData) {
      return {
        success: false,
        message: "Voucher not found",
      };
    }

    if (!voucherData.purchase_price || voucherData.purchase_price <= 0) {
      return {
        success: false,
        message: "This voucher is not available for purchase",
      };
    }

    if (!voucherData.is_active) {
      return {
        success: false,
        message: "This voucher is not active",
      };
    }

    // Check if voucher is expired
    if (
      voucherData.valid_until &&
      new Date(voucherData.valid_until) < new Date()
    ) {
      return {
        success: false,
        message: "This voucher has expired",
      };
    }

    // Check if user already has an unredeemed voucher of this type
    const { data: existingVoucher } = await supabase
      .from("user_vouchers")
      .select("id")
      .eq("user_id", user.id)
      .eq("voucher_id", voucherId)
      .eq("is_redeemed", false)
      .single();

    if (existingVoucher) {
      return {
        success: false,
        message: "You already have an unredeemed voucher of this type. Please redeem it before purchasing another.",
      };
    }

    // Generate payment reference
    const reference = `voucher-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const amountInCents = Number(voucherData.purchase_price) * 100;

    // Create pending purchase record
    const { error: pendingError } = await supabase
      .from("pending_voucher_purchases")
      .insert({
        user_id: user.id,
        voucher_id: voucherId,
        payment_reference: reference,
        amount: Number(voucherData.purchase_price),
        status: "pending",
      });

    if (pendingError) {
      console.error("Error creating pending purchase:", pendingError);
      return {
        success: false,
        message: "Failed to create purchase record. Please try again.",
      };
    }

    // Initialize payment
    if (!process.env.PAYSTACK_PUBLIC_KEY) {
      return {
        success: false,
        message: "Payment gateway is not configured",
      };
    }

    return {
      success: true,
      message: "Payment initialized",
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      amount: amountInCents,
      email: email,
      reference: reference,
    };
  } catch (error) {
    console.error("Error purchasing voucher:", error);
    return {
      success: false,
      message: "Error purchasing voucher. Please try again.",
    };
  }
}

/**
 * Complete voucher purchase after payment verification
 * Note: This function requires user authentication and should be used from client-side
 * For webhook use, the webhook handler calls the database function directly
 */
export async function completeVoucherPurchase(
  voucherId: string,
  paymentReference: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { data, error } = await supabase.rpc("purchase_voucher", {
      p_user_id: user.id,
      p_voucher_id: voucherId,
      p_payment_reference: paymentReference,
    });

    if (error) {
      console.error("Error completing voucher purchase:", error);
      return {
        success: false,
        message: error.message || "Error completing voucher purchase",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Failed to complete voucher purchase",
      };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("Error completing voucher purchase:", error);
    return {
      success: false,
      message: "Error completing voucher purchase. Please try again.",
    };
  }
}

/**
 * Check pending voucher purchases for the current user
 * Useful for debugging purchase issues
 */
export async function getPendingVoucherPurchases(): Promise<Array<{
  id: string;
  voucher_id: string;
  payment_reference: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}>> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("pending_voucher_purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending purchases:", error);
      return [];
    }

    return (data || []).map((purchase) => ({
      id: purchase.id,
      voucher_id: purchase.voucher_id,
      payment_reference: purchase.payment_reference,
      amount: Number(purchase.amount),
      status: purchase.status,
      created_at: purchase.created_at,
      updated_at: purchase.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching pending purchases:", error);
    return [];
  }
}
