"use server";

import { 
  getTimeSlots as getTimeSlotsServer,
  getAdditionalServices as getAdditionalServicesServer,
  getServiceLocations as getServiceLocationsServer,
  getCleaners as getCleanersServer,
  getFrequencyOptions as getFrequencyOptionsServer,
  getTeams as getTeamsServer,
  getTeamMembers as getTeamMembersServer,
  checkTeamAvailability as checkTeamAvailabilityServer,
  getSystemSetting as getSystemSettingServer,
  TimeSlot,
  AdditionalService,
  ServiceLocation,
  Cleaner,
  FrequencyOption,
  Team,
  TeamMember,
} from "@/lib/supabase/booking-data";

/**
 * Server actions for booking data
 * Use these in Client Components instead of importing directly from booking-data.ts
 */

export async function getTimeSlots(): Promise<TimeSlot[]> {
  return await getTimeSlotsServer();
}

export async function getAdditionalServices(): Promise<AdditionalService[]> {
  return await getAdditionalServicesServer();
}

export async function getServiceLocations(): Promise<ServiceLocation[]> {
  return await getServiceLocationsServer();
}

export async function getCleaners(
  selectedDate?: string,
  selectedSuburb?: string,
  serviceType?: string
): Promise<Cleaner[]> {
  return await getCleanersServer(selectedDate, selectedSuburb, serviceType);
}

export async function getFrequencyOptions(): Promise<FrequencyOption[]> {
  return await getFrequencyOptionsServer();
}

export async function getTeams(): Promise<Team[]> {
  return await getTeamsServer();
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return await getTeamMembersServer(teamId);
}

export async function checkTeamAvailability(teamId: string, date: string): Promise<boolean> {
  return await checkTeamAvailabilityServer(teamId, date);
}

export async function getSystemSetting(key: string): Promise<string | null> {
  return await getSystemSettingServer(key);
}

