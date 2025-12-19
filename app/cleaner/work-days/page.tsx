import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getWorkDays } from "@/app/actions/cleaner-work-days";
import WorkDaysForm from "@/components/cleaner/WorkDaysForm";

export const dynamic = "force-dynamic";

export default async function CleanerWorkDaysPage() {
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

  // Fetch current work days
  const workDaysResult = await getWorkDays();
  const initialWorkDays = workDaysResult.data || {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Work Days
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Select the days of the week you're available for cleaning jobs
          </p>
        </div>

        {/* Work Days Form */}
        <WorkDaysForm initialWorkDays={initialWorkDays} />
      </div>
    </div>
  );
}
