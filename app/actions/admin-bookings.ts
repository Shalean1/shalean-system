"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Booking } from "@/lib/types/booking";

/**
 * Map database record to Booking type
 */
function mapDatabaseToBooking(data: any): Booking {
  return {
    id: data.id,
    bookingReference: data.booking_reference,
    service: data.service_type,
    frequency: data.frequency,
    scheduledDate: data.scheduled_date,
    scheduledTime: data.scheduled_time,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    extras: data.extras || [],
    streetAddress: data.street_address,
    aptUnit: data.apt_unit,
    suburb: data.suburb,
    city: data.city,
    cleanerPreference: data.cleaner_preference,
    specialInstructions: data.special_instructions,
    firstName: data.contact_first_name,
    lastName: data.contact_last_name,
    email: data.contact_email,
    phone: data.contact_phone,
    discountCode: data.discount_code,
    tip: data.tip_amount || 0,
    totalAmount: parseFloat(data.total_amount || 0),
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    cleanerEarnings: data.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: data.cleaner_earnings_percentage ?? undefined,
    // Recurring booking fields
    recurringGroupId: data.recurring_group_id ?? undefined,
    recurringSequence: data.recurring_sequence ?? undefined,
    parentBookingId: data.parent_booking_id ?? undefined,
    isRecurring: data.is_recurring ?? false,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    cleanerResponse: data.cleaner_response || null,
    jobProgress: data.job_progress || null,
    createdAt: data.created_at,
    teamId: data.team_id || undefined,
    // assignedCleanerIds will be loaded separately if needed
  };
}

/**
 * Get all bookings (admin access)
 */
