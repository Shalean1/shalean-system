import { createClient } from "@/lib/supabase/server";
import { Cleaner } from "@/lib/supabase/booking-data";

/**
 * Get cleaners who were previously booked by the current user
 * Only includes cleaners from completed bookings
 */
export async function getPreviouslyBookedCleaners(): Promise<Cleaner[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return [];
  }

  try {
    // First, get all completed bookings for this user to check what we have
    const { data: allCompletedBookings, error: allBookingsError } = await supabase
      .from("bookings")
      .select("cleaner_preference, status, contact_email, booking_reference")
      .eq("contact_email", user.email)
      .eq("status", "completed");

    if (allBookingsError) {
      console.error("Error fetching completed bookings:", allBookingsError);
      console.error("User email:", user.email);
      return [];
    }

    // Debug logging
    console.log(`Found ${allCompletedBookings?.length || 0} completed bookings for ${user.email}`);
    if (allCompletedBookings && allCompletedBookings.length > 0) {
      console.log("Completed bookings cleaner preferences:", 
        allCompletedBookings.map(b => ({ 
          ref: b.booking_reference, 
          cleaner: b.cleaner_preference 
        }))
      );
    }

    // Filter for bookings with a specific cleaner preference (not "no-preference" or null/undefined)
    const bookingsWithCleaners = (allCompletedBookings || []).filter(
      (b) => b.cleaner_preference && 
             typeof b.cleaner_preference === "string" &&
             b.cleaner_preference !== "no-preference" &&
             b.cleaner_preference.trim() !== ""
    );

    if (bookingsWithCleaners.length === 0) {
      console.log("No completed bookings with specific cleaner preferences found");
      return [];
    }

    // Extract unique cleaner IDs
    const cleanerIds = Array.from(
      new Set(
        bookingsWithCleaners.map((b) => b.cleaner_preference).filter(
          (id): id is string => typeof id === "string" && id.trim() !== ""
        )
      )
    );

    console.log("Extracted cleaner IDs:", cleanerIds);

    if (cleanerIds.length === 0) {
      return [];
    }

    // Fetch cleaners matching those IDs
    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaners")
      .select("*")
      .in("cleaner_id", cleanerIds)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (cleanersError) {
      console.error("Error fetching cleaners:", cleanersError);
      console.error("Cleaner IDs searched:", cleanerIds);
      return [];
    }

    console.log(`Found ${cleaners?.length || 0} cleaners matching IDs:`, cleanerIds);
    
    // If we found cleaner IDs but no cleaners, log available cleaners for debugging
    if (cleanerIds.length > 0 && (!cleaners || cleaners.length === 0)) {
      const { data: allCleaners } = await supabase
        .from("cleaners")
        .select("cleaner_id, name, is_active")
        .eq("is_active", true);
      console.warn("No cleaners found for IDs:", cleanerIds);
      console.warn("Available cleaners:", allCleaners?.map(c => c.cleaner_id));
    }

    return (cleaners || []).map((cleaner) => ({
      id: cleaner.id,
      cleaner_id: cleaner.cleaner_id,
      name: cleaner.name,
      bio: cleaner.bio,
      rating: cleaner.rating ? Number(cleaner.rating) : undefined,
      total_jobs: cleaner.total_jobs || 0,
      avatar_url: cleaner.avatar_url,
      display_order: cleaner.display_order || 0,
      is_active: cleaner.is_active,
      is_available: cleaner.is_available,
      availability_days: cleaner.availability_days || undefined,
    }));
  } catch (error) {
    console.error("Error in getPreviouslyBookedCleaners:", error);
    return [];
  }
}

/**
 * Get all active cleaners from the database
 */
export async function getAllCleaners(): Promise<Cleaner[]> {
  const supabase = await createClient();

  try {
    const { data: cleaners, error } = await supabase
      .from("cleaners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all cleaners:", error);
      return [];
    }

    return (cleaners || []).map((cleaner) => ({
      id: cleaner.id,
      cleaner_id: cleaner.cleaner_id,
      name: cleaner.name,
      bio: cleaner.bio,
      rating: cleaner.rating ? Number(cleaner.rating) : undefined,
      total_jobs: cleaner.total_jobs || 0,
      avatar_url: cleaner.avatar_url,
      display_order: cleaner.display_order || 0,
      is_active: cleaner.is_active,
      is_available: cleaner.is_available,
      availability_days: cleaner.availability_days || undefined,
    }));
  } catch (error) {
    console.error("Error in getAllCleaners:", error);
    return [];
  }
}

/**
 * Get a single cleaner by cleaner_id
 */
export async function getCleanerById(cleanerId: string): Promise<Cleaner | null> {
  const supabase = await createClient();

  try {
    const { data: cleaner, error } = await supabase
      .from("cleaners")
      .select("*")
      .eq("cleaner_id", cleanerId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching cleaner:", error);
      return null;
    }

    if (!cleaner) {
      return null;
    }

    return {
      id: cleaner.id,
      cleaner_id: cleaner.cleaner_id,
      name: cleaner.name,
      bio: cleaner.bio,
      rating: cleaner.rating ? Number(cleaner.rating) : undefined,
      total_jobs: cleaner.total_jobs || 0,
      avatar_url: cleaner.avatar_url,
      display_order: cleaner.display_order || 0,
      is_active: cleaner.is_active,
      is_available: cleaner.is_available,
      availability_days: cleaner.availability_days || undefined,
    };
  } catch (error) {
    console.error("Error in getCleanerById:", error);
    return null;
  }
}

