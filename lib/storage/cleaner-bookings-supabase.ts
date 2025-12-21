import { Booking, normalizeCleanerPreference } from "@/lib/types/booking";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "./cleaner-auth-supabase";

/**
 * Normalize cleaner ID to match booking assignments
 * Maps alternative cleaner IDs to the standard ones used in bookings
 */
function normalizeCleanerId(cleanerId: string | null | undefined): string | null {
  if (!cleanerId) return null;
  
  const normalized = cleanerId.toLowerCase().trim();
  
  // Map 'beaulla-chemugarira' to 'beaul' (common mismatch)
  if (normalized === 'beaulla-chemugarira' || normalized.includes('beaulla')) {
    return 'beaul';
  }
  
  return normalized;
}

/**
 * Get all bookings assigned to the current cleaner
 */
export async function getCleanerBookings(): Promise<Booking[]> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner || !cleaner.cleanerId) {
    console.warn("getCleanerBookings: No cleaner or cleanerId found", {
      cleaner: cleaner ? { cleanerId: cleaner.cleanerId, name: cleaner.name } : null
    });
    return [];
  }

  const supabase = await createClient();
  
  // Normalize cleaner ID - handles 'beaulla-chemugarira' -> 'beaul' mapping
  const normalizedCleanerId = normalizeCleanerId(cleaner.cleanerId);
  
  if (!normalizedCleanerId) {
    console.warn("getCleanerBookings: Could not normalize cleaner ID", cleaner.cleanerId);
    return [];
  }
  
  console.log(`Fetching bookings for cleaner: ${normalizedCleanerId} (original: ${cleaner.cleanerId})`);
  
  // First try exact match (case-sensitive)
  let { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", normalizedCleanerId)
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });

  // If no results and cleaner ID might have different case, try case-insensitive search
  if ((!data || data.length === 0) && normalizedCleanerId !== cleaner.cleanerId) {
    console.log(`No bookings found with exact match, trying case-insensitive search...`);
    // Use a filter with case-insensitive comparison
    const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
      .from("bookings")
      .select("*")
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false });
    
    if (!caseInsensitiveError && caseInsensitiveData) {
      // Filter client-side for case-insensitive match
      data = caseInsensitiveData.filter(
        (b: any) => b.assigned_cleaner_id?.toLowerCase() === normalizedCleanerId
      );
      error = null;
    }
  }

  if (error) {
    console.error("Error fetching cleaner bookings:", error, {
      cleanerId: normalizedCleanerId,
      originalCleanerId: cleaner.cleanerId
    });
    throw new Error(`Failed to fetch cleaner bookings: ${error.message}`);
  }

  if (!data || data.length === 0) {
    // Diagnostic: Check if there are any bookings with similar cleaner IDs
    const { data: diagnosticData } = await supabase
      .from("bookings")
      .select("assigned_cleaner_id")
      .not("assigned_cleaner_id", "is", null);
    
    const uniqueCleanerIds = [...new Set(
      (diagnosticData || []).map((b: any) => b.assigned_cleaner_id)
    )];
    
    console.warn(`No bookings found for cleaner ${normalizedCleanerId}`, {
      cleanerId: normalizedCleanerId,
      availableCleanerIds: uniqueCleanerIds,
      totalBookingsWithCleaners: diagnosticData?.length || 0
    });
    return [];
  }

  console.log(`Found ${data.length} bookings for cleaner ${normalizedCleanerId}`);
  return data.map(mapDatabaseToBooking);
}

/**
 * Get upcoming bookings for the current cleaner
 * Includes bookings that are confirmed (accepted) and scheduled in the future
 */
