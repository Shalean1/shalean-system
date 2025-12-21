import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingByReference } from "@/app/actions/admin-bookings";
import { getAdditionalServicesServer } from "@/lib/supabase/booking-data-server";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentStatusBadge from "@/components/dashboard/PaymentStatusBadge";
import AdminStatusUpdateDropdown from "@/components/admin/AdminStatusUpdateDropdown";
import AdminEditBookingButton from "@/components/admin/AdminEditBookingButton";
import AdminDeleteBookingButton from "@/components/admin/AdminDeleteBookingButton";
import SendPaymentLinkButton from "@/components/admin/SendPaymentLinkButton";
import AssignTeamCleaners from "@/components/admin/AssignTeamCleaners";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, User, Phone, Mail, Home, Building } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  // Decode the reference in case it's URL encoded
  const decodedReference = decodeURIComponent(reference);
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Get booking by reference (admin access - no user restriction)
  let booking = await getBookingByReference(decodedReference);
  
  // If not found with decoded reference, try with original reference
  if (!booking && decodedReference !== reference) {
    booking = await getBookingByReference(reference);
  }

  if (!booking) {
    notFound();
  }

  // Fetch additional services to map extras IDs to names
  let extrasMap: Record<string, string> = {};
  try {
    const additionalServices = await getAdditionalServicesServer();
    additionalServices.forEach((service) => {
      extrasMap[service.service_id] = service.name;
    });
  } catch (error) {
    console.error("Failed to fetch additional services:", error);
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatFrequency = (frequency: string) => {
    if (frequency === "one-time") return "One-time";
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const formatCleanerPreference = (preference: string) => {
    if (preference === "no-preference") return "No preference";
    return preference
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formatServiceType(booking.service)}
              </h1>
              <p className="text-gray-600">
                Booking Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <AdminStatusUpdateDropdown booking={booking} />
              <StatusBadge status={booking.status} />
              <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 flex-wrap">
            <SendPaymentLinkButton booking={booking} />
            <AdminEditBookingButton booking={booking} />
            <AdminDeleteBookingButton booking={booking} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.scheduledDate)}
                </p>
              </div>
              {booking.scheduledTime && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(booking.scheduledTime)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Frequency</p>
                <p className="font-medium text-gray-900">{formatFrequency(booking.frequency)}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bedrooms & Bathrooms</p>
                <p className="font-medium text-gray-900">
                  {booking.bedrooms} bedroom{booking.bedrooms !== 1 ? "s" : ""}, {booking.bathrooms} bathroom{booking.bathrooms !== 1 ? "s" : ""}
                </p>
              </div>
              {booking.extras && booking.extras.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Additional Services</p>
                  <ul className="list-disc list-inside space-y-1">
                    {booking.extras.map((extraId) => (
                      <li key={extraId} className="font-medium text-gray-900 text-sm">
                        {extrasMap[extraId] || extraId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {booking.cleanerPreference && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cleaner/Team Preference</p>
                  <p className="font-medium text-gray-900">
                    {formatCleanerPreference(booking.cleanerPreference)}
                  </p>
                </div>
              )}
              {booking.teamId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned Team</p>
                  <p className="font-medium text-gray-900">
                    {formatCleanerPreference(booking.teamId)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Address
          </h2>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {booking.streetAddress}
              {booking.aptUnit && `, ${booking.aptUnit}`}
            </p>
            <p className="text-gray-600">
              {booking.suburb}, {booking.city}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{booking.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{booking.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {booking.firstName} {booking.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Cleaner Assignment */}
        {booking.teamId && (
          <div className="mb-6">
            <AssignTeamCleaners booking={booking} />
          </div>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{booking.specialInstructions}</p>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="space-y-3">
            {booking.subtotal !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">R{booking.subtotal.toFixed(2)}</span>
              </div>
            )}
            {booking.frequencyDiscount !== undefined && booking.frequencyDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frequency Discount</span>
                <span className="font-medium text-green-600">-R{booking.frequencyDiscount.toFixed(2)}</span>
              </div>
            )}
            {booking.discountCode && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount Code</span>
                <span className="font-medium text-gray-900">{booking.discountCode}</span>
              </div>
            )}
            {booking.discountCodeDiscount !== undefined && booking.discountCodeDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount Amount</span>
                <span className="font-medium text-green-600">-R{booking.discountCodeDiscount.toFixed(2)}</span>
              </div>
            )}
            {booking.serviceFee !== undefined && booking.serviceFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-medium text-gray-900">R{booking.serviceFee.toFixed(2)}</span>
              </div>
            )}
            {booking.tip && booking.tip > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tip for Cleaner</span>
                <span className="font-medium text-green-600">R{booking.tip.toFixed(2)}</span>
              </div>
            )}
            {booking.cleanerEarnings !== undefined && (
              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="text-gray-600">Cleaner Earnings</span>
                <span className="font-medium text-blue-600">R{booking.cleanerEarnings.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                R{booking.totalAmount.toFixed(2)}
              </span>
            </div>
            {booking.paymentReference && (
              <div className="text-sm text-gray-600">
                Payment Reference: <span className="font-mono">{booking.paymentReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Booking Created</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Booking ID</p>
              <p className="font-mono font-medium text-gray-900 text-xs break-all">
                {booking.id}
              </p>
            </div>
            {booking.cleanerResponse && (
              <div>
                <p className="text-gray-600 mb-1">Cleaner Response</p>
                <p className="font-medium text-gray-900 capitalize">{booking.cleanerResponse}</p>
              </div>
            )}
            {booking.jobProgress && (
              <div>
                <p className="text-gray-600 mb-1">Job Progress</p>
                <p className="font-medium text-gray-900 capitalize">{booking.jobProgress}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
