import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingCounts, getSpendingAnalytics } from "@/lib/storage/bookings-supabase";
import { getUserDisplayName } from "@/lib/storage/profile-supabase";
import SpendingSummary from "@/components/dashboard/SpendingSummary";
import ServiceInsights from "@/components/dashboard/ServiceInsights";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch analytics data
  const [counts, spendingAnalytics, displayName] = await Promise.all([
    getBookingCounts(),
    getSpendingAnalytics(),
    getUserDisplayName(),
  ]);

  return (
    <div className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Analytics & Insights
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Detailed spending overview and service preferences for {displayName}
            </p>
          </div>
        </div>

        {/* Spending Summary & Service Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <SpendingSummary
              totalSpent={spendingAnalytics.totalSpent}
              averageBookingValue={spendingAnalytics.averageBookingValue}
              totalPaid={spendingAnalytics.totalPaid}
              pendingPayments={spendingAnalytics.pendingPayments}
              completedBookings={spendingAnalytics.completedBookings}
            />
          </div>
          <div className="lg:col-span-1">
            <ServiceInsights
              mostBookedService={spendingAnalytics.mostBookedService}
              favoriteFrequency={spendingAnalytics.favoriteFrequency}
              totalBookings={counts.upcoming + counts.today + counts.new + counts.past}
            />
          </div>
        </div>
      </div>
    </div>
  );
}









