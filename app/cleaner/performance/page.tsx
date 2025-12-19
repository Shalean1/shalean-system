import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getCleanerBookings } from "@/lib/storage/cleaner-bookings-supabase";
import { Booking } from "@/lib/types/booking";
import { Star, TrendingUp, Calendar, Clock, CheckCircle, Award, Target } from "lucide-react";

export const dynamic = "force-dynamic";

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
 * Get performance metrics for the current cleaner
 */
async function getPerformanceMetrics() {
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner || !cleaner.cleanerId) {
    return null;
  }

  const supabase = await createClient();
  
  // Get cleaner profile data (rating, total_jobs)
  const { data: cleanerData } = await supabase
    .from("cleaners")
    .select("rating, total_jobs")
    .eq("cleaner_id", cleaner.cleanerId)
    .single();

  // Get all bookings
  const bookings = await getCleanerBookings();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Calculate date ranges
  const thisWeekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
  thisWeekStart.setDate(today.getDate() + diff);
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

  // Filter bookings by period
  const allTimeBookings = bookings;
  const thisWeekBookings = bookings.filter((b) => {
    if (!b.scheduledDate) return false;
    const scheduledDate = new Date(b.scheduledDate);
    return scheduledDate >= thisWeekStart;
  });
  const thisMonthBookings = bookings.filter((b) => {
    if (!b.scheduledDate) return false;
    const scheduledDate = new Date(b.scheduledDate);
    return scheduledDate >= thisMonthStart;
  });
  const lastMonthBookings = bookings.filter((b) => {
    if (!b.scheduledDate) return false;
    const scheduledDate = new Date(b.scheduledDate);
    return scheduledDate >= lastMonthStart && scheduledDate <= lastMonthEnd;
  });

  // Calculate metrics
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
  const totalBookings = bookings.length;
  
  const completionRate = totalBookings > 0 
    ? Math.round((completedBookings.length / totalBookings) * 100)
    : 0;

  // Calculate hours
  const totalHours = completedBookings.reduce((sum, b) => {
    return sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms);
  }, 0);
  
  const thisWeekHours = thisWeekBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);
  
  const thisMonthHours = thisMonthBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + estimateJobHours(b.service, b.bedrooms, b.bathrooms), 0);

  // Calculate jobs counts
  const thisWeekCompleted = thisWeekBookings.filter((b) => b.status === "completed").length;
  const thisMonthCompleted = thisMonthBookings.filter((b) => b.status === "completed").length;
  const lastMonthCompleted = lastMonthBookings.filter((b) => b.status === "completed").length;

  // Calculate average hours per job
  const avgHoursPerJob = completedBookings.length > 0
    ? Math.round((totalHours / completedBookings.length) * 10) / 10
    : 0;

  // Calculate tips
  const totalTips = completedBookings.reduce((sum, b) => sum + (b.tip || 0), 0);
  const thisMonthTips = thisMonthBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.tip || 0), 0);

  // Calculate month-over-month change
  const monthChange = lastMonthCompleted > 0
    ? Math.round(((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) * 100)
    : thisMonthCompleted > 0 ? 100 : 0;

  return {
    rating: cleanerData?.rating ? Number(cleanerData.rating) : null,
    totalJobs: cleanerData?.total_jobs || completedBookings.length,
    completedJobs: completedBookings.length,
    cancelledJobs: cancelledBookings.length,
    completionRate,
    totalHours,
    thisWeekHours,
    thisMonthHours,
    avgHoursPerJob,
    thisWeekCompleted,
    thisMonthCompleted,
    lastMonthCompleted,
    monthChange,
    totalTips,
    thisMonthTips,
  };
}

export default async function CleanerPerformancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/cleaner/login");
  }

  // Check if user is a cleaner
  const cleaner = await getCurrentCleaner();

  if (!cleaner) {
    redirect("/cleaner/login");
  }

  // Fetch performance metrics
  const metrics = await getPerformanceMetrics();

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Unable to load performance data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
          </div>
          <p className="text-gray-600">
            Track your performance metrics and see how you&apos;re doing.
          </p>
        </div>

        {/* Overall Rating Card */}
        {metrics.rating !== null && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Overall Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(metrics.rating!)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-3xl font-bold text-gray-900">
                    {metrics.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on {metrics.totalJobs} {metrics.totalJobs === 1 ? "job" : "jobs"}
                </p>
              </div>
              <Award className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.completionRate}%</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{metrics.completedJobs}</span> completed out of{" "}
              <span className="font-medium">{metrics.completedJobs + metrics.cancelledJobs}</span> total jobs
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours Worked</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalHours.toFixed(1)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Average <span className="font-medium">{metrics.avgHoursPerJob}</span> hours per job
            </div>
          </div>

          {/* This Month Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.thisMonthCompleted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {metrics.monthChange !== 0 && (
                <div className={`flex items-center gap-1 ${metrics.monthChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className={`w-4 h-4 ${metrics.monthChange < 0 ? "rotate-180" : ""}`} />
                  <span className="font-medium">{Math.abs(metrics.monthChange)}%</span>
                </div>
              )}
              <span className="text-gray-600">
                vs last month ({metrics.lastMonthCompleted})
              </span>
            </div>
          </div>

          {/* This Week Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.thisWeekCompleted}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{metrics.thisWeekHours.toFixed(1)}</span> hours completed
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Jobs Completed</span>
              <span className="text-gray-900 font-semibold">{metrics.completedJobs}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Jobs Cancelled</span>
              <span className="text-gray-900 font-semibold">{metrics.cancelledJobs}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">This Month Hours</span>
              <span className="text-gray-900 font-semibold">{metrics.thisMonthHours.toFixed(1)} hours</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Tips Received</span>
              <span className="text-gray-900 font-semibold">R {metrics.totalTips.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">This Month Tips</span>
              <span className="text-gray-900 font-semibold">R {metrics.thisMonthTips.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Maintain a high completion rate by showing up on time and completing all scheduled jobs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Consistent performance helps build your rating and attracts more bookings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Track your weekly and monthly progress to identify areas for improvement.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