export async function getCleanerUpcomingBookings(): Promise<Booking[]> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    console.warn("getCleanerUpcomingBookings: No cleaner found");
    return [];
  }

  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Normalize cleaner ID
  const normalizedCleanerId = normalizeCleanerId(cleaner.cleanerId);
  
  if (!normalizedCleanerId) {
    console.warn("getCleanerUpcomingBookings: Could not normalize cleaner ID", cleaner.cleanerId);
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", normalizedCleanerId)
    .eq("status", "confirmed") // Only confirmed (accepted) bookings show in Upcoming
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming bookings:", error);
    throw new Error(`Failed to fetch upcoming bookings: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log(`No upcoming bookings found for cleaner ${normalizedCleanerId}`);
    return [];
  }

  return data.map(mapDatabaseToBooking);
}

/**
 * Get booking statistics for the current cleaner
 */
export async function getCleanerBookingStats(): Promise<{
  upcoming: number;
  today: number;
  new: number;
  past: number;
}> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner || !cleaner.cleanerId) {
    console.warn("getCleanerBookingStats: No cleaner or cleanerId found", {
      cleaner: cleaner ? { cleanerId: cleaner.cleanerId, name: cleaner.name } : null
    });
    return { upcoming: 0, today: 0, new: 0, past: 0 };
  }

  const supabase = await createClient();
  
  // Normalize cleaner ID - handles 'beaulla-chemugarira' -> 'beaul' mapping
  const normalizedCleanerId = normalizeCleanerId(cleaner.cleanerId);
  
  if (!normalizedCleanerId) {
    console.warn("getCleanerBookingStats: Could not normalize cleaner ID", cleaner.cleanerId);
    return { upcoming: 0, today: 0, new: 0, past: 0 };
  }
  
  console.log(`Fetching booking stats for cleaner: ${normalizedCleanerId} (original: ${cleaner.cleanerId})`);
  
  let { data, error } = await supabase
    .from("bookings")
    .select("status, scheduled_date, created_at, cleaner_response")
    .eq("assigned_cleaner_id", normalizedCleanerId);

  // If no results, try case-insensitive search
  if ((!data || data.length === 0) && normalizedCleanerId !== cleaner.cleanerId) {
    const { data: allData } = await supabase
      .from("bookings")
      .select("status, scheduled_date, created_at, assigned_cleaner_id, cleaner_response");
    
    if (allData) {
      data = allData.filter(
        (b: any) => b.assigned_cleaner_id?.toLowerCase() === normalizedCleanerId
      );
      error = null;
    }
  }

  if (error) {
    console.error("Error fetching booking stats:", error, {
      cleanerId: normalizedCleanerId,
      originalCleanerId: cleaner.cleanerId
    });
    throw new Error(`Failed to fetch booking stats: ${error.message}`);
  }

  const bookings = data || [];
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(todayDate);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const sevenDaysFromNowStr = sevenDaysFromNow.toISOString().split('T')[0];

  const counts = {
    upcoming: bookings.filter(
      (b) => 
        b &&
        b.status === "confirmed" && // Only confirmed (accepted) bookings
        b.scheduled_date &&
        b.scheduled_date >= today
    ).length,
    today: bookings.filter(
      (b) => b && b.scheduled_date === today && b.status === "confirmed"
    ).length,
    new: bookings.filter(
      (b) => {
        if (!b || !b.scheduled_date) return false;
        // "New" bookings are pending bookings that need acceptance (cleaner_response IS NULL)
        // Scheduled in the next 7 days (including today)
        return b.status === "pending" && 
               !b.cleaner_response && 
               b.scheduled_date >= today && 
               b.scheduled_date <= sevenDaysFromNowStr;
      }
    ).length,
    past: bookings.filter(
      (b) => b && b.scheduled_date && b.scheduled_date < today
    ).length,
  };

  console.log(`Booking stats for cleaner ${normalizedCleanerId}:`, counts, {
    totalBookings: bookings.length
  });
  return counts;
}

/**
 * Get cleaner earnings
 */
export async function getCleanerEarnings(): Promise<{
  totalEarnings: number;
  completedJobs: number;
  averageEarning: number;
  pendingEarnings: number;
}> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    return {
      totalEarnings: 0,
      completedJobs: 0,
      averageEarning: 0,
      pendingEarnings: 0,
    };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("total_amount, cleaner_earnings, status, payment_status")
    .eq("assigned_cleaner_id", cleaner.cleanerId);

  if (error) {
    throw new Error(`Failed to fetch earnings: ${error.message}`);
  }

  const bookings = data || [];
  
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completedBookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => {
      // Use cleaner_earnings if available, otherwise fallback to old calculation
      if (b.cleaner_earnings !== null && b.cleaner_earnings !== undefined) {
        return sum + (b.cleaner_earnings || 0);
      }
      // Fallback: use total_amount (for backward compatibility with old bookings)
      return sum + (b.total_amount || 0);
    }, 0);
  
  const pendingEarnings = bookings
    .filter((b) => 
      (b.status === "completed" || b.status === "in-progress") && 
      b.payment_status === "pending"
    )
    .reduce((sum, b) => {
      // Use cleaner_earnings if available, otherwise fallback to old calculation
      if (b.cleaner_earnings !== null && b.cleaner_earnings !== undefined) {
        return sum + (b.cleaner_earnings || 0);
      }
      // Fallback: use total_amount (for backward compatibility with old bookings)
      return sum + (b.total_amount || 0);
    }, 0);

  const averageEarning = completedBookings.length > 0
    ? totalEarnings / completedBookings.length
    : 0;

  return {
    totalEarnings,
    completedJobs: completedBookings.length,
    averageEarning,
    pendingEarnings,
  };
}

/**
 * Estimate job hours based on service type and property size
 */
function estimateJobHours(service: string, bedrooms: number, bathrooms: number): number {
  // Base hours by service type
  const baseHours: Record<string, number> = {
    standard: 2,
    deep: 4,
    "move-in-out": 5,
    airbnb: 3,
    office: 3,
    holiday: 4,
  };

  const base = baseHours[service] || 2;
  
  // Add time for bedrooms and bathrooms
  const roomHours = bedrooms * 0.5 + bathrooms * 0.5;
  
  return Math.round((base + roomHours) * 10) / 10; // Round to 1 decimal
}

/**
 * Get weekly earnings data for the current cleaner
 */
export async function getCleanerWeeklyEarnings(): Promise<{
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
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    // Calculate week range (Monday to Sunday) - same logic as main calculation
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
      weekStartStr: formatDate(weekStart),
      weekEndStr: formatDate(weekEnd),
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

  const supabase = await createClient();
  
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

  // Fetch all bookings for this cleaner
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", cleaner.cleanerId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly earnings: ${error.message}`);
  }

  const bookings = (data || []).map(mapDatabaseToBooking);
  
  // Filter completed jobs for this week
  const completedJobs = bookings.filter((b) => {
    if (b.status !== "completed") return false;
    if (!b.scheduledDate) return false;
    const scheduledDate = new Date(b.scheduledDate);
    return scheduledDate >= weekStart && scheduledDate <= weekEnd;
  });

  // Filter upcoming jobs for this week
  const upcomingJobs = bookings.filter((b) => {
    if (b.status === "completed" || b.status === "cancelled") return false;
    if (!b.scheduledDate) return false;
    const scheduledDate = new Date(b.scheduledDate);
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
    .reduce((sum, b) => {
      // Use cleaner_earnings if available (already includes tip), otherwise fallback
      if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
        return sum + b.cleanerEarnings;
      }
      // Fallback: use totalAmount - tip (for backward compatibility)
      return sum + (b.totalAmount - (b.tip || 0));
    }, 0);
  const totalAmount = earningsTotal;

  // Calculate upcoming jobs
  const upcomingJobsCount = upcomingJobs.length;
  const upcomingHours = upcomingJobs.reduce((sum, b) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  const estimatedEarnings = upcomingJobs.reduce((sum, b) => {
    // Use cleaner_earnings if available, otherwise fallback to totalAmount
    if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
      return sum + b.cleanerEarnings;
    }
    // Fallback: use totalAmount (for backward compatibility)
    return sum + (b.totalAmount || 0);
  }, 0);

  return {
    weekStart,
    weekEnd,
    weekStartStr: formatDate(weekStart),
    weekEndStr: formatDate(weekEnd),
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
 * Get historical earnings data for the current cleaner
 */
export async function getCleanerHistoricalEarnings(): Promise<{
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
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    return {
      totalJobs: 0,
      totalHours: 0,
      totalTips: 0,
      totalEarnings: 0,
      totalAmount: 0,
      monthlyData: [],
    };
  }

  const supabase = await createClient();
  
  // Fetch all completed bookings with completed payment status for this cleaner
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", cleaner.cleanerId)
    .eq("payment_status", "completed")
    .order("scheduled_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch historical earnings: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      totalJobs: 0,
      totalHours: 0,
      totalTips: 0,
      totalEarnings: 0,
      totalAmount: 0,
      monthlyData: [],
    };
  }

  const bookings = data.map(mapDatabaseToBooking);

  // Group by month
  const monthlyMap = new Map<string, Booking[]>();

  bookings.forEach((booking) => {
    if (!booking.scheduledDate) {
      return;
    }
    try {
      const date = new Date(booking.scheduledDate);
      if (isNaN(date.getTime())) {
        return;
      }
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, []);
      }
      monthlyMap.get(monthKey)!.push(booking);
    } catch (err) {
      console.error("Error processing booking:", booking.id, err);
    }
  });

  // Convert to array and calculate totals for each month
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([monthKey, jobs]) => {
      const firstJob = jobs[0];
      const date = new Date(firstJob.scheduledDate!);
      const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const hours = jobs.reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
      const tips = jobs.reduce((sum, b) => sum + (b.tip || 0), 0);
      const earnings = jobs
        .filter((b) => b.paymentStatus === "completed")
        .reduce((sum, b) => {
          // Use cleaner_earnings if available (already includes tip), otherwise fallback
          if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
            return sum + b.cleanerEarnings;
          }
          // Fallback: use totalAmount - tip (for backward compatibility)
          return sum + (b.totalAmount - (b.tip || 0));
        }, 0);
      const total = earnings;

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
    })
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // Sort by most recent first

  // Calculate overall totals
  const totalJobs = bookings.length;
  const totalHours = bookings.reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
  const totalTips = bookings.reduce((sum, b) => sum + (b.tip || 0), 0);
  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === "completed")
    .reduce((sum, b) => {
      // Use cleaner_earnings if available (already includes tip), otherwise fallback
      if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
        return sum + b.cleanerEarnings;
      }
      // Fallback: use totalAmount - tip (for backward compatibility)
      return sum + (b.totalAmount - (b.tip || 0));
    }, 0);
  const totalAmount = totalEarnings;

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
 * Format date as "Wed 17 Dec 2025"
 */
function formatDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const day = days[date.getDay()];
  const dayNum = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${dayNum} ${month} ${year}`;
}

/**
 * Update booking status (for cleaner)
 */
export async function updateCleanerBookingStatus(
  reference: string,
  status: Booking["status"]
): Promise<void> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    throw new Error("Not authenticated as cleaner");
  }

  const supabase = await createClient();
  
  // Verify booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("assigned_cleaner_id")
    .eq("booking_reference", reference)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.assigned_cleaner_id !== cleaner.cleanerId) {
    throw new Error("Not authorized to update this booking");
  }

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
 * Accept a booking (for cleaner)
 * Sets cleaner_response to 'accepted' and status to 'confirmed'
 */
export async function acceptBooking(reference: string): Promise<void> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    throw new Error("Not authenticated as cleaner");
  }

  const supabase = await createClient();
  
  // Verify booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("assigned_cleaner_id, status")
    .eq("booking_reference", reference)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.assigned_cleaner_id !== cleaner.cleanerId) {
    throw new Error("Not authorized to accept this booking");
  }

  // Only allow accepting if status is pending
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be accepted");
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      cleaner_response: "accepted",
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to accept booking: ${error.message}`);
  }
}

/**
 * Decline a booking (for cleaner)
 * Sets cleaner_response to 'declined' and unassigns the cleaner
 */
