import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getAreas } from "@/app/actions/cleaner-areas";
import AreasForm from "@/components/cleaner/AreasForm";
import { ServiceLocation } from "@/lib/supabase/booking-data";

export const dynamic = "force-dynamic";

async function getServiceLocationsServer(): Promise<ServiceLocation[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('service_locations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching service locations:', error);
    return [];
  }
}

export default async function CleanerAreasPage() {
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

  // Fetch current areas and available locations
  const [areasResult, availableLocations] = await Promise.all([
    getAreas(),
    getServiceLocationsServer(),
  ]);

  const initialAreas = areasResult.success ? areasResult.data || [] : [];

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Service Areas
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Select the areas where you're available to provide cleaning services
          </p>
        </div>

        {/* Areas Form */}
        <AreasForm 
          initialAreas={initialAreas} 
          availableLocations={availableLocations}
        />
      </div>
    </div>
  );
}
