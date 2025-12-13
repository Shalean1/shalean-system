import Link from "next/link";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

// Generate valid location slugs from area names
const capeTownAreas = [
  "Sea Point",
  "Camps Bay",
  "Claremont",
  "Green Point",
  "V&A Waterfront",
  "Constantia",
  "Newlands",
  "Rondebosch",
  "Observatory",
  "Woodstock",
  "City Bowl",
  "Gardens",
  "Tamboerskloof",
  "Oranjezicht",
  "Vredehoek",
  "Devil's Peak",
  "Mouille Point",
  "Three Anchor Bay",
  "Bantry Bay",
  "Fresnaye",
  "Bakoven",
  "Llandudno",
  "Hout Bay",
  "Wynberg",
  "Kenilworth",
  "Plumstead",
  "Diep River",
  "Bergvliet",
  "Tokai",
  "Steenberg",
  "Muizenberg",
  "Kalk Bay",
  "Fish Hoek",
  "Simon's Town",
];

const validLocations = capeTownAreas.map((area) =>
  area.toLowerCase().replace(/\s+/g, "-")
);

function formatLocationName(slug: string): string {
  // Find the original area name
  const originalArea = capeTownAreas.find(
    (area) => area.toLowerCase().replace(/\s+/g, "-") === slug
  );
  
  if (originalArea) {
    return originalArea;
  }
  
  // Fallback: format the slug
  return slug
    .split("-")
    .map((word) => {
      // Handle special cases
      if (word === "v&a") return "V&A";
      if (word === "devil's") return "Devil's";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/#service-areas"
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
  );
}


