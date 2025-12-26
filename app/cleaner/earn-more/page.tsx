import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import Link from "next/link";
import {
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  Share2,
  UserPlus,
  CheckCircle,
  Lightbulb,
  Target,
  DollarSign,
  Clock,
  Award,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EarnMorePage() {
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

  return (
    <div className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600 text-white shadow-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Earn More
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Tips and strategies to maximize your earnings with Bokkie
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/cleaner/share-profile"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Share Profile</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Share your profile to get more bookings from customers
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Get started <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/cleaner/work-days"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Set Work Days</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Update your availability to get more job matches
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Update now <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/cleaner/areas"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Add Areas</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add more service areas to increase your job opportunities
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Manage areas <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/cleaner/refer-friend"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Refer Friends</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Refer other cleaners and earn rewards when they join
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Start referring <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Tips Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Tips to Maximize Your Earnings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tip 1 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Maintain High Ratings
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Customers prefer cleaners with high ratings. Always provide
                    excellent service, be punctual, and communicate clearly to
                    earn 5-star reviews.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Arrive on time or early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Pay attention to details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Be friendly and professional</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Maximize Your Availability
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    The more days you&apos;re available, the more bookings you
                    can get. Update your work days regularly to match your
                    schedule.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Set multiple work days per week</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Be flexible with time slots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Update availability in advance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expand Your Service Areas
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Adding more areas increases your potential customer base.
                    Consider areas close to your current locations.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Add nearby suburbs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Consider high-demand areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Update areas based on demand</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip 4 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                  <Share2 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Promote Your Profile
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Share your profile link on social media, WhatsApp, and with
                    friends to get direct bookings from customers.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Share on social media</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Send to friends and family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Ask satisfied customers to share</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip 5 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Respond Quickly
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Quick responses to booking requests increase your chances of
                    getting the job. Customers appreciate fast communication.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Check notifications regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Respond within a few hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Confirm bookings promptly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip 6 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-pink-100 rounded-lg flex-shrink-0">
                  <Award className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Build Repeat Customers
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Regular customers provide steady income. Provide exceptional
                    service to encourage repeat bookings.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Remember customer preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Go the extra mile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Maintain consistent quality</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Strategies */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Earnings Strategies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Set Clear Goals
              </h3>
              <p className="text-sm text-gray-600">
                Set weekly or monthly earnings targets. Track your progress in
                the earnings section and adjust your availability accordingly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Optimize Your Schedule
              </h3>
              <p className="text-sm text-gray-600">
                Analyze which days and times get the most bookings. Focus your
                availability on high-demand periods to maximize earnings.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Track Performance
              </h3>
              <p className="text-sm text-gray-600">
                Regularly review your earnings, ratings, and booking patterns.
                Use this data to identify opportunities for improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Increase Your Earnings?
              </h2>
              <p className="text-blue-100">
                Start implementing these tips today and watch your bookings grow
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/cleaner/earnings"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                View Earnings
              </Link>
              <Link
                href="/cleaner/bookings"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                View Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
