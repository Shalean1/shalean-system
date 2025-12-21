import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Team member interface
 */
export interface TeamMember {
  id: string;
  teamId: string;
  cleanerId: string;
  cleanerName: string;
  displayOrder: number;
}

/**
 * Assigned cleaner interface
 */
export interface AssignedCleaner {
  id: string;
  cleanerId: string;
  cleanerName: string;
}

/**
 * Get all team members for a specific team
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("team_members")
    .select(`
      id,
      team_id,
      cleaner_id,
      display_order,
      cleaners:cleaner_id (
        name
      )
    `)
    .eq("team_id", teamId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  return (data || []).map((member: any) => ({
    id: member.id,
    teamId: member.team_id,
    cleanerId: member.cleaner_id,
    cleanerName: member.cleaners?.name || member.cleaner_id,
    displayOrder: member.display_order || 0,
  }));
}

/**
 * Get all cleaners assigned to a specific booking
 */
export async function getBookingCleaners(bookingId: string): Promise<AssignedCleaner[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("booking_cleaners")
    .select(`
      id,
      cleaner_id,
      cleaners:cleaner_id (
        name
      )
    `)
    .eq("booking_id", bookingId);

  if (error) {
    console.error("Error fetching booking cleaners:", error);
    throw new Error(`Failed to fetch booking cleaners: ${error.message}`);
  }

  return (data || []).map((assignment: any) => ({
    id: assignment.id,
    cleanerId: assignment.cleaner_id,
    cleanerName: assignment.cleaners?.name || assignment.cleaner_id,
  }));
}

/**
 * Assign cleaners to a booking
 * Replaces any existing assignments
 */
export async function assignCleanersToBooking(
  bookingId: string,
  cleanerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  // First, delete existing assignments
  const { error: deleteError } = await supabase
    .from("booking_cleaners")
    .delete()
    .eq("booking_id", bookingId);

  if (deleteError) {
    console.error("Error deleting existing booking cleaners:", deleteError);
    return { success: false, error: deleteError.message };
  }

  // If no cleaners to assign, we're done
  if (cleanerIds.length === 0) {
    return { success: true };
  }

  // Insert new assignments
  const assignments = cleanerIds.map((cleanerId) => ({
    booking_id: bookingId,
    cleaner_id: cleanerId,
  }));

  const { error: insertError } = await supabase
    .from("booking_cleaners")
    .insert(assignments);

  if (insertError) {
    console.error("Error assigning cleaners to booking:", insertError);
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

/**
 * Add a cleaner to a booking (without removing existing ones)
 */
export async function addCleanerToBooking(
  bookingId: string,
  cleanerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("booking_cleaners")
    .insert({
      booking_id: bookingId,
      cleaner_id: cleanerId,
    });

  if (error) {
    // Ignore unique constraint errors (cleaner already assigned)
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error adding cleaner to booking:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Remove a cleaner from a booking
 */
export async function removeCleanerFromBooking(
  bookingId: string,
  cleanerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("booking_cleaners")
    .delete()
    .eq("booking_id", bookingId)
    .eq("cleaner_id", cleanerId);

  if (error) {
    console.error("Error removing cleaner from booking:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