export async function declineBooking(reference: string): Promise<void> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    throw new Error("Not authenticated as cleaner");
  }

  const supabase = await createClient();
  
  // Verify booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("assigned_cleaner_id, status")
    .eq("booking_reference", reference)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.assigned_cleaner_id !== cleaner.cleanerId) {
    throw new Error("Not authorized to decline this booking");
  }

  // Only allow declining if status is pending
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be declined");
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      cleaner_response: "declined",
      assigned_cleaner_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to decline booking: ${error.message}`);
  }
}

/**
 * Update job progress (for cleaner)
 * Validates the transition and updates job_progress field
 */
export async function updateJobProgress(
  reference: string,
  progress: "on-my-way" | "arrived" | "started"
): Promise<void> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    throw new Error("Not authenticated as cleaner");
  }

  const supabase = await createClient();
  
  // Verify booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("assigned_cleaner_id, status, job_progress, scheduled_date")
    .eq("booking_reference", reference)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.assigned_cleaner_id !== cleaner.cleanerId) {
    throw new Error("Not authorized to update this booking");
  }

  // Validate that booking is confirmed and scheduled for today
  if (booking.status !== "confirmed" && booking.status !== "in-progress") {
    throw new Error("Job progress can only be updated for confirmed or in-progress bookings");
  }

  // Check if booking is scheduled for today
  const today = new Date().toISOString().split('T')[0];
  if (booking.scheduled_date !== today) {
    throw new Error("Job progress can only be updated for bookings scheduled today");
  }

  // Validate progress transitions
  const currentProgress = booking.job_progress;
  if (progress === "on-my-way" && currentProgress !== null) {
    throw new Error("Invalid progress transition");
  }
  if (progress === "arrived" && currentProgress !== "on-my-way") {
    throw new Error("Must mark 'On My Way' before 'Arrived'");
  }
  if (progress === "started" && currentProgress !== "arrived") {
    throw new Error("Must mark 'Arrived' before 'Start Job'");
  }

  // Update job progress
  // If progress is "started", also update status to "in-progress"
  const updateData: any = {
    job_progress: progress,
    updated_at: new Date().toISOString(),
  };

  if (progress === "started") {
    updateData.status = "in-progress";
  }

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to update job progress: ${error.message}`);
  }
}

