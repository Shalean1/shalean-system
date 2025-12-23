"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CleanerFull } from "@/app/actions/admin-bookings";

export interface CleanerInput {
  cleaner_id: string;
  name: string;
  bio?: string;
  rating?: number;
  total_jobs?: number;
  avatar_url?: string;
  display_order?: number;
  is_active?: boolean;
  is_available?: boolean;
  availability_days?: string[];
}

// Add a new cleaner
export async function addCleaner(
  input: CleanerInput
): Promise<{ success: boolean; error?: string; data?: CleanerFull }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get the highest display_order if not provided
  let displayOrder = input.display_order;
  if (displayOrder === undefined) {
    const { data: maxOrderData } = await supabase
      .from("cleaners")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    displayOrder = (maxOrderData?.display_order || 0) + 1;
  }

  const { data, error } = await supabase
    .from("cleaners")
    .insert({
      cleaner_id: input.cleaner_id,
      name: input.name,
      bio: input.bio || null,
      rating: input.rating !== undefined ? input.rating : null,
      total_jobs: input.total_jobs || 0,
      avatar_url: input.avatar_url || null,
      display_order: displayOrder,
      is_active: input.is_active ?? true,
      is_available: input.is_available ?? true,
      availability_days: input.availability_days && input.availability_days.length > 0 ? input.availability_days : [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding cleaner:", error);
    // Handle unique constraint violation
    if (error.code === "23505") {
      return { success: false, error: "A cleaner with this ID already exists" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cleaners");
  revalidatePath("/");

  // Map database record to CleanerFull format
  const cleaner: CleanerFull = {
    id: data.id,
    cleanerId: data.cleaner_id,
    name: data.name,
    bio: data.bio,
    rating: data.rating ? parseFloat(data.rating) : null,
    totalJobs: data.total_jobs || 0,
    avatarUrl: data.avatar_url,
    displayOrder: data.display_order || 0,
    isActive: data.is_active ?? true,
    isAvailable: data.is_available ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return { success: true, data: cleaner };
}

// Update an existing cleaner
export async function updateCleaner(
  id: string,
  updates: Partial<CleanerInput>
): Promise<{ success: boolean; error?: string; data?: CleanerFull }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Prepare update object, only including defined fields
  const updateData: any = {};
  if (updates.cleaner_id !== undefined) updateData.cleaner_id = updates.cleaner_id;
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.bio !== undefined) updateData.bio = updates.bio || null;
  if (updates.rating !== undefined) updateData.rating = updates.rating !== null ? updates.rating : null;
  if (updates.total_jobs !== undefined) updateData.total_jobs = updates.total_jobs;
  if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url || null;
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
  if (updates.is_available !== undefined) updateData.is_available = updates.is_available;
  if (updates.availability_days !== undefined) updateData.availability_days = updates.availability_days && updates.availability_days.length > 0 ? updates.availability_days : [];

  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("cleaners")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cleaner:", error);
    // Handle unique constraint violation
    if (error.code === "23505") {
      return { success: false, error: "A cleaner with this ID already exists" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cleaners");
  revalidatePath("/");

  // Map database record to CleanerFull format
  const cleaner: CleanerFull = {
    id: data.id,
    cleanerId: data.cleaner_id,
    name: data.name,
    bio: data.bio,
    rating: data.rating ? parseFloat(data.rating) : null,
    totalJobs: data.total_jobs || 0,
    avatarUrl: data.avatar_url,
    displayOrder: data.display_order || 0,
    isActive: data.is_active ?? true,
    isAvailable: data.is_available ?? true,
    availabilityDays: data.availability_days ? (Array.isArray(data.availability_days) ? data.availability_days : []) : [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return { success: true, data: cleaner };
}

// Delete a cleaner
export async function deleteCleaner(
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

  // Get cleaner_id before deletion to check for references
  // assigned_cleaner_id in bookings references cleaners(cleaner_id) TEXT field, not UUID id
  const { data: cleanerData, error: fetchError } = await supabase
    .from("cleaners")
    .select("cleaner_id")
    .eq("id", id)
    .single();

  if (fetchError || !cleanerData) {
    return {
      success: false,
      error: "Cleaner not found",
    };
  }

  // Check bookings table for cleaner_id references
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id")
    .eq("assigned_cleaner_id", cleanerData.cleaner_id)
    .limit(1);

  if (bookingsError) {
    console.error("Error checking bookings:", bookingsError);
    // Continue with deletion attempt even if check fails
  }

  if (bookings && bookings.length > 0) {
    return {
      success: false,
      error: "Cannot delete cleaner with assigned bookings. Please reassign bookings first.",
    };
  }

  const { error } = await supabase.from("cleaners").delete().eq("id", id);

  if (error) {
    console.error("Error deleting cleaner:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cleaners");
  revalidatePath("/");

  return { success: true };
}

