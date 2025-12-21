"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map database record to DiscountCode type
 */
function mapDatabaseToDiscountCode(data: any): DiscountCode {
  return {
    id: data.id,
    code: data.code,
    description: data.description,
    discountType: data.discount_type,
    discountValue: parseFloat(data.discount_value || 0),
    minimumOrderAmount: parseFloat(data.minimum_order_amount || 0),
    maximumDiscountAmount: data.maximum_discount_amount ? parseFloat(data.maximum_discount_amount) : null,
    validFrom: data.valid_from,
    validUntil: data.valid_until,
    usageLimit: data.usage_limit,
    usageCount: data.usage_count || 0,
    isActive: data.is_active ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all discount codes (admin access)
 */
export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discount codes:", error);
    throw new Error(`Failed to fetch discount codes: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToDiscountCode);
}

/**
 * Get discount code statistics
 */
export async function getDiscountCodeStats() {
  const supabase = createServiceRoleClient();
  
  const [totalResult, activeResult, expiredResult] = await Promise.all([
    // Total count
    supabase
      .from("discount_codes")
      .select("*", { count: "exact", head: true }),
    
    // Active count
    supabase
      .from("discount_codes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    
    // Expired count (valid_until < NOW())
    supabase
      .from("discount_codes")
      .select("*", { count: "exact", head: true })
      .not("valid_until", "is", null)
      .lt("valid_until", new Date().toISOString()),
  ]);

  // Calculate total usage
  const { data: usageData } = await supabase
    .from("discount_code_usage")
    .select("discount_amount", { count: "exact", head: true });

  return {
    total: totalResult.count || 0,
    active: activeResult.count || 0,
    expired: expiredResult.count || 0,
    totalUsage: usageData?.length || 0,
  };
}

export interface CreateDiscountCodeInput {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number | null;
  validFrom?: string;
  validUntil?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export interface CreateDiscountCodeResult {
  success: boolean;
  message: string;
  data?: DiscountCode;
}

/**
 * Create a new discount code (admin access)
 */
export async function createDiscountCode(
  input: CreateDiscountCodeInput
): Promise<CreateDiscountCodeResult> {
  const supabase = createServiceRoleClient();

  // Validate required fields
  if (!input.code || !input.code.trim()) {
    return {
      success: false,
      message: "Discount code is required",
    };
  }

  if (!input.discountType || !input.discountValue) {
    return {
      success: false,
      message: "Discount type and value are required",
    };
  }

  // Validate discount value
  if (input.discountType === "percentage" && (input.discountValue < 0 || input.discountValue > 100)) {
    return {
      success: false,
      message: "Percentage discount must be between 0 and 100",
    };
  }

  if (input.discountType === "fixed" && input.discountValue < 0) {
    return {
      success: false,
      message: "Fixed discount amount must be positive",
    };
  }

  try {
    // Handle date formatting - convert date string to ISO timestamp if provided
    let validFrom = new Date().toISOString();
    if (input.validFrom && input.validFrom.trim()) {
      // If it's a date string (YYYY-MM-DD), convert to ISO timestamp
      const date = new Date(input.validFrom);
      if (!isNaN(date.getTime())) {
        validFrom = date.toISOString();
      }
    }

    let validUntil: string | null = null;
    if (input.validUntil && input.validUntil.trim()) {
      const date = new Date(input.validUntil);
      if (!isNaN(date.getTime())) {
        validUntil = date.toISOString();
      }
    }

    const { data, error } = await supabase
      .from("discount_codes")
      .insert({
        code: input.code.trim().toUpperCase(),
        description: input.description || null,
        discount_type: input.discountType,
        discount_value: input.discountValue,
        minimum_order_amount: input.minimumOrderAmount || 0,
        maximum_discount_amount: input.maximumDiscountAmount || null,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: input.usageLimit || null,
        is_active: input.isActive !== undefined ? input.isActive : true,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return {
          success: false,
          message: "A discount code with this name already exists",
        };
      }
      console.error("Error creating discount code:", error);
      return {
        success: false,
        message: `Failed to create discount code: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Discount code created successfully",
      data: mapDatabaseToDiscountCode(data),
    };
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    return {
      success: false,
      message: `Failed to create discount code: ${error.message || "Unknown error"}`,
    };
  }
}
