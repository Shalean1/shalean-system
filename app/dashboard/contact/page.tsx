import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/storage/profile-supabase";
import ContactForm from "@/components/dashboard/ContactForm";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default async function ContactPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile();
  const displayName = profile?.firstName || profile?.fullName || "";
  const displayEmail = profile?.email || user.email || "";
  const displayPhone = profile?.phone || "";

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Contact Us
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Get in touch with our support team - we're here to help!
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
            <a
              href="tel:+27871535250"
              className="text-blue-600 hover:text-blue-700 font-medium text-lg"
            >
              +27 87 153 5250
            </a>
            <p className="text-sm text-gray-600 mt-2">Call us anytime</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <a
              href="mailto:support@shalean.com"
              className="text-blue-600 hover:text-blue-700 font-medium text-lg break-all"
            >
              support@shalean.com
            </a>
            <p className="text-sm text-gray-600 mt-2">We respond within 24 hours</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-700 text-sm">
              39 Harvey Road<br />
              Claremont, Cape Town 7708<br />
              Western Cape, South Africa
            </p>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Operating Hours
              </h3>
              <p className="text-gray-700">
                <strong>24/7 Operation</strong>
                <br />
                We're available around the clock, every day of the week, including holidays.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                Contact us anytime to book your preferred time slot or get support.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <ContactForm
              initialName={displayName}
              initialEmail={displayEmail}
              initialPhone={displayPhone || undefined}
            />
          </div>

          {/* Additional Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Contact Us?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Get help with your bookings or account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Report issues or provide feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ask questions about our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Request custom cleaning solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Discuss partnership opportunities</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <a
                  href="/dashboard/help"
                  className="block text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  → Visit our Help Center
                </a>
                <a
                  href="/dashboard/bookings"
                  className="block text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  → View Your Bookings
                </a>
                <a
                  href="/dashboard/profile"
                  className="block text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  → Update Your Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

