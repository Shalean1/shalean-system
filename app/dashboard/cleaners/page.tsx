import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPreviouslyBookedCleaners, getAllCleaners } from "@/lib/storage/cleaners-supabase";
import CleanerCard from "@/components/dashboard/CleanerCard";
import CleanersViewToggle from "@/components/dashboard/CleanersViewToggle";
import { Users, History } from "lucide-react";

interface CleanersPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function CleanersPage({ searchParams }: CleanersPageProps) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const view = params.view || "previous";

  // Fetch both sets of cleaners
  const [previouslyBookedCleaners, allCleaners] = await Promise.all([
    getPreviouslyBookedCleaners(),
    getAllCleaners(),
  ]);

  // Determine which cleaners to display
  const cleanersToShow = view === "all" ? allCleaners : previouslyBookedCleaners;
  const isShowingAll = view === "all";

  // Create a set of previously booked cleaner IDs for highlighting
  const previouslyBookedIds = new Set(
    previouslyBookedCleaners.map((c) => c.cleaner_id)
  );

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Cleaners
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                {isShowingAll
                  ? "Browse all available cleaners"
                  : "View cleaners you've worked with before"}
              </p>
            </div>
            <Suspense fallback={<div className="w-48 h-10 bg-gray-100 rounded-lg animate-pulse" />}>
              <CleanersViewToggle />
            </Suspense>
          </div>
        </div>

        {/* Cleaners Grid */}
        {cleanersToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cleanersToShow.map((cleaner) => (
              <CleanerCard
                key={cleaner.id}
                cleaner={cleaner}
                isPreviouslyBooked={previouslyBookedIds.has(cleaner.cleaner_id)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            {isShowingAll ? (
              <>
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Cleaners Available
                </h3>
                <p className="text-gray-600 mb-6">
                  There are currently no active cleaners in the system.
                </p>
              </>
            ) : (
              <>
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Previously Booked Cleaners
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't completed any bookings with specific cleaners yet. Once you book and complete a service with a cleaner, they'll appear here for easy rebooking.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/dashboard/cleaners?view=all"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All Cleaners
                  </a>
                  <a
                    href="/booking/service/standard/details"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Book a Service
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
