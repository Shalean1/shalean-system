"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  suburb?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Get all locations including inactive (admin)
export async function getAllLocations(): Promise<Location[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("service_locations")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all locations:", error);
    return [];
  }

  return data || [];
}

// Add a new location
export async function addLocation(
  name: string,
  city: string = "Cape Town",
  suburb?: string,
  slug?: string,
  display_order?: number
): Promise<{ success: boolean; error?: string; data?: Location }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Generate slug if not provided
  const finalSlug = slug?.trim() || generateSlug(name);

  // Check if slug already exists
  const { data: existingLocation } = await supabase
    .from("service_locations")
    .select("id")
    .eq("slug", finalSlug)
    .single();

  if (existingLocation) {
    return { success: false, error: "A location with this slug already exists" };
  }

  // Use provided display_order or get the highest display_order
  let finalDisplayOrder = display_order;
  if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
    const { data: maxOrderData } = await supabase
      .from("service_locations")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    finalDisplayOrder = (maxOrderData?.display_order || 0) + 1;
  }

  const { data, error } = await supabase
    .from("service_locations")
    .insert({
      name: name.trim(),
      slug: finalSlug,
      city: city.trim(),
      suburb: suburb?.trim() || null,
      display_order: finalDisplayOrder,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding location:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/locations");
  revalidatePath("/booking");
  revalidatePath("/service-areas");

  return { success: true, data };
}

// Update a location
export async function updateLocation(
  id: string,
  updates: Partial<Pick<Location, "name" | "slug" | "city" | "suburb" | "display_order" | "is_active">>
): Promise<{ success: boolean; error?: string; data?: Location }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // If slug is being updated, check if it conflicts with another location
  if (updates.slug) {
    const { data: existingLocation } = await supabase
      .from("service_locations")
      .select("id")
      .eq("slug", updates.slug.trim())
      .neq("id", id)
      .single();

    if (existingLocation) {
      return { success: false, error: "A location with this slug already exists" };
    }
  }

  // Prepare update object, trimming string fields
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name.trim();
  if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
  if (updates.city !== undefined) updateData.city = updates.city.trim();
  if (updates.suburb !== undefined) updateData.suburb = updates.suburb?.trim() || null;
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

  const { data, error } = await supabase
    .from("service_locations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating location:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/locations");
  revalidatePath("/booking");
  revalidatePath("/service-areas");

  return { success: true, data };
}

// Delete a location
export async function deleteLocation(
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
    .from("service_locations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting location:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/locations");
  revalidatePath("/booking");
  revalidatePath("/service-areas");

  return { success: true };
}

