import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCleanerById } from "@/lib/storage/cleaners-supabase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, CheckCircle, XCircle, User, Calendar, Award } from "lucide-react";
import RateCleanerButton from "@/components/dashboard/RateCleanerButton";
import AvailabilityDays from "@/components/dashboard/AvailabilityDays";

interface CleanerProfilePageProps {
  params: Promise<{ cleanerId: string }>;
}

export default async function CleanerProfilePage({ params }: CleanerProfilePageProps) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const { cleanerId } = await params;

  // Fetch cleaner
  const cleaner = await getCleanerById(cleanerId);

  if (!cleaner) {
    notFound();
  }

  // Check if this cleaner was previously booked by the user
  const { data: bookings } = await supabase
    .from("bookings")
    .select("cleaner_preference, status")
    .eq("contact_email", user.email || "")
    .eq("cleaner_preference", cleanerId)
    .eq("status", "completed");

  const isPreviouslyBooked = (bookings?.length || 0) > 0;

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/dashboard/cleaners"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cleaners
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {cleaner.avatar_url ? (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                  <Image
                    src={cleaner.avatar_url}
                    alt={cleaner.name}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <User className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
                </div>
              )}
              {/* Availability Badge */}
              <div className="absolute -bottom-2 -right-2">
                {cleaner.is_available ? (
                  <div className="bg-green-500 rounded-full p-2 border-4 border-white shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="bg-gray-400 rounded-full p-2 border-4 border-white shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Cleaner Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {cleaner.name}
                  </h1>
                  {isPreviouslyBooked && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Previously Booked
                    </span>
                  )}
                </div>
                {isPreviouslyBooked && (
                  <RateCleanerButton cleaner={cleaner} />
                )}
              </div>

              {/* Rating and Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {cleaner.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-semibold text-gray-900">
                      {cleaner.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({cleaner.total_jobs} {cleaner.total_jobs === 1 ? "job" : "jobs"})
                    </span>
                  </div>
                )}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    cleaner.is_available
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {cleaner.is_available ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Available
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Unavailable
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {cleaner.bio && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {cleaner.bio}
                </p>
              )}

              {/* Availability Days */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Available Days:</span>
                <AvailabilityDays 
                  availabilityDays={cleaner.availability_days} 
                  isAvailable={cleaner.is_available}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cleaner.rating ? cleaner.rating.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cleaner.total_jobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                cleaner.is_available ? "bg-green-100" : "bg-gray-100"
              }`}>
                <CheckCircle className={`w-5 h-5 ${
                  cleaner.is_available ? "text-green-600" : "text-gray-600"
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${
                  cleaner.is_available ? "text-green-600" : "text-gray-600"
                }`}>
                  {cleaner.is_available ? "Available" : "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Book This Cleaner</h2>
          <p className="text-gray-600 mb-4">
            Ready to book {cleaner.name} for your next cleaning service?
          </p>
          <Link
            href={`/booking/service/standard/details?cleaner=${cleanerId}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}









