import { Booking, normalizeCleanerPreference } from "@/lib/types/booking";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Save a booking to Supabase
 * Uses service role client to bypass RLS and ensure booking is always created
 */
export async function saveBooking(booking: Booking): Promise<void> {
  // Use service role client for inserts to ensure they always succeed
  // Falls back to regular client if service role key is not configured
  const supabase = createServiceRoleClient();
  
  // Set assigned_cleaner_id and team_id based on cleaner_preference
  // If cleaner_preference is a team (team-a, team-b, team-c), set team_id
  // Otherwise, if it's a cleaner preference, set assigned_cleaner_id
  const normalizedPreference = normalizeCleanerPreference(booking.cleanerPreference);
  const isTeamPreference = normalizedPreference.startsWith('team-');
  const teamId = isTeamPreference ? normalizedPreference : null;
  const assignedCleanerId = !isTeamPreference && normalizedPreference !== "no-preference" 
    ? normalizedPreference 
    : null;
  
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      id: booking.id,
      booking_reference: booking.bookingReference,
      service_type: booking.service,
      frequency: booking.frequency,
      scheduled_date: booking.scheduledDate,
      scheduled_time: booking.scheduledTime,
      bedrooms: booking.bedrooms,
      bathrooms: booking.bathrooms,
      extras: booking.extras || [],
      street_address: booking.streetAddress,
      apt_unit: booking.aptUnit || null,
      suburb: booking.suburb,
      city: booking.city,
      cleaner_preference: normalizedPreference,
      assigned_cleaner_id: assignedCleanerId,
      team_id: teamId,
      special_instructions: booking.specialInstructions || null,
      fitted_rooms_count: booking.fittedRoomsCount ?? null,
      loose_carpets_count: booking.looseCarpetsCount ?? null,
      rooms_furniture_status: booking.roomsFurnitureStatus || null,
      office_size: booking.officeSize ?? null,
      contact_first_name: booking.firstName,
      contact_last_name: booking.lastName,
      contact_email: booking.email,
      contact_phone: booking.phone,
      discount_code: booking.discountCode || null,
      tip_amount: booking.tip || 0,
      total_amount: booking.totalAmount,
      // Price breakdown fields
      subtotal: booking.subtotal ?? null,
      frequency_discount: booking.frequencyDiscount ?? 0,
      discount_code_discount: booking.discountCodeDiscount ?? 0,
      service_fee: booking.serviceFee ?? null,
      // Cleaner earnings fields
      cleaner_earnings: booking.cleanerEarnings ?? null,
      cleaner_earnings_percentage: booking.cleanerEarningsPercentage ?? null,
      // Recurring booking fields
      recurring_group_id: booking.recurringGroupId || null,
      recurring_sequence: booking.recurringSequence ?? null,
      parent_booking_id: booking.parentBookingId || null,
      is_recurring: booking.isRecurring ?? false,
      status: booking.status,
      payment_status: booking.paymentStatus,
      payment_reference: booking.paymentReference || null,
      created_at: booking.createdAt,
    })
    .select();

  if (error) {
    console.error("Supabase insert error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        service: booking.service,
        cleanerPreference: booking.cleanerPreference,
        normalizedCleanerPreference: normalizeCleanerPreference(booking.cleanerPreference),
      },
    });
    throw new Error(`Failed to save booking: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("No data returned from insert:", booking);
    throw new Error("Failed to save booking: No data returned from database");
  }
}

/**
 * Get all bookings from Supabase
 */
export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Find booking by reference
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const supabase = await createClient();
  
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
 * Find booking by reference or ID for current user
 * Verifies the booking belongs to the logged-in user
 */
export async function getUserBookingByReferenceOrId(referenceOrId: string): Promise<Booking | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Try to find by booking_reference first
  let { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_reference", referenceOrId)
    .eq("contact_email", user.email)
    .single();

  // If not found by reference, try by ID
  if (error && error.code === "PGRST116") {
    const result = await supabase
      .from("bookings")
      .select("*")
      .eq("id", referenceOrId)
      .eq("contact_email", user.email)
      .single();
    
    if (result.data) {
      data = result.data;
      error = null;
    } else if (result.error) {
      error = result.error;
    }
  }

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
 * Find booking by payment reference
 * Used to check if a booking already exists for a payment
 */
export async function getBookingByPaymentReference(paymentReference: string): Promise<Booking | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("payment_reference", paymentReference)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch booking by payment reference: ${error.message}`);
  }

  return data ? mapDatabaseToBooking(data) : null;
}

/**
 * Get all bookings in a recurring series by group ID
 */
