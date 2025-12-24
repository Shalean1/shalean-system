import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { capeTownAreas, formatLocationName, getLocationSlug } from "@/lib/constants/areas";
import { generateLocationStructuredData } from "@/lib/structured-data";

const validLocations = capeTownAreas.map((area) =>
  getLocationSlug(area)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  
  if (!validLocations.includes(location)) {
    return {};
  }

  const locationName = formatLocationName(location);
  const title = `Cleaning Services in ${locationName}, Cape Town | Shalean Cleaning Services`;
  const description = `Professional cleaning services in ${locationName}, Cape Town. Residential, commercial, and specialized cleaning services available. Book your cleaner today!`;
  const keywords = [
    `cleaning services ${locationName}`,
    `professional cleaners ${locationName}`,
    `house cleaning ${locationName}`,
    `office cleaning ${locationName}`,
    `residential cleaning ${locationName}`,
    `commercial cleaning ${locationName}`,
    `deep cleaning ${locationName}`,
    `cleaning services Cape Town`,
    `cleaning services Western Cape`,
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://shalean.co.za/areas/${location}`,
      siteName: "Shalean Cleaning Services",
      images: [
        {
          url: "https://shalean.co.za/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Shalean Cleaning Services - Cleaning Services in ${locationName}`,
        },
      ],
      locale: "en_ZA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://shalean.co.za/og-image.jpg"],
      creator: "@shaleancleaning",
      site: "@shaleancleaning",
    },
    alternates: {
      canonical: `https://shalean.co.za/areas/${location}`,
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
      "geo.placename": locationName,
      "geo.position": "-33.9806;18.4653",
      "ICBM": "-33.9806, 18.4653",
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;

  if (!validLocations.includes(location)) {
    notFound();
  }

  const locationName = formatLocationName(location);
  const structuredData = generateLocationStructuredData(locationName, location);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/service-areas" className="hover:text-gray-900 transition-colors">
                Service Areas
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{locationName}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link
            href="/service-areas"
            className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Service Areas
          </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Cleaning Services in {locationName}
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Professional cleaning services available in {locationName}, Cape Town
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700">
              We're proud to offer comprehensive cleaning services to residents and businesses in {locationName}. 
              Our experienced team is familiar with the area and committed to providing exceptional service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Services in {locationName}</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Residential Cleaning - Regular and deep cleaning for homes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Commercial Cleaning - Office and business space cleaning</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Specialized Cleaning - Move-in/out, Airbnb, and deep cleaning services</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Custom Cleaning Solutions - Tailored to your specific needs</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Experienced and professional cleaning team</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Fully insured and bonded</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Eco-friendly cleaning options available</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Flexible scheduling to fit your needs</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Competitive pricing</span>
              </li>
            </ul>
          </div>

          <div className="mt-12 p-8 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-700 mb-6">
              Contact us today to schedule your cleaning service in {locationName}. We'll provide a 
              free quote and work with you to create a cleaning plan that meets your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+27871535250"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us: +27 87 153 5250
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg border-2 border-blue-500 transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}


