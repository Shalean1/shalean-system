import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { User, Phone, Mail, IdCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CleanerInfoPage() {
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
    // Not a cleaner account, redirect to regular login
    redirect("/auth/login");
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Info
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View your cleaner account information
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-blue-600">
                    {cleaner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{cleaner.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="text-lg font-medium text-gray-900">{cleaner.phone}</p>
              </div>
              {cleaner.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </p>
                  <p className="text-lg font-medium text-gray-900">{cleaner.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-blue-600" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cleaner ID</p>
                <p className="text-lg font-medium text-gray-900 font-mono">{cleaner.cleanerId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">User ID</p>
                <p className="text-lg font-medium text-gray-900 font-mono text-sm break-all">{cleaner.id}</p>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <p className="text-sm text-blue-800">
              <strong>Need to update your information?</strong> Visit the{" "}
              <a href="/cleaner/change-info" className="underline font-semibold hover:text-blue-900">
                Change My Info
              </a>{" "}
              page or{" "}
              <a href="/cleaner/profile" className="underline font-semibold hover:text-blue-900">
                Account Settings
              </a>{" "}
              to update your profile details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
