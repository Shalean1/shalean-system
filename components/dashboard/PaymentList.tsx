"use client";

import { Payment } from "@/lib/storage/payments-supabase";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { Calendar, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Booking } from "@/lib/types/booking";

interface PaymentListProps {
  payments: Payment[];
  allPaymentsCount?: number;
}

export default function PaymentList({ payments, allPaymentsCount = 0 }: PaymentListProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatServiceType = (service: string) => {
    return service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Show "no payments" message if there are no payments at all
  if (allPaymentsCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No payments yet
        </h3>
        <p className="text-gray-600 mb-6">
          Your payment history will appear here once you make a booking.
        </p>
        <Link
          href="/booking/service/standard/details"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Book a Service
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No payments match your filters.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/dashboard/bookings/${payment.bookingReference}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {formatServiceType(payment.booking.service)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Reference: {payment.bookingReference}
                      </p>
                    </div>
                    <PaymentStatusBadge paymentStatus={payment.paymentStatus as Booking["paymentStatus"]} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(payment.createdAt)}</span>
                    </div>
                    {payment.paymentMethod && (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                    )}
                    {payment.paymentReference && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">Ref: {payment.paymentReference.substring(0, 12)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      R{payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.booking.scheduledDate && (
                        <>Scheduled: {formatDate(payment.booking.scheduledDate)}</>
                      )}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
    </div>
  );
}
