"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types/booking";
import { DollarSign, Mail, Info, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabType = "this-week" | "history";

interface WeeklyData {
  weekStart: Date;
  weekEnd: Date;
  weekStartStr: string;
  weekEndStr: string;
  completedJobs: Booking[];
  upcomingJobs: Booking[];
  jobsCount: number;
  totalHours: number;
  tipsTotal: number;
  baseEarningsTotal: number;
  earningsTotal: number;
  totalAmount: number;
  upcomingJobsCount: number;
  upcomingHours: number;
  estimatedEarnings: number;
}

interface HistoricalData {
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
}

export default function CleanerEarningsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("this-week");
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`);
        }
        
        if (!user) {
          router.push("/cleaner/login");
          return;
        }

        // Get cleaner ID from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("cleaner_id")
          .eq("id", user.id)
          .not("cleaner_id", "is", null)
          .single();

        if (profileError || !profileData || !profileData.cleaner_id) {
          router.push("/cleaner/login");
          return;
        }

        const cleanerId = profileData.cleaner_id;

        if (activeTab === "this-week") {
          const data = await fetchWeeklyData(supabase, cleanerId);
          setWeeklyData(data);
        } else {
          const data = await fetchHistoricalData(supabase, cleanerId);
          setHistoricalData(data);
          // Expand first month by default
          if (data.monthlyData.length > 0) {
            setExpandedMonths(new Set([data.monthlyData[0].monthKey]));
          }
        }
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        setError(error instanceof Error ? error.message : "Failed to load earnings data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab, router, retryKey]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("this-week")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "this-week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="hidden sm:inline">This Week&apos;s Earnings</span>
            <span className="sm:hidden">This Week</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="hidden sm:inline">Earnings History</span>
            <span className="sm:hidden">History</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading earnings data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 font-medium mb-2">Error Loading Data</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setRetryKey((prev) => prev + 1);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : activeTab === "this-week" ? (
          <ThisWeekView weeklyData={weeklyData} />
        ) : (
          <HistoryView historicalData={historicalData} expandedMonths={expandedMonths} toggleMonth={toggleMonth} />
        )}
      </div>
    </div>
  );
}

async function fetchWeeklyData(supabase: any, cleanerId: string): Promise<WeeklyData> {
  // Calculate week range (Monday to Sunday)
  // Normalize to local timezone to avoid timezone issues
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Fetch all bookings for this cleaner
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", cleanerId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly earnings: ${error.message}`);
  }

  const bookings = (data || []).map(mapDatabaseToBooking);

  // Helper function to normalize date string to Date object at start of day (local timezone)
  const normalizeDate = (dateStr: string): Date => {
    const date = new Date(dateStr);
    // Normalize to start of day in local timezone
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return normalized;
  };

  // Filter completed jobs for this week
  // Only include jobs with both status === "completed" AND paymentStatus === "completed"
  const completedJobs = bookings.filter((b: Booking) => {
    // Must have both status and payment status as completed
    if (b.status !== "completed" || b.paymentStatus !== "completed") return false;
    if (!b.scheduledDate) return false;
    
    // Normalize scheduled date to start of day for accurate comparison
    const scheduledDate = normalizeDate(b.scheduledDate);
    const weekStartNormalized = normalizeDate(weekStart.toISOString());
    const weekEndNormalized = normalizeDate(weekEnd.toISOString());
    
    return scheduledDate >= weekStartNormalized && scheduledDate <= weekEndNormalized;
  });

  // Filter upcoming jobs for this week
  const upcomingJobs = bookings.filter((b: Booking) => {
    if (b.status === "completed" || b.status === "cancelled") return false;
    if (!b.scheduledDate) return false;
    
    // Normalize scheduled date to start of day for accurate comparison
    const scheduledDate = normalizeDate(b.scheduledDate);
    const weekStartNormalized = normalizeDate(weekStart.toISOString());
    const weekEndNormalized = normalizeDate(weekEnd.toISOString());
    
    return scheduledDate >= weekStartNormalized && scheduledDate <= weekEndNormalized;
  });

  // Calculate totals for completed jobs
  // Since completedJobs already filters for paymentStatus === "completed", we don't need to filter again
  const jobsCount = completedJobs.length;
  const totalHours = completedJobs.reduce((sum: number, b: Booking) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  const tipsTotal = completedJobs.reduce((sum: number, b: Booking) => sum + (b.tip || 0), 0);
  
  // Calculate earnings total - cleanerEarnings already includes tips
  const earningsTotal = completedJobs.reduce((sum: number, b: Booking) => {
    // Use cleaner_earnings if available (already includes tip), otherwise fallback
    if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
      return sum + b.cleanerEarnings;
    }
    // Fallback: use totalAmount - tip (for backward compatibility)
    return sum + (b.totalAmount - (b.tip || 0));
  }, 0);
  
  // Calculate base earnings (earnings without tips)
  // Since cleanerEarnings includes tips, we subtract tips to get base earnings
  const baseEarningsTotal = completedJobs.reduce((sum: number, b: Booking) => {
    const tip = b.tip || 0;
    if (b.cleanerEarnings !== undefined && b.cleanerEarnings !== null) {
      // cleanerEarnings already includes tip, so subtract tip to get base
      return sum + (b.cleanerEarnings - tip);
    }
    // Fallback: use (totalAmount - tip) - tip = totalAmount - 2*tip
    // This matches the earningsTotal fallback logic (totalAmount - tip) but subtracts tip again for base
    return sum + (b.totalAmount - tip - tip);
  }, 0);
  
  const totalAmount = earningsTotal;

  // Calculate upcoming jobs
  const upcomingJobsCount = upcomingJobs.length;
  const upcomingHours = upcomingJobs.reduce((sum: number, b: Booking) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  const estimatedEarnings = upcomingJobs.reduce((sum: number, b: Booking) => {
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
    weekStartStr: formatWeekDate(weekStart),
    weekEndStr: formatWeekDate(weekEnd),
    completedJobs,
    upcomingJobs,
    jobsCount,
    totalHours,
    tipsTotal,
    baseEarningsTotal,
    earningsTotal,
    totalAmount,
    upcomingJobsCount,
    upcomingHours,
    estimatedEarnings,
  };
}

async function fetchHistoricalData(supabase: any, cleanerId: string): Promise<HistoricalData> {
  // Fetch all bookings with completed payment status for this cleaner
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("assigned_cleaner_id", cleanerId)
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

  bookings.forEach((booking: Booking) => {
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

      const hours = jobs.reduce((sum: number, b: Booking) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
      const tips = jobs.reduce((sum: number, b: Booking) => sum + (b.tip || 0), 0);
      const earnings = jobs
        .filter((b: Booking) => b.paymentStatus === "completed")
        .reduce((sum: number, b: Booking) => {
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
  const totalHours = bookings.reduce((sum: number, b: Booking) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
  const totalTips = bookings.reduce((sum: number, b: Booking) => sum + (b.tip || 0), 0);
  const totalEarnings = bookings
    .filter((b: Booking) => b.paymentStatus === "completed")
    .reduce((sum: number, b: Booking) => {
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

function ThisWeekView({ weeklyData }: { weeklyData: WeeklyData | null }) {
  if (!weeklyData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No earnings data available for this week.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">This Week&apos;s Earnings</h1>
        </div>

        {/* Date Range */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Dates:</span> {weeklyData.weekStartStr} - {weeklyData.weekEndStr}
          </p>
        </div>
      </div>

      {/* This Week's Totals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">This Week&apos;s Totals</h2>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Jobs</span>
            <span className="text-gray-900 font-medium">
              {weeklyData.jobsCount} ({weeklyData.totalHours.toFixed(1)} hours)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Earnings</span>
            <span className="text-gray-900 font-medium">
              R {weeklyData.baseEarningsTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Tips</span>
            <span className="text-gray-900 font-medium">R {weeklyData.tipsTotal.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Grand Total</span>
            <span className="text-gray-900 font-bold text-xl">R {weeklyData.totalAmount.toFixed(2)}</span>
          </div>
          
          {/* Earnings Percentage Info */}
          {weeklyData.completedJobs.length > 0 && weeklyData.completedJobs[0].cleanerEarningsPercentage && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>
                  Earnings Rate: {(weeklyData.completedJobs[0].cleanerEarningsPercentage * 100).toFixed(0)}%
                  {weeklyData.completedJobs[0].cleanerEarningsPercentage === 0.70 && (
                    <span className="ml-1 text-blue-600 font-medium">(Old Cleaner)</span>
                  )}
                  {weeklyData.completedJobs[0].cleanerEarningsPercentage === 0.60 && (
                    <span className="ml-1 text-green-600 font-medium">(New Cleaner)</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming This Week */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming This Week</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Jobs Upcoming</span>
            <span className="text-gray-900 font-medium">
              {weeklyData.upcomingJobsCount} ({weeklyData.upcomingHours.toFixed(1)} hours)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estimated Earnings</span>
            <span className="text-gray-900 font-medium">R {weeklyData.estimatedEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* This Week's Jobs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week&apos;s Jobs</h2>

        {weeklyData.completedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">{weeklyData.jobsCount} completed jobs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyData.completedJobs.map((job) => {
              const jobHours = estimateJobHours(job.service, job.bedrooms, job.bathrooms);
              return (
                <Link
                  key={job.id}
                  href={`/cleaner/bookings/${job.bookingReference}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {job.firstName} {job.lastName}
                        </span>
                        <span className="text-xs text-gray-500">{formatJobDate(job.scheduledDate!)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {job.streetAddress}
                        {job.aptUnit && `, ${job.aptUnit}`}, {job.suburb}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatServiceType(job.service)} • {jobHours} hours
                      </p>
                    </div>
                    <div className="text-right">
                      {job.cleanerEarnings !== undefined && job.cleanerEarnings !== null ? (
                        <>
                          <p className="font-semibold text-gray-900">R {job.cleanerEarnings.toFixed(2)}</p>
                          {job.tip && job.tip > 0 && (
                            <p className="text-xs text-blue-600">+R {job.tip.toFixed(2)} tip</p>
                          )}
                          {job.cleanerEarningsPercentage && (
                            <p className="text-xs text-gray-500">
                              {(job.cleanerEarningsPercentage * 100).toFixed(0)}% rate
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-900">R {job.totalAmount.toFixed(2)}</p>
                          {job.tip && job.tip > 0 && (
                            <p className="text-xs text-blue-600">+R {job.tip.toFixed(2)} tip</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function HistoryView({
  historicalData,
  expandedMonths,
  toggleMonth,
}: {
  historicalData: HistoricalData | null;
  expandedMonths: Set<string>;
  toggleMonth: (monthKey: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string>("");

  if (!historicalData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No historical earnings data available.</p>
      </div>
    );
  }

  if (historicalData.monthlyData.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No completed jobs found in your earnings history.</p>
      </div>
    );
  }

  // Filter data based on selected date
  const filteredData = useMemo(() => {
    if (!selectedDate) {
      return historicalData;
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);
    const filterDateStr = filterDate.toISOString().split('T')[0];

    // Filter jobs by date
    const filteredJobs = historicalData.monthlyData.flatMap(month => 
      month.jobs.filter(job => {
        if (!job.scheduledDate) return false;
        const jobDate = new Date(job.scheduledDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.toISOString().split('T')[0] === filterDateStr;
      })
    );

    if (filteredJobs.length === 0) {
      return {
        totalJobs: 0,
        totalHours: 0,
        totalTips: 0,
        totalEarnings: 0,
        totalAmount: 0,
        monthlyData: [],
      };
    }

    // Group filtered jobs by month
    const monthlyMap = new Map<string, Booking[]>();
    filteredJobs.forEach((job: Booking) => {
      if (!job.scheduledDate) return;
      const date = new Date(job.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, []);
      }
      monthlyMap.get(monthKey)!.push(job);
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([monthKey, jobs]) => {
        const firstJob = jobs[0];
        const date = new Date(firstJob.scheduledDate!);
        const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        const hours = jobs.reduce((sum: number, b: Booking) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
        const tips = jobs.reduce((sum: number, b: Booking) => sum + (b.tip || 0), 0);
        const earnings = jobs
          .filter((b: Booking) => b.paymentStatus === "completed")
          .reduce((sum: number, b: Booking) => {
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
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    const totalJobs = filteredJobs.length;
    const totalHours = filteredJobs.reduce((sum: number, b: Booking) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
    const totalTips = filteredJobs.reduce((sum: number, b: Booking) => sum + (b.tip || 0), 0);
    const totalEarnings = filteredJobs
      .filter((b: Booking) => b.paymentStatus === "completed")
      .reduce((sum: number, b: Booking) => {
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
  }, [selectedDate, historicalData]);

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Earnings History</h1>
        </div>
        
        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Choose a date to see your earnings:
          </label>
          <input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Overall Totals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDate ? "Filtered Totals" : "All-Time Totals"}
          </h2>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Jobs</span>
            <span className="text-gray-900 font-medium">
              {filteredData.totalJobs} ({filteredData.totalHours.toFixed(1)} hours)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Earnings</span>
            <span className="text-gray-900 font-medium">
              R {(filteredData.totalEarnings - filteredData.totalTips).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Tips</span>
            <span className="text-gray-900 font-medium">R {filteredData.totalTips.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Grand Total</span>
            <span className="text-gray-900 font-bold text-xl">R {filteredData.totalAmount.toFixed(2)}</span>
          </div>
          
          {/* Earnings Percentage Info */}
          {filteredData.monthlyData.length > 0 && 
           filteredData.monthlyData[0].jobs.length > 0 && 
           filteredData.monthlyData[0].jobs[0].cleanerEarningsPercentage && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>
                  Earnings Rate: {(filteredData.monthlyData[0].jobs[0].cleanerEarningsPercentage * 100).toFixed(0)}%
                  {filteredData.monthlyData[0].jobs[0].cleanerEarningsPercentage === 0.70 && (
                    <span className="ml-1 text-blue-600 font-medium">(Old Cleaner)</span>
                  )}
                  {filteredData.monthlyData[0].jobs[0].cleanerEarningsPercentage === 0.60 && (
                    <span className="ml-1 text-green-600 font-medium">(New Cleaner)</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      {filteredData.monthlyData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {selectedDate ? "No earnings found for the selected date." : "No completed jobs found in your earnings history."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.monthlyData.map((monthData) => {
          const isExpanded = expandedMonths.has(monthData.monthKey);
          return (
            <div key={monthData.monthKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Month Header - Clickable */}
              <button
                onClick={() => toggleMonth(monthData.monthKey)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{monthData.month}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {monthData.jobsCount} {monthData.jobsCount === 1 ? "job" : "jobs"} • {monthData.hours.toFixed(1)} hours
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">R {monthData.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {monthData.tips > 0 && `+R ${monthData.tips.toFixed(2)} tips`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Month Details - Expandable */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Earnings</p>
                      <p className="text-sm font-medium text-gray-900">R {monthData.earnings.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tips</p>
                      <p className="text-sm font-medium text-gray-900">R {monthData.tips.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Jobs</h4>
                    {monthData.jobs.map((job) => {
                      const jobHours = estimateJobHours(job.service, job.bedrooms, job.bathrooms);
                      return (
                        <Link
                          key={job.id}
                          href={`/cleaner/bookings/${job.bookingReference}`}
                          className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {job.firstName} {job.lastName}
                                </span>
                                <span className="text-xs text-gray-500">{formatJobDate(job.scheduledDate!)}</span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {job.streetAddress}
                                {job.aptUnit && `, ${job.aptUnit}`}, {job.suburb}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatServiceType(job.service)} • {jobHours} hours
                              </p>
                            </div>
                            <div className="text-right">
                              {job.cleanerEarnings !== undefined && job.cleanerEarnings !== null ? (
                                <>
                                  <p className="font-semibold text-gray-900 text-sm">R {job.cleanerEarnings.toFixed(2)}</p>
                                  {job.tip && job.tip > 0 && (
                                    <p className="text-xs text-blue-600">+R {job.tip.toFixed(2)} tip</p>
                                  )}
                                  {job.cleanerEarningsPercentage && (
                                    <p className="text-xs text-gray-500">
                                      {(job.cleanerEarningsPercentage * 100).toFixed(0)}% rate
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="font-semibold text-gray-900 text-sm">R {job.totalAmount.toFixed(2)}</p>
                                  {job.tip && job.tip > 0 && (
                                    <p className="text-xs text-blue-600">+R {job.tip.toFixed(2)} tip</p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </>
  );
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
    // Price breakdown fields
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    // Cleaner earnings fields
    cleanerEarnings: data.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: data.cleaner_earnings_percentage ?? undefined,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    createdAt: data.created_at,
  };
}

/**
 * Format date as "Wed 17 Dec"
 */
function formatJobDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Format service type for display
 */
function formatServiceType(service: string): string {
  return service
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