export async function getRecurringBookings(groupId: string): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("recurring_group_id", groupId)
    .order("recurring_sequence", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch recurring bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get bookings for current user
 */
export async function getUserBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get bookings for a specific email (for non-authenticated users)
 */
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  reference: string,
  status: Booking["status"]
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  reference: string,
  paymentStatus: Booking["paymentStatus"],
  paymentReference?: string
): Promise<void> {
  const supabase = await createClient();
  
  const updates: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentReference) {
    updates.payment_reference = paymentReference;
  }

  const { error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
}

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SHL-${timestamp}-${random}`;
}

/**
 * Generate a unique booking ID
 */
export function generateBookingId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get upcoming bookings for current user
 */
export async function getUpcomingBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch upcoming bookings: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToBooking);
}

/**
 * Get booking counts for current user
 */
export async function getBookingCounts(): Promise<{
  upcoming: number;
  today: number;
  new: number;
  past: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { upcoming: 0, today: 0, new: 0, past: 0 };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("status, scheduled_date, created_at")
    .eq("contact_email", user.email);

  if (error) {
    throw new Error(`Failed to fetch booking counts: ${error.message}`);
  }

  const bookings = data || [];
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(todayDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const counts = {
    upcoming: bookings.filter(
      (b) => 
        (b.status === "pending" || b.status === "confirmed") && 
        b.scheduled_date >= today
    ).length,
    today: bookings.filter(
      (b) => b.scheduled_date === today
    ).length,
    new: bookings.filter(
      (b) => {
        if (!b.created_at) return false;
        const createdAt = new Date(b.created_at);
        return createdAt >= sevenDaysAgo;
      }
    ).length,
    past: bookings.filter(
      (b) => b.scheduled_date && b.scheduled_date < today
    ).length,
  };

  return counts;
}

/**
 * Get spending analytics for current user
 */
export async function getSpendingAnalytics(): Promise<{
  totalSpent: number;
  averageBookingValue: number;
  totalPaid: number;
  pendingPayments: number;
  completedBookings: number;
  mostBookedService: string | null;
  favoriteFrequency: string | null;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      totalSpent: 0,
      averageBookingValue: 0,
      totalPaid: 0,
      pendingPayments: 0,
      completedBookings: 0,
      mostBookedService: null,
      favoriteFrequency: null,
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("total_amount, payment_status, status, service_type, frequency")
    .eq("contact_email", user.email);

  if (error) {
    throw new Error(`Failed to fetch spending analytics: ${error.message}`);
  }

  const bookings = data || [];
  
  // Calculate totals
  const totalSpent = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const totalPaid = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const pendingPayments = bookings
    .filter((b) => b.payment_status === "pending" && (b.status === "pending" || b.status === "confirmed"))
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  
  const paidBookings = bookings.filter((b) => b.payment_status === "completed");
  const averageBookingValue = paidBookings.length > 0
    ? totalPaid / paidBookings.length
    : 0;
  
  // Find most booked service
  const serviceCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.service_type) {
      serviceCounts[b.service_type] = (serviceCounts[b.service_type] || 0) + 1;
    }
  });
  const mostBookedService = Object.keys(serviceCounts).length > 0
    ? Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  
  // Find favorite frequency
  const frequencyCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.frequency) {
      frequencyCounts[b.frequency] = (frequencyCounts[b.frequency] || 0) + 1;
    }
  });
  const favoriteFrequency = Object.keys(frequencyCounts).length > 0
    ? Object.entries(frequencyCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return {
    totalSpent,
    averageBookingValue,
    totalPaid,
    pendingPayments,
    completedBookings,
    mostBookedService,
    favoriteFrequency,
  };
}

/**
 * Get weekly spending/earnings data for current user
 * Returns data for the current week (Monday to Sunday)
 */
export async function getWeeklySpending(): Promise<{
  weekStart: Date;
  weekEnd: Date;
  weekStartStr: string;
  weekEndStr: string;
  completedJobs: Booking[];
  upcomingJobs: Booking[];
  jobsCount: number;
  totalHours: number;
  tipsTotal: number;
  earningsTotal: number;
  totalAmount: number;
  upcomingJobsCount: number;
  upcomingHours: number;
  estimatedEarnings: number;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      weekStart,
      weekEnd,
      weekStartStr: formatWeekDate(weekStart),
      weekEndStr: formatWeekDate(weekEnd),
      completedJobs: [],
      upcomingJobs: [],
      jobsCount: 0,
      totalHours: 0,
      tipsTotal: 0,
      earningsTotal: 0,
      totalAmount: 0,
      upcomingJobsCount: 0,
      upcomingHours: 0,
      estimatedEarnings: 0,
    };
  }

  // Calculate week range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // Fetch all bookings for this user
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly spending: ${error.message}`);
  }

  const bookings = (data || []).map(mapDatabaseToBooking);
  
  // Filter completed jobs for this week
  const completedJobs = bookings.filter((b) => {
    if (b.status !== "completed") return false;
    const scheduledDate = new Date(b.scheduledDate!);
    return scheduledDate >= weekStart && scheduledDate <= weekEnd;
  });

  // Filter upcoming jobs for this week
  const upcomingJobs = bookings.filter((b) => {
    if (b.status === "completed" || b.status === "cancelled") return false;
    const scheduledDate = new Date(b.scheduledDate!);
    return scheduledDate >= weekStart && scheduledDate <= weekEnd;
  });

  // Calculate totals for completed jobs
  const jobsCount = completedJobs.length;
  const totalHours = completedJobs.reduce((sum, b) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  const tipsTotal = completedJobs.reduce((sum, b) => sum + (b.tip || 0), 0);
  const earningsTotal = completedJobs
    .filter((b) => b.paymentStatus === "completed")
    .reduce((sum, b) => sum + (b.totalAmount - (b.tip || 0)), 0);
  const totalAmount = earningsTotal + tipsTotal;

  // Calculate upcoming jobs
  const upcomingJobsCount = upcomingJobs.length;
  const upcomingHours = upcomingJobs.reduce((sum, b) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  const estimatedEarnings = upcomingJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return {
    weekStart,
    weekEnd,
    weekStartStr: formatWeekDate(weekStart),
    weekEndStr: formatWeekDate(weekEnd),
    completedJobs,
    upcomingJobs,
    jobsCount,
    totalHours,
    tipsTotal,
    earningsTotal,
    totalAmount,
    upcomingJobsCount,
    upcomingHours,
    estimatedEarnings,
  };
}

/**
 * Get historical earnings data for current user
 * Returns all completed bookings grouped by month
 */
export async function getHistoricalEarnings(): Promise<{
  totalJobs: number;
  totalHours: number;
  totalTips: number;
  totalEarnings: number;
  totalAmount: number;
  monthlyData: Array<{
    month: string;
    monthKey: string;
    jobs: Booking[];
    jobsCount: number;
    hours: number;
    tips: number;
    earnings: number;
    total: number;
  }>;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      totalJobs: 0,
      totalHours: 0,
      totalTips: 0,
      totalEarnings: 0,
      totalAmount: 0,
      monthlyData: [],
    };
  }

  // Fetch all completed bookings for this user
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("contact_email", user.email)
    .eq("status", "completed")
    .order("scheduled_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch historical earnings: ${error.message}`);
  }

  const bookings = (data || []).map(mapDatabaseToBooking);
  
  // Group by month
  const monthlyMap = new Map<string, Booking[]>();
  
  bookings.forEach((booking) => {
    if (!booking.scheduledDate) return;
    const date = new Date(booking.scheduledDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(booking);
  });

  // Convert to array and calculate totals for each month
  const monthlyData = Array.from(monthlyMap.entries()).map(([monthKey, jobs]) => {
    const firstJob = jobs[0];
    const date = new Date(firstJob.scheduledDate!);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const hours = jobs.reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
    const tips = jobs.reduce((sum, b) => sum + (b.tip || 0), 0);
    const earnings = jobs
      .filter((b) => b.paymentStatus === "completed")
      .reduce((sum, b) => sum + (b.totalAmount - (b.tip || 0)), 0);
    const total = earnings + tips;
    
    return {
      month: monthName,
      monthKey,
      jobs,
      jobsCount: jobs.length,
      hours,
      tips,
      earnings,
      total,
    };
  }).sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // Sort by most recent first

  // Calculate overall totals
  const totalJobs = bookings.length;
  const totalHours = bookings.reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
  const totalTips = bookings.reduce((sum, b) => sum + (b.tip || 0), 0);
  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === "completed")
    .reduce((sum, b) => sum + (b.totalAmount - (b.tip || 0)), 0);
  const totalAmount = totalEarnings + totalTips;

  return {
    totalJobs,
    totalHours,
    totalTips,
    totalEarnings,
    totalAmount,
    monthlyData,
  };
}

