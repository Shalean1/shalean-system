import { createClient } from "@/lib/supabase/server";

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "bank_account" | "other";
  name: string;
  lastFour?: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  type: "card" | "bank_account" | "other";
  name: string;
  lastFour?: string;
  brand?: string;
  expiryDate?: string;
  isDefault?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Get all payment methods for the current user
 */
export async function getUserPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    // If table doesn't exist (migration not applied), return empty array
    const errorCode = error.code || "";
    const errorMessage = error.message || error.details || error.hint || JSON.stringify(error) || "Unknown error";
    
    // Check for table not found errors (various possible error codes/messages)
    if (
      errorCode === "42P01" || 
      errorCode === "PGRST204" ||
      errorCode === "PGRST116" ||
      typeof errorMessage === "string" && (
        errorMessage.includes("does not exist") ||
        errorMessage.includes("relation") ||
        errorMessage.includes("table") ||
        errorMessage.includes("payment_methods") ||
        errorMessage.includes("relation \"public.payment_methods\"")
      )
    ) {
      console.warn("Payment methods table does not exist. Please run migration 009_payment_methods.sql");
      return [];
    }
    
    // Log full error details for debugging
    console.error("Error fetching payment methods:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      fullError: error,
    });
    
    throw new Error(`Failed to fetch payment methods: ${errorMessage}`);
  }

  return (data || []).map(mapDatabaseToPaymentMethod);
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(
  input: CreatePaymentMethodInput
): Promise<PaymentMethod> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create payment methods");
  }

  // If setting as default, ensure no other defaults exist (handled by trigger, but we can be explicit)
  if (input.isDefault) {
    // The database trigger will handle this, but we can also do it here for clarity
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: user.id,
      type: input.type,
      name: input.name,
      last_four: input.lastFour || null,
      brand: input.brand || null,
      expiry_date: input.expiryDate || null,
      is_default: input.isDefault || false,
      metadata: input.metadata || {},
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment method:", error);
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  return mapDatabaseToPaymentMethod(data);
}

/**
 * Update a payment method
 */
export async function updatePaymentMethod(
  id: string,
  updates: Partial<CreatePaymentMethodInput>
): Promise<PaymentMethod> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to update payment methods");
  }

  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.lastFour !== undefined) updateData.last_four = updates.lastFour;
  if (updates.brand !== undefined) updateData.brand = updates.brand;
  if (updates.expiryDate !== undefined) updateData.expiry_date = updates.expiryDate;
  if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

  const { data, error } = await supabase
    .from("payment_methods")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    // If table doesn't exist (migration not applied), throw helpful error
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      throw new Error("Payment methods table does not exist. Please run migration 009_payment_methods.sql");
    }
    console.error("Error updating payment method:", error);
    const errorMessage = error.message || error.details || "Unknown error";
    throw new Error(`Failed to update payment method: ${errorMessage}`);
  }

  if (!data) {
    throw new Error("Payment method not found or access denied");
  }

  return mapDatabaseToPaymentMethod(data);
}

/**
 * Delete a payment method (soft delete by setting is_active to false)
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to delete payment methods");
  }

  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    // If table doesn't exist (migration not applied), throw helpful error
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      throw new Error("Payment methods table does not exist. Please run migration 009_payment_methods.sql");
    }
    console.error("Error deleting payment method:", error);
    const errorMessage = error.message || error.details || "Unknown error";
    throw new Error(`Failed to delete payment method: ${errorMessage}`);
  }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  return updatePaymentMethod(id, { isDefault: true });
}

/**
 * Map database record to PaymentMethod type
 */
function mapDatabaseToPaymentMethod(data: any): PaymentMethod {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    name: data.name,
    lastFour: data.last_four,
    brand: data.brand,
    expiryDate: data.expiry_date,
    isDefault: data.is_default,
    metadata: data.metadata || {},
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}













