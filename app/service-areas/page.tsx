import type { Metadata } from "next";
import { getServiceLocations } from "@/lib/supabase/booking-data";
import ServiceAreasClient from "@/components/ServiceAreasClient";

export const metadata: Metadata = {
  title: "Service Areas in Cape Town | Bokkie Cleaning Services",
  description: "Find professional cleaning services in your area. We serve all major suburbs across Cape Town including Atlantic Seaboard, City Bowl, Southern Suburbs, Northern Suburbs, and more.",
  keywords: [
    "cleaning services Cape Town",
    "service areas Cape Town",
    "cleaning services by suburb",
    "Cape Town cleaning coverage",
    "professional cleaners near me",
    "cleaning services Atlantic Seaboard",
    "cleaning services City Bowl",
    "cleaning services Southern Suburbs",
    "cleaning services Northern Suburbs",
  ],
  openGraph: {
    title: "Service Areas in Cape Town | Bokkie Cleaning Services",
    description: "Find professional cleaning services in your area. We serve all major suburbs across Cape Town.",
    url: "https://bokkie.co.za/service-areas",
    siteName: "Bokkie Cleaning Services",
    images: [
      {
        url: "https://bokkie.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bokkie Cleaning Services - Service Areas in Cape Town",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Areas in Cape Town | Bokkie Cleaning Services",
    description: "Find professional cleaning services in your area. We serve all major suburbs across Cape Town.",
    images: ["https://bokkie.co.za/og-image.jpg"],
  },
  alternates: {
    canonical: "https://bokkie.co.za/service-areas",
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

export default async function ServiceAreasPage() {
  const locations = await getServiceLocations();

  // Group locations by suburb
  const locationsBySuburb = locations.reduce((acc, location) => {
    const suburb = location.suburb || "Other";
    if (!acc[suburb]) {
      acc[suburb] = [];
    }
    acc[suburb].push(location);
    return acc;
  }, {} as Record<string, typeof locations>);

  // Sort locations within each suburb by display_order
  Object.keys(locationsBySuburb).forEach((suburb) => {
    locationsBySuburb[suburb].sort((a, b) => a.display_order - b.display_order);
  });

  // Define suburb order and colors
  const suburbOrder = [
    "Atlantic Seaboard",
    "City Bowl",
    "Southern Suburbs",
    "Northern Suburbs",
    "West Coast",
    "South Peninsula",
    "Cape Flats",
    "Eastern Suburbs",
  ];

  // Sort suburbs by predefined order
  const sortedSuburbs = suburbOrder.filter((suburb) => locationsBySuburb[suburb]);
  const otherSuburbs = Object.keys(locationsBySuburb).filter(
    (suburb) => !suburbOrder.includes(suburb)
  );
  const allSuburbs = [...sortedSuburbs, ...otherSuburbs];

  const totalLocations = locations.length;
  const totalSuburbs = allSuburbs.length;

  // Generate structured data for SEO
  const baseUrl = "https://bokkie.co.za";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/service-areas#webpage`,
    url: `${baseUrl}/service-areas`,
    name: "Service Areas in Cape Town | Bokkie Cleaning Services",
    description: "Find professional cleaning services in your area. We serve all major suburbs across Cape Town including Atlantic Seaboard, City Bowl, Southern Suburbs, Northern Suburbs, and more.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${baseUrl}/og-image.jpg`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/service-areas#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Service Areas",
          item: `${baseUrl}/service-areas`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Cape Town Service Areas",
      description: "Complete list of suburbs and locations where Bokkie Cleaning Services operates",
      numberOfItems: totalLocations,
      itemListElement: locations.map((location, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: location.name,
        url: `${baseUrl}/areas/${location.slug}`,
      })),
    },
    areaServed: allSuburbs.map((suburb) => ({
      "@type": "City",
      name: suburb,
      containedIn: {
        "@type": "City",
        name: "Cape Town",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ServiceAreasClient
        locationsBySuburb={locationsBySuburb}
        allSuburbs={allSuburbs}
        totalLocations={totalLocations}
        totalSuburbs={totalSuburbs}
      />
    </>
  );
}

