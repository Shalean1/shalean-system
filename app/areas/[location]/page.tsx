import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ArrowUp } from "lucide-react";
import { notFound } from "next/navigation";
import { capeTownAreas, formatLocationName, getLocationSlug } from "@/lib/constants/areas";
import { generateLocationStructuredData } from "@/lib/structured-data";
import { getLocationContent, getServiceLocations } from "@/lib/supabase/booking-data";

// Helper function to get valid locations from database
async function getValidLocations(): Promise<string[]> {
  try {
    const locations = await getServiceLocations();
    return locations.map(loc => loc.slug);
  } catch (error) {
    // Fallback to hardcoded locations if database fetch fails
    console.error('Error fetching locations from database, using fallback:', error);
    return capeTownAreas.map((area) => getLocationSlug(area));
  }
}

// Helper function to get location name from database by slug
async function getLocationNameFromSlug(slug: string): Promise<string | null> {
  try {
    const locations = await getServiceLocations();
    const location = locations.find(loc => loc.slug === slug);
    return location?.name || null;
  } catch (error) {
    console.error('Error fetching location name from database:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  
  // Check if location exists in database
  const validLocations = await getValidLocations();
  if (!validLocations.includes(location)) {
    return {};
  }

  // Get location name from database, fallback to formatting slug
  const dbLocationName = await getLocationNameFromSlug(location);
  const locationName = dbLocationName || formatLocationName(location);
  
  // Fetch location-specific content for metadata
  const locationContent = await getLocationContent(location);
  
  // Use custom description from content if available, otherwise use default
  const description = locationContent?.intro_paragraph 
    ? locationContent.intro_paragraph.substring(0, 160) + (locationContent.intro_paragraph.length > 160 ? '...' : '')
    : `Professional cleaning services in ${locationName}, Cape Town. Residential, commercial, and specialized cleaning services available. Book your cleaner today!`;
  
  // Use SEO keywords from database if available, otherwise use defaults
  const keywords = locationContent?.seo_keywords && locationContent.seo_keywords.length > 0
    ? locationContent.seo_keywords
    : [
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
  
  const title = `Cleaning Services in ${locationName}, Cape Town | Bokkie Cleaning Services`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://bokkie.co.za/areas/${location}`,
      siteName: "Bokkie Cleaning Services",
      images: [
        {
          url: "https://bokkie.co.za/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Bokkie Cleaning Services - Cleaning Services in ${locationName}`,
        },
      ],
      locale: "en_ZA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://bokkie.co.za/og-image.jpg"],
      creator: "@shaloclean",
      site: "@shaloclean",
    },
    alternates: {
      canonical: `https://bokkie.co.za/areas/${location}`,
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

  // Check if location exists in database
  const validLocations = await getValidLocations();
  if (!validLocations.includes(location)) {
    notFound();
  }

  // Get location name from database, fallback to formatting slug
  const dbLocationName = await getLocationNameFromSlug(location);
  const locationName = dbLocationName || formatLocationName(location);
  const structuredData = generateLocationStructuredData(locationName, location);

  // Fetch location-specific content
  const locationContent = await getLocationContent(location);

  // Default/fallback content
  const defaultIntroParagraph = `Bokkie provides trusted and reliable home cleaning services across Cape Town, operating in areas like Sea Point, Camps Bay, Claremont, Green Point, Constantia, and many more. Our experienced cleaning professionals handle everything from regular house cleaning and deep cleaning to move-in/out cleaning, Airbnb cleaning, and office cleaning.`;
  const defaultMainContent = `Our service is easily booked online, secure, safe, and cashless. Our dedicated cleaning professionals arrive on time, fully equipped with all necessary supplies, and are committed to delivering exceptional results that exceed your expectations.`;

  // Use custom content if available, otherwise use defaults
  const introParagraph = locationContent?.intro_paragraph || defaultIntroParagraph;
  const mainContent = locationContent?.main_content || defaultMainContent;
  const closingParagraph = locationContent?.closing_paragraph;

  // Group areas by region for display
  const atlanticSeaboard = ["Sea Point", "Camps Bay", "Green Point", "Mouille Point", "Three Anchor Bay", "Bantry Bay", "Fresnaye", "Bakoven", "Llandudno", "Hout Bay"];
  const cityBowl = ["City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht", "Vredehoek", "Devil's Peak", "Observatory", "Woodstock", "V&A Waterfront", "Claremont"];
  const southernSuburbs = ["Constantia", "Newlands", "Rondebosch", "Wynberg", "Kenilworth", "Plumstead", "Diep River", "Bergvliet", "Tokai", "Steenberg", "Muizenberg", "Kalk Bay", "Fish Hoek", "Simon's Town"];
  
  const atlanticSeaboardAreas = capeTownAreas.filter(area => atlanticSeaboard.includes(area));
  const cityBowlAreas = capeTownAreas.filter(area => cityBowl.includes(area));
  const southernSuburbsAreas = capeTownAreas.filter(area => southernSuburbs.includes(area));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div id="top" className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-[350px] lg:min-h-[400px] flex items-center justify-center">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-background.jpg"
              alt="Clean, bright indoor home"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Find a cleaner near you
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-lg">
                <p className="text-white text-lg font-semibold">Cleaning Services in {locationName}</p>
              </div>
              <Link
                href="/booking/quote"
                className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors shadow-lg text-lg"
              >
                BOOK A CLEAN
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
                Book Your Home Cleaning Services Online
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 mb-8">
                {introParagraph && (
                  <p className="text-lg leading-relaxed mb-4">
                    {introParagraph}
                  </p>
                )}
                {mainContent && (
                  <p className="text-lg leading-relaxed mb-4">
                    {mainContent}
                  </p>
                )}
                {closingParagraph && (
                  <p className="text-lg leading-relaxed mb-4">
                    {closingParagraph}
                  </p>
                )}
                <p className="text-lg font-semibold text-gray-900 mb-8">
                  View our most popular areas below:
                </p>
              </div>

              {/* Service Areas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {/* Atlantic Seaboard */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Cleaning Services in Atlantic Seaboard</h3>
                  <ul className="space-y-2">
                    {atlanticSeaboardAreas.slice(0, 5).map((area) => (
                      <li key={area}>
                        <Link
                          href={`/areas/${getLocationSlug(area)}`}
                          className="text-gray-700 hover:text-[#2563eb] hover:underline transition-colors"
                        >
                          Cleaning Services {area}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/service-areas"
                        className="text-[#2563eb] hover:underline font-medium"
                      >
                        View More Areas
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* City Bowl & Southern Suburbs */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Cleaning Services in City Bowl & Southern Suburbs</h3>
                  <ul className="space-y-2">
                    {[...cityBowlAreas, ...southernSuburbsAreas].slice(0, 5).map((area) => (
                      <li key={area}>
                        <Link
                          href={`/areas/${getLocationSlug(area)}`}
                          className="text-gray-700 hover:text-[#2563eb] hover:underline transition-colors"
                        >
                          Cleaning Services {area}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/service-areas"
                        className="text-[#2563eb] hover:underline font-medium"
                      >
                        View More Areas
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Additional Areas */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">More Cleaning Services in Cape Town</h3>
                  <ul className="space-y-2">
                    {capeTownAreas.filter(area => 
                      !atlanticSeaboardAreas.includes(area) && 
                      !cityBowlAreas.includes(area) && 
                      !southernSuburbsAreas.includes(area)
                    ).slice(0, 5).map((area) => (
                      <li key={area}>
                        <Link
                          href={`/areas/${getLocationSlug(area)}`}
                          className="text-gray-700 hover:text-[#2563eb] hover:underline transition-colors"
                        >
                          Cleaning Services {area}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/service-areas"
                        className="text-[#2563eb] hover:underline font-medium"
                      >
                        View More Areas
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/service-areas"
                  className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Cleaning Services Near Me
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors text-center"
                >
                  All Cleaning Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/service-areas" className="text-gray-700 hover:text-[#2563eb] transition-colors">
                Cleaning Services Near Me
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/services" className="text-gray-700 hover:text-[#2563eb] transition-colors">
                All Services
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/service-areas" className="text-gray-700 hover:text-[#2563eb] transition-colors">
                Locations
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/how-it-works" className="text-gray-700 hover:text-[#2563eb] transition-colors">
                How It Works
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/services" className="text-gray-700 hover:text-[#2563eb] transition-colors">
                Office Cleaning Services
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <section className="bg-gray-800 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <p className="text-lg font-semibold">Keep it tidy. Subscribe to get our latest news</p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] w-full md:w-64"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer Bottom */}
        <footer className="bg-gray-900 text-gray-300 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row gap-6 text-sm">
                <Link href="/cleaner/apply" className="hover:text-white transition-colors">
                  APPLY TO BE A CLEANER
                </Link>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  ABOUT
                </Link>
                <Link href="/guides" className="hover:text-white transition-colors">
                  BLOG
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  CAREERS
                </Link>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
                <div className="flex gap-4">
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Help
                  </Link>
                  <span>|</span>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                  <span>|</span>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span>© {new Date().getFullYear()} Bokkie Cleaning Services, all rights reserved</span>
                  <Link href="#top" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>To top</span>
                    <ArrowUp className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


