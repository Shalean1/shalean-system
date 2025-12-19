import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { getCleanerBookingByReference } from "@/lib/storage/cleaner-bookings-supabase";
import { getAdditionalServicesServer } from "@/lib/supabase/booking-data-server";
import StatusBadge from "@/components/cleaner/StatusBadge";
import BookingStatusActions from "@/components/cleaner/BookingStatusActions";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Home,
  Building,
  DollarSign,
  FileText,
} from "lucide-react";

export default async function CleanerBookingDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
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

  // Fetch booking
  const booking = await getCleanerBookingByReference(decodedReference);

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

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/cleaner/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formatServiceType(booking.service)}
              </h1>
              <p className="text-gray-600">
                Booking Reference:{" "}
                <span className="font-mono font-medium">
                  {booking.bookingReference}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={booking.status} size="lg" />
            </div>
          </div>
          <div className="mt-4">
            <BookingStatusActions booking={booking} />
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
                <p className="font-medium text-gray-900">
                  {formatFrequency(booking.frequency)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-900">
                  {booking.firstName} {booking.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <a
                  href={`tel:${booking.phone}`}
                  className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {booking.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a
                  href={`mailto:${booking.email}`}
                  className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {booking.email}
                </a>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {booking.streetAddress}
                {booking.aptUnit && `, ${booking.aptUnit}`}
              </p>
              <p className="text-gray-600">
                {booking.suburb}, {booking.city}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${booking.streetAddress}, ${booking.suburb}, ${booking.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </a>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Service Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Property Size</p>
                <p className="font-medium text-gray-900">
                  {booking.bedrooms} bedroom{booking.bedrooms !== 1 ? "s" : ""},{" "}
                  {booking.bathrooms} bathroom{booking.bathrooms !== 1 ? "s" : ""}
                </p>
              </div>
              {booking.extras && booking.extras.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Additional Services</p>
                  <ul className="list-disc list-inside space-y-1">
                    {booking.extras.map((extraId) => (
                      <li key={extraId} className="text-gray-900">
                        {extrasMap[extraId] || extraId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {booking.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Special Instructions</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {booking.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold text-gray-900 text-lg">
                R{booking.totalAmount.toFixed(2)}
              </span>
            </div>
            {booking.tip && booking.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tip</span>
                <span className="text-gray-900">R{booking.tip.toFixed(2)}</span>
              </div>
            )}
            {booking.paymentStatus === "completed" && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-green-600 font-medium">
                  Payment Completed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
