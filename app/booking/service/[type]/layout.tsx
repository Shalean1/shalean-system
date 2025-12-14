import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BookingLayoutHeader = dynamic(
  () => import("@/components/booking/BookingLayoutHeader").then((mod) => mod.default || mod),
  { ssr: true }
);

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