export async function getAllBookings(): Promise<Booking[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get booking statistics
 */
export async function getBookingStats() {
  const supabase = createServiceRoleClient();
  
  const [totalResult, statusResult, paymentStatusResult] = await Promise.all([
    // Total count
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true }),
    
    // Count by status
    supabase
      .from("bookings")
      .select("status"),
    
    // Count by payment status
    supabase
      .from("bookings")
      .select("payment_status"),
  ]);

  // Count by status
  const byStatus: Record<string, number> = {};
  (statusResult.data || []).forEach((booking) => {
    const status = booking.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  // Count by payment status
  const byPaymentStatus: Record<string, number> = {};
  (paymentStatusResult.data || []).forEach((booking) => {
    const status = booking.payment_status || "unknown";
    byPaymentStatus[status] = (byPaymentStatus[status] || 0) + 1;
  });

  return {
    total: totalResult.count || 0,
    byStatus,
    byPaymentStatus,
  };
}

/**
 * Get booking by reference (admin access)
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_reference", reference)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data ? mapDatabaseToBooking(data) : null;
}

/**
 * Get all recurring bookings grouped by recurring_group_id
 * Returns bookings grouped into recurring series
 */
export async function getAllRecurringBookings(): Promise<Map<string, Booking[]>> {
  const supabase = createServiceRoleClient();
  
  // Get all recurring bookings
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("is_recurring", true)
    .order("recurring_group_id", { ascending: true })
    .order("recurring_sequence", { ascending: true });

  if (error) {
    console.error("Error fetching recurring bookings:", error);
    throw new Error(`Failed to fetch recurring bookings: ${error.message}`);
  }

  // Group bookings by recurring_group_id
  const grouped = new Map<string, Booking[]>();
  
  (data || []).forEach((bookingData) => {
    const booking = mapDatabaseToBooking(bookingData);
    const groupId = booking.recurringGroupId || "unknown";
    
    if (!grouped.has(groupId)) {
      grouped.set(groupId, []);
    }
    
    grouped.get(groupId)!.push(booking);
  });

  return grouped;
}

/**
 * Recurring Schedule type matching the recurring_schedules table
 */
export interface RecurringSchedule {
  id: string;
  customerId: string;
  serviceType: string;
  frequency: string;
  dayOfWeek: string | null;
  dayOfMonth: number | null;
  preferredTime: string;
  bedrooms: string;
  bathrooms: string;
  extras: string[];
  notes: string | null;
  addressLine1: string;
  addressSuburb: string;
  addressCity: string;
  cleanerId: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  lastGeneratedMonth: string | null;
  createdAt: string;
  updatedAt: string;
  daysOfWeek: string[] | null;
  earningsOverride: string;
  totalAmount: number | null;
  cleanerEarnings: number | null;
  // Customer info from customers table join
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Get all recurring schedules from the recurring_schedules table
 * Joins with profiles to get customer information
 */
export async function getAllRecurringSchedules(): Promise<RecurringSchedule[]> {
  const supabase = createServiceRoleClient();
  
  // Fetch recurring schedules with customer info from customers table
  const { data, error } = await supabase
    .from("recurring_schedules")
    .select(`
      *,
      customers:customer_id (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recurring schedules:", error);
    throw new Error(`Failed to fetch recurring schedules: ${error.message}`);
  }

  // Map the data to RecurringSchedule type
  return (data || []).map((schedule: any) => {
    const customer = schedule.customers || {};
    const customerName = 
      (customer.first_name && customer.last_name 
        ? `${customer.first_name} ${customer.last_name}` 
        : customer.first_name || customer.last_name || 'Unknown Customer');

    return {
      id: schedule.id,
      customerId: schedule.customer_id,
      serviceType: schedule.service_type,
      frequency: schedule.frequency,
      dayOfWeek: schedule.day_of_week,
      dayOfMonth: schedule.day_of_month,
      preferredTime: schedule.preferred_time,
      bedrooms: schedule.bedrooms,
      bathrooms: schedule.bathrooms,
      extras: schedule.extras || [],
      notes: schedule.notes,
      addressLine1: schedule.address_line1,
      addressSuburb: schedule.address_suburb,
      addressCity: schedule.address_city,
      cleanerId: schedule.cleaner_id,
      isActive: schedule.is_active,
      startDate: schedule.start_date,
      endDate: schedule.end_date,
      lastGeneratedMonth: schedule.last_generated_month,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      daysOfWeek: schedule.days_of_week,
      earningsOverride: schedule.earnings_override,
      totalAmount: schedule.total_amount ? parseFloat(schedule.total_amount) / 100 : null,
      cleanerEarnings: schedule.cleaner_earnings ? parseFloat(schedule.cleaner_earnings) / 100 : null,
      customerName,
      customerEmail: customer.email || null,
      customerPhone: customer.phone || null,
    };
  });
}

/**
 * Customer interface for dropdowns
 */
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

/**
 * Recurring Customer interface - customer with recurring schedule info
 */
export interface RecurringCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressSuburb: string | null;
  addressCity: string | null;
  totalBookings: string;
  scheduleCount: number;
  activeScheduleCount: number;
  schedules: Array<{
    id: string;
    serviceType: string;
    frequency: string;
    isActive: boolean;
    startDate: string;
    endDate: string | null;
    preferredTime: string;
    totalAmount: number | null;
  }>;
}

/**
 * Cleaner interface for dropdowns
 */
export interface Cleaner {
  id: string;
  cleanerId: string;
  name: string;
}

/**
 * Full Cleaner interface for admin pages
 */
export interface CleanerFull {
  id: string;
  cleanerId: string;
  name: string;
  bio?: string | null;
  rating?: number | null;
  totalJobs: number;
  avatarUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  isAvailable: boolean;
  availabilityDays?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all cleaners with full details for admin pages
 */
export async function getAllCleanersFull(): Promise<CleanerFull[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("cleaners")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching cleaners:", error);
    throw new Error(`Failed to fetch cleaners: ${error.message}`);
  }

  return (data || []).map((cleaner: any) => ({
    id: cleaner.id,
    cleanerId: cleaner.cleaner_id,
    name: cleaner.name,
    bio: cleaner.bio,
    rating: cleaner.rating ? parseFloat(cleaner.rating) : null,
    totalJobs: cleaner.total_jobs || 0,
    avatarUrl: cleaner.avatar_url,
    displayOrder: cleaner.display_order || 0,
    isActive: cleaner.is_active ?? true,
    isAvailable: cleaner.is_available ?? true,
    availabilityDays: cleaner.availability_days ? (Array.isArray(cleaner.availability_days) ? cleaner.availability_days : []) : [],
    createdAt: cleaner.created_at,
    updatedAt: cleaner.updated_at,
  }));
}

/**
 * Get all customers for dropdowns
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .order("first_name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return (data || []).map((customer: any) => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.phone,
  }));
}

/**
 * Update a customer
 */
export async function updateCustomer(
  id: string,
  updates: Partial<Pick<Customer, "firstName" | "lastName" | "email" | "phone">>
): Promise<{ success: boolean; error?: string; data?: Customer }> {
  const supabase = createServiceRoleClient();

  const updateData: any = {};
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select("id, first_name, last_name, email, phone")
    .single();

  if (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
    },
  };
}

/**
 * Delete a customer
 */
export async function deleteCustomer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all customers who have recurring schedules
 */
export async function getRecurringCustomers(): Promise<RecurringCustomer[]> {
  const supabase = createServiceRoleClient();
  
  // Fetch customers with their recurring schedules
  const { data: schedulesData, error: schedulesError } = await supabase
    .from("recurring_schedules")
    .select(`
      id,
      customer_id,
      service_type,
      frequency,
      is_active,
      start_date,
      end_date,
      preferred_time,
      total_amount,
      customers:customer_id (
        id,
        first_name,
        last_name,
        email,
        phone,
        address_line1,
        address_suburb,
        address_city,
        total_bookings
      )
    `)
    .order("created_at", { ascending: false });

  if (schedulesError) {
    console.error("Error fetching recurring schedules:", schedulesError);
    throw new Error(`Failed to fetch recurring schedules: ${schedulesError.message}`);
  }

  // Group schedules by customer
  const customerMap = new Map<string, RecurringCustomer>();

  (schedulesData || []).forEach((schedule: any) => {
    const customer = schedule.customers;
    if (!customer) return;

    const customerId = customer.id;
    
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        id: customerId,
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        email: customer.email || null,
        phone: customer.phone || null,
        addressLine1: customer.address_line1 || null,
        addressSuburb: customer.address_suburb || null,
        addressCity: customer.address_city || null,
        totalBookings: customer.total_bookings || "0",
        scheduleCount: 0,
        activeScheduleCount: 0,
        schedules: [],
      });
    }

    const recurringCustomer = customerMap.get(customerId)!;
    recurringCustomer.scheduleCount++;
    if (schedule.is_active) {
      recurringCustomer.activeScheduleCount++;
    }

    recurringCustomer.schedules.push({
      id: schedule.id,
      serviceType: schedule.service_type,
      frequency: schedule.frequency,
      isActive: schedule.is_active,
      startDate: schedule.start_date,
      endDate: schedule.end_date,
      preferredTime: schedule.preferred_time,
      totalAmount: schedule.total_amount ? parseFloat(schedule.total_amount) / 100 : null,
    });
  });

  // Convert map to array and sort by customer name
  return Array.from(customerMap.values()).sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Get all cleaners for dropdowns
 */
export async function getAllCleaners(): Promise<Cleaner[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("cleaners")
    .select("id, cleaner_id, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching cleaners:", error);
    throw new Error(`Failed to fetch cleaners: ${error.message}`);
  }

  return (data || []).map((cleaner: any) => ({
    id: cleaner.id,
    cleanerId: cleaner.cleaner_id,
    name: cleaner.name,
  }));
}

/**
 * Create a new recurring schedule
 */
export async function createRecurringSchedule(data: {
  customerId: string;
  serviceType: string;
  frequency: string;
  dayOfWeek?: string | null;
  dayOfMonth?: number | null;
  preferredTime: string;
  bedrooms: string;
  bathrooms: string;
  extras?: string[];
  notes?: string | null;
  addressLine1: string;
  addressSuburb: string;
  addressCity: string;
  cleanerId?: string | null;
  isActive?: boolean;
  startDate: string;
  endDate?: string | null;
  daysOfWeek?: string[] | null;
  totalAmount?: number | null;
  cleanerEarnings?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  // Convert amounts to cents if provided
  const totalAmountCents = data.totalAmount ? Math.round(data.totalAmount * 100) : null;
  const cleanerEarningsCents = data.cleanerEarnings ? Math.round(data.cleanerEarnings * 100) : null;

  const { error } = await supabase
    .from("recurring_schedules")
    .insert({
      customer_id: data.customerId,
      service_type: data.serviceType,
      frequency: data.frequency,
      day_of_week: data.dayOfWeek || null,
      day_of_month: data.dayOfMonth || null,
      preferred_time: data.preferredTime,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      extras: data.extras || [],
      notes: data.notes || null,
      address_line1: data.addressLine1,
      address_suburb: data.addressSuburb,
      address_city: data.addressCity,
      cleaner_id: data.cleanerId || null,
      is_active: data.isActive !== undefined ? data.isActive : true,
      start_date: data.startDate,
      end_date: data.endDate || null,
      days_of_week: data.daysOfWeek || null,
      total_amount: totalAmountCents,
      cleaner_earnings: cleanerEarningsCents,
    });

  if (error) {
    console.error("Error creating recurring schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update an existing recurring schedule
 */
export async function updateRecurringSchedule(
  id: string,
  data: {
    customerId?: string;
    serviceType?: string;
    frequency?: string;
    dayOfWeek?: string | null;
    dayOfMonth?: number | null;
    preferredTime?: string;
    bedrooms?: string;
    bathrooms?: string;
    extras?: string[];
    notes?: string | null;
    addressLine1?: string;
    addressSuburb?: string;
    addressCity?: string;
    cleanerId?: string | null;
    isActive?: boolean;
    startDate?: string;
    endDate?: string | null;
    daysOfWeek?: string[] | null;
    totalAmount?: number | null;
    cleanerEarnings?: number | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const updateData: any = {};
  
  if (data.customerId !== undefined) updateData.customer_id = data.customerId;
  if (data.serviceType !== undefined) updateData.service_type = data.serviceType;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.dayOfWeek !== undefined) updateData.day_of_week = data.dayOfWeek;
  if (data.dayOfMonth !== undefined) updateData.day_of_month = data.dayOfMonth;
  if (data.preferredTime !== undefined) updateData.preferred_time = data.preferredTime;
  if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
  if (data.extras !== undefined) updateData.extras = data.extras;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.addressLine1 !== undefined) updateData.address_line1 = data.addressLine1;
  if (data.addressSuburb !== undefined) updateData.address_suburb = data.addressSuburb;
  if (data.addressCity !== undefined) updateData.address_city = data.addressCity;
  if (data.cleanerId !== undefined) updateData.cleaner_id = data.cleanerId;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;
  if (data.daysOfWeek !== undefined) updateData.days_of_week = data.daysOfWeek;
  if (data.totalAmount !== undefined) {
    updateData.total_amount = data.totalAmount ? Math.round(data.totalAmount * 100) : null;
  }
  if (data.cleanerEarnings !== undefined) {
    updateData.cleaner_earnings = data.cleanerEarnings ? Math.round(data.cleanerEarnings * 100) : null;
  }

  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("recurring_schedules")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating recurring schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a recurring schedule
 */
export async function deleteRecurringSchedule(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("recurring_schedules")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting recurring schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Assign cleaner to a recurring schedule
 */
export async function assignCleanerToSchedule(
  scheduleId: string,
  cleanerId: string | null
): Promise<{ success: boolean; error?: string }> {
  return updateRecurringSchedule(scheduleId, { cleanerId });
}