/**
 * Complete job (for cleaner)
 * Updates status to completed
 */
export async function completeJob(reference: string): Promise<void> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    throw new Error("Not authenticated as cleaner");
  }

  const supabase = await createClient();
  
  // Verify booking is assigned to this cleaner
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("assigned_cleaner_id, status, scheduled_date")
    .eq("booking_reference", reference)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.assigned_cleaner_id !== cleaner.cleanerId) {
    throw new Error("Not authorized to complete this booking");
  }

  // Only allow completing if status is in-progress
  if (booking.status !== "in-progress") {
    throw new Error("Only in-progress bookings can be completed");
  }

  // Check if booking is scheduled for today
  const today = new Date().toISOString().split('T')[0];
  if (booking.scheduled_date !== today) {
    throw new Error("Job can only be completed for bookings scheduled today");
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("booking_reference", reference);

  if (error) {
    throw new Error(`Failed to complete job: ${error.message}`);
  }
}

/**
 * Get booking by reference (for cleaner)
 */
export async function getCleanerBookingByReference(
  reference: string
): Promise<Booking | null> {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    return null;
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_reference", reference)
    .eq("assigned_cleaner_id", cleaner.cleanerId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data ? mapDatabaseToBooking(data) : null;
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
    firstName: data.contact_first_name,
    lastName: data.contact_last_name,
    email: data.contact_email,
    phone: data.contact_phone,
    discountCode: data.discount_code,
    tip: data.tip_amount || 0,
    totalAmount: data.total_amount,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    cleanerResponse: data.cleaner_response || null,
    jobProgress: data.job_progress || null,
    createdAt: data.created_at,
    // Price breakdown fields
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    // Cleaner earnings fields
    cleanerEarnings: data.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: data.cleaner_earnings_percentage ?? undefined,
  };
}
