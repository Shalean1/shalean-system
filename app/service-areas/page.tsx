import type { Metadata } from "next";
import Link from "next/link";
import { Globe, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";
import { generateServiceAreasStructuredData } from "@/lib/structured-data";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Professional Cleaning Services Cape Town - All Service Areas",
  description: "Professional cleaning services throughout Cape Town. We serve Sea Point, Camps Bay, Claremont, Green Point, Constantia, and 30+ more areas. Book your cleaner today!",
  keywords: [
    "cleaning services Cape Town",
    "service areas Cape Town",
    "cleaning services Sea Point",
    "cleaning services Camps Bay",
    "cleaning services Claremont",
    "cleaning services Green Point",
    "cleaning services Constantia",
    "professional cleaners Cape Town",
    "house cleaning Cape Town",
    "office cleaning Cape Town",
    "residential cleaning Cape Town",
    "commercial cleaning Cape Town",
    "Cape Town cleaning service areas",
    "cleaning services Western Cape",
  ],
  openGraph: {
    title: "Professional Cleaning Services Cape Town - All Service Areas",
    description: "Professional cleaning services throughout Cape Town. We serve Sea Point, Camps Bay, Claremont, Green Point, Constantia, and 30+ more areas.",
    url: "https://shalean.co.za/service-areas",
    siteName: "Shalean Cleaning Services",
    images: [
      {
        url: "https://shalean.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shalean Cleaning Services - Service Areas in Cape Town",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Cleaning Services Cape Town - All Service Areas",
    description: "Professional cleaning services throughout Cape Town. We serve Sea Point, Camps Bay, Claremont, Green Point, Constantia, and 30+ more areas.",
    images: ["https://shalean.co.za/og-image.jpg"],
    creator: "@shaleancleaning",
    site: "@shaleancleaning",
  },
  alternates: {
    canonical: "https://shalean.co.za/service-areas",
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

export default function ServiceAreasPage() {
  const structuredData = generateServiceAreasStructuredData();

  // Group areas by region for better organization
  const coastalAreas = [
    "Sea Point", "Camps Bay", "Green Point", "V&A Waterfront",
    "Mouille Point", "Three Anchor Bay", "Bantry Bay", "Fresnaye",
    "Bakoven", "Llandudno", "Hout Bay",
  ];
  
  const cityAreas = [
    "City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht",
    "Vredehoek", "Devil's Peak", "Woodstock", "Observatory",
  ];
  
  const southernSuburbs = [
    "Claremont", "Newlands", "Rondebosch", "Constantia",
    "Wynberg", "Kenilworth", "Plumstead", "Diep River",
    "Bergvliet", "Tokai", "Steenberg",
  ];
  
  const falseBayAreas = [
    "Muizenberg", "Kalk Bay", "Fish Hoek", "Simon's Town",
  ];

  const getAreaGroup = (area: string) => {
    if (coastalAreas.includes(area)) return "coastal";
    if (cityAreas.includes(area)) return "city";
    if (southernSuburbs.includes(area)) return "southern";
    if (falseBayAreas.includes(area)) return "falseBay";
    return "other";
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Globe className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
                  Professional Cleaning Services in Cape Town
                </h1>
              </div>
              <p className="text-xl sm:text-2xl text-gray-700 mb-4">
                All Service Areas We Cover
              </p>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We proudly serve residents and businesses throughout Cape Town and surrounding suburbs. 
                Our professional cleaning team is available in over 35 areas, providing reliable, 
                high-quality cleaning services tailored to your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* All Areas Grid */}
            <div className="max-w-6xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Browse All Service Areas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {capeTownAreas.map((area) => (
                  <Link
                    key={area}
                    href={`/areas/${getLocationSlug(area)}`}
                    className="group flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm md:text-base transition-colors">
                      {area}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Service Highlights */}
            <div className="max-w-6xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Our Cleaning Services
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Residential Cleaning</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Regular maintenance cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>General house cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Airbnb turnover cleaning</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Commercial Cleaning</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Office cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Retail store cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Restaurant and kitchen cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Contract cleaning</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Specialized Cleaning</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Deep cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Move-in/move-out cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Carpet and upholstery cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Window cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Post-construction cleaning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Why Choose Shalean Cleaning Services?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experienced Team</h3>
                  <p className="text-gray-600 text-sm">
                    Professional cleaners with years of experience serving Cape Town
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Wide Coverage</h3>
                  <p className="text-gray-600 text-sm">
                    Serving over 35 areas across Cape Town and surrounding suburbs
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                  <p className="text-gray-600 text-sm">
                    Same-day booking available with flexible time slots
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    What areas do you serve in Cape Town?
                  </h3>
                  <p className="text-gray-700">
                    We serve over 35 areas throughout Cape Town including Sea Point, Camps Bay, 
                    Claremont, Green Point, Constantia, Newlands, and many more. If you don't 
                    see your area listed, please contact us as we may still be able to help!
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Can I book same-day cleaning?
                  </h3>
                  <p className="text-gray-700">
                    Yes! We offer same-day booking for cleaning services throughout Cape Town. 
                    Availability depends on cleaner schedules, but we work hard to accommodate 
                    urgent requests.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Do you provide cleaning supplies?
                  </h3>
                  <p className="text-gray-700">
                    For deep cleaning, move-in/out, and carpet cleaning services, all supplies 
                    and equipment are included at no extra charge. For standard cleaning services, 
                    supplies are available at an additional cost that you can request during booking.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Are your cleaners insured and bonded?
                  </h3>
                  <p className="text-gray-700">
                    Yes, all our professional cleaners are fully insured and bonded. We also offer 
                    a 100% satisfaction guarantee on all our cleaning services.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Book Your Cleaning Service?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Get a free quote and schedule your cleaning service in your area today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/booking/quote"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Get Free Quote
                  </Link>
                  <a
                    href="tel:+27871535250"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call: +27 87 153 5250
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

