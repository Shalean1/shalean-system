"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PopularService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price?: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get top 5 most booked service types from bookings table
async function getTopBookedServiceTypes(limit: number = 5): Promise<string[]> {
  const supabase = await createClient();
  
  // Count bookings by service_type and get top N
  const { data, error } = await supabase
    .from("bookings")
    .select("service_type")
    .not("service_type", "is", null);

  if (error) {
    console.error("Error fetching booking counts:", error);
    return [];
  }

  // Count occurrences of each service_type
  const counts: Record<string, number> = {};
  data?.forEach((booking) => {
    const serviceType = booking.service_type;
    if (serviceType) {
      counts[serviceType] = (counts[serviceType] || 0) + 1;
    }
  });

  // Sort by count (descending) and get top N
  const topServiceTypes = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([serviceType]) => serviceType);

  return topServiceTypes;
}

// Map booking service_type to popular_services slug
function mapServiceTypeToSlug(serviceType: string): string {
  const mapping: Record<string, string> = {
    "deep": "deep-cleaning",
    "move-in-out": "move-in-cleaning", // or "move-out-cleaning"
    "office": "office-cleaning",
    "holiday": "holiday-cleaning",
    "airbnb": "airbnb-cleaning",
    "standard": "standard-cleaning",
  };
  return mapping[serviceType] || serviceType;
}

// Get all active popular services (public)
export async function getPopularServices(): Promise<PopularService[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("popular_services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching popular services:", error);
    return [];
  }

  return data || [];
}

// Get top 5 most booked popular services
export async function getTopBookedPopularServices(limit: number = 5): Promise<PopularService[]> {
  const supabase = await createClient();
  
  // Get top booked service types
  const topServiceTypes = await getTopBookedServiceTypes(limit * 2); // Get more to account for missing mappings
  
  // Get all active popular services
  const { data: allServices, error } = await supabase
    .from("popular_services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching popular services:", error);
    return [];
  }

  if (!allServices || allServices.length === 0) {
    return [];
  }

  // Create a map of slug to service for quick lookup
  const serviceMap = new Map(allServices.map((s) => [s.slug, s]));
  
  // Also create a reverse map: service_type -> possible slugs
  const serviceTypeToSlugs: Record<string, string[]> = {
    "deep": ["deep-cleaning"],
    "move-in-out": ["move-in-cleaning", "move-out-cleaning"],
    "office": ["office-cleaning"],
    "holiday": ["holiday-cleaning"],
    "airbnb": ["airbnb-cleaning"],
    "standard": ["standard-cleaning"],
    "carpet-cleaning": ["carpet-cleaning"],
  };

  // Filter to only services that match top booked types, maintaining order by booking count
  const topBookedServices: PopularService[] = [];
  const usedIds = new Set<string>();

  // Add services in order of booking popularity
  for (const serviceType of topServiceTypes) {
    if (topBookedServices.length >= limit) break;
    
    const possibleSlugs = serviceTypeToSlugs[serviceType] || [mapServiceTypeToSlug(serviceType)];
    
    for (const slug of possibleSlugs) {
      const service = serviceMap.get(slug);
      if (service && !usedIds.has(service.id)) {
        topBookedServices.push(service);
        usedIds.add(service.id);
        break; // Found a match, move to next service type
      }
    }
  }

  // If we have fewer than limit, fill with remaining services ordered by display_order
  if (topBookedServices.length < limit) {
    const remaining = allServices
      .filter((s) => !usedIds.has(s.id))
      .slice(0, limit - topBookedServices.length);
    topBookedServices.push(...remaining);
  }

  // Return only the top N
  return topBookedServices.slice(0, limit);
}

// Get all popular services including inactive (admin)
export async function getAllPopularServices(): Promise<PopularService[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("popular_services")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching all popular services:", error);
    return [];
  }

  return data || [];
}

// Add a new popular service
export async function addPopularService(
  name: string,
  slug: string,
  description?: string,
  base_price?: number
): Promise<{ success: boolean; error?: string; data?: PopularService }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get the highest display_order
  const { data: maxOrderData } = await supabase
    .from("popular_services")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.display_order || 0) + 1;

  const { data, error } = await supabase
    .from("popular_services")
    .insert({
      name,
      slug,
      description,
      base_price: base_price !== undefined && base_price !== null ? base_price : null,
      display_order: nextOrder,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding popular service:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/pricing");

  return { success: true, data };
}

// Update a popular service
export async function updatePopularService(
  id: string,
  updates: Partial<Pick<PopularService, "name" | "slug" | "description" | "base_price" | "display_order" | "is_active">>
): Promise<{ success: boolean; error?: string; data?: PopularService }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("popular_services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating popular service:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/pricing");

  return { success: true, data };
}

// Delete a popular service
export async function deletePopularService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("popular_services")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting popular service:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/pricing");

  return { success: true };
}

// Reorder popular services
export async function reorderPopularServices(
  services: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Update each service's display_order
  const updates = services.map((service) =>
    supabase
      .from("popular_services")
      .update({ display_order: service.display_order })
      .eq("id", service.id)
  );

  try {
    await Promise.all(updates);
    revalidatePath("/");
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    console.error("Error reordering popular services:", error);
    return { success: false, error: "Failed to reorder services" };
  }
}
