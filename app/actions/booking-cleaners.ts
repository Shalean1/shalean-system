"use server";

import {
  getTeamMembers,
  getBookingCleaners,
  assignCleanersToBooking,
  TeamMember,
  AssignedCleaner,
} from "@/lib/storage/booking-cleaners-supabase";

/**
 * Get team members for a specific team (server action)
 */
export async function getTeamMembersAction(teamId: string): Promise<TeamMember[]> {
  return getTeamMembers(teamId);
}

/**
 * Get cleaners assigned to a booking (server action)
 */
export async function getBookingCleanersAction(bookingId: string): Promise<AssignedCleaner[]> {
  return getBookingCleaners(bookingId);
}

/**
 * Assign cleaners to a booking (server action)
 */
export async function assignCleanersToBookingAction(
  bookingId: string,
  cleanerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  return assignCleanersToBooking(bookingId, cleanerIds);
}
