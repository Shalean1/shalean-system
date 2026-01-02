import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ServiceAreas from "@/components/ServiceAreas";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CleaningTeam from "@/components/CleaningTeam";
import FeaturedCleaners from "@/components/FeaturedCleaners";
import CleaningGuides from "@/components/CleaningGuides";
import ReadyToStart from "@/components/ReadyToStart";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
  description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning. Rated 5 stars with 150+ reviews. Serving Sea Point, Camps Bay, Claremont & more.",
  keywords: [
    "cleaning services Cape Town",
    "professional cleaners Cape Town",
    "house cleaning Cape Town",
    "office cleaning Cape Town",
    "deep cleaning Cape Town",
    "move in cleaning Cape Town",
    "Airbnb cleaning Cape Town",
    "same day cleaning Cape Town",
    "trusted cleaners Cape Town",
    "best cleaning service Cape Town",
    "affordable cleaners Cape Town",
    "residential cleaning Cape Town",
    "commercial cleaning Cape Town",
    "cleaning services Sea Point",
    "cleaning services Camps Bay",
    "cleaning services Claremont",
    "professional cleaning services South Africa",
  ],
  openGraph: {
    title: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning. Rated 5 stars with 150+ reviews.",
    url: "https://bokkiecleaning.co.za",
    siteName: "Bokkie Cleaning Services",
    images: [
      {
        url: "https://bokkiecleaning.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bokkie Cleaning Services - Professional Cleaning Services in Cape Town",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available. Rated 5 stars with 150+ reviews.",
    images: ["https://bokkiecleaning.co.za/og-image.jpg"],
    creator: "@bokkiecleaning",
    site: "@bokkiecleaning",
  },
  alternates: {
    canonical: "https://bokkiecleaning.co.za",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "ZA-WC",
    "geo.placename": "Cape Town",
    "geo.position": "-33.9806;18.4653",
    "ICBM": "-33.9806, 18.4653",
  },
};

export default function Home() {
  // WebPage structured data for homepage SEO
  const webpageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://bokkiecleaning.co.za#webpage",
    url: "https://bokkiecleaning.co.za",
    name: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": "https://bokkiecleaning.co.za#website",
    },
    about: {
      "@id": "https://bokkiecleaning.co.za#organization",
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://bokkiecleaning.co.za/og-image.jpg",
    },
    breadcrumb: {
      "@id": "https://bokkiecleaning.co.za#breadcrumb",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageStructuredData) }}
      />
      <main className="min-h-screen">
        <Hero />
        <Services />
        <HowItWorks />
        <FeaturedCleaners />
        <ServiceAreas />
        <CleaningTeam />
        <CleaningGuides />
        <Testimonials />
        <ReadyToStart />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