/**
 * Estimate job hours based on service type and property size
 */
function estimateJobHours(service: string, bedrooms: number, bathrooms: number): number {
  const baseHours: Record<string, number> = {
    standard: 2,
    deep: 4,
    "move-in-out": 5,
    airbnb: 3,
    office: 3,
    holiday: 4,
  };

  const base = baseHours[service] || 2;
  const roomHours = bedrooms * 0.5 + bathrooms * 0.5;
  return Math.round((base + roomHours) * 10) / 10;
}

/**
 * Format date as "Wed 17 Dec 2025"
 */
function formatWeekDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const day = days[date.getDay()];
  const dayNum = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${dayNum} ${month} ${year}`;
}

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
    fittedRoomsCount: data.fitted_rooms_count ?? undefined,
    looseCarpetsCount: data.loose_carpets_count ?? undefined,
    roomsFurnitureStatus: data.rooms_furniture_status || undefined,
    officeSize: data.office_size ?? undefined,
    firstName: data.contact_first_name,
    lastName: data.contact_last_name,
    email: data.contact_email,
    phone: data.contact_phone,
    discountCode: data.discount_code,
    tip: data.tip_amount || 0,
    totalAmount: data.total_amount,
    // Price breakdown fields
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    // Cleaner earnings fields
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

