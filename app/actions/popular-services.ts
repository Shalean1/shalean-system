"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PopularService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  description?: string
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
  revalidatePath("/admin/popular-services");

  return { success: true, data };
}

// Update a popular service
export async function updatePopularService(
  id: string,
  updates: Partial<Pick<PopularService, "name" | "slug" | "description" | "display_order" | "is_active">>
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
  revalidatePath("/admin/popular-services");

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
  revalidatePath("/admin/popular-services");

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
    revalidatePath("/admin/popular-services");
    return { success: true };
  } catch (error) {
    console.error("Error reordering popular services:", error);
    return { success: false, error: "Failed to reorder services" };
  }
}
