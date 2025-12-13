import type { Metadata } from "next";
import BookingLayoutHeader from "@/components/booking/BookingLayoutHeader";

export const metadata: Metadata = {
  title: "Book Cleaning Service | Shalean Cleaning Services",
  description: "Book professional cleaning services in Cape Town. Select your service, schedule, and complete your booking.",
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <BookingLayoutHeader />

      {/* Main Content */}
      {children}
    </div>
  );
}
