"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export interface Quote {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  customLocation?: string | null;
  service: string | null;
  bedrooms: number;
  bathrooms: number;
  additionalServices: string[];
  note?: string | null;
  status: "pending" | "contacted" | "converted" | "declined";
  createdAt: string;
  updatedAt: string;
}

/**
 * Map database record to Quote type
 */
function mapDatabaseToQuote(data: any): Quote {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    customLocation: data.custom_location,
    service: data.service_type || data.service, // Support both old and new column names
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 1,
    additionalServices: data.extras || data.additional_services || [], // Support both old and new column names
    note: data.notes || data.note, // Support both old and new column names
    status: data.status || "pending",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all quotes (admin access)
 */
export async function getAllQuotes(): Promise<Quote[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all quotes:", error);
    throw new Error(`Failed to fetch quotes: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToQuote);
}

/**
 * Get quote statistics
 */
export async function getQuoteStats() {
  const supabase = createServiceRoleClient();
  
  const [totalResult, statusResult] = await Promise.all([
    // Total count
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true }),
    
    // Count by status
    supabase
      .from("quotes")
      .select("status"),
  ]);

  // Count by status
  const byStatus: Record<string, number> = {};
  (statusResult.data || []).forEach((quote) => {
    const status = quote.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return {
    total: totalResult.count || 0,
    byStatus,
  };
}

/**
 * Get quote by ID (admin access)
 */
export async function getQuoteById(id: string): Promise<Quote | null> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }

  return data ? mapDatabaseToQuote(data) : null;
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
  id: string,
  status: Quote["status"]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("quotes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating quote status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
