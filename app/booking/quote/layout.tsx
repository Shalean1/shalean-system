import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Your Free Cleaning Quote | Shalean Cleaning Services",
  description: "Request a free personalized quote for professional cleaning services in Cape Town. Select your service, home details, and additional services.",
  keywords: [
    "cleaning quote Cape Town",
    "free cleaning quote",
    "cleaning services quote",
    "professional cleaning quote",
  ],
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


















