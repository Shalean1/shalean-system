"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Waves,
  Mountain,
  Home,
  Navigation,
  ArrowUp,
} from "lucide-react";
import { ServiceLocation } from "@/lib/supabase/booking-data";

interface ServiceAreasClientProps {
  locationsBySuburb: Record<string, ServiceLocation[]>;
  allSuburbs: string[];
  totalLocations: number;
  totalSuburbs: number;
}

// Suburb icons mapping
const suburbIcons: Record<string, typeof MapPin> = {
  "Atlantic Seaboard": Waves,
  "City Bowl": Building2,
  "Southern Suburbs": Home,
  "Northern Suburbs": Navigation,
  "West Coast": Waves,
  "South Peninsula": Mountain,
  "Cape Flats": Building2,
  "Eastern Suburbs": Navigation,
};

// Suburb color schemes
const suburbColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  "Atlantic Seaboard": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
  "City Bowl": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: "text-purple-600",
  },
  "Southern Suburbs": {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "text-green-600",
  },
  "Northern Suburbs": {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "text-orange-600",
  },
  "West Coast": {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    icon: "text-cyan-600",
  },
  "South Peninsula": {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    icon: "text-teal-600",
  },
  "Cape Flats": {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "text-gray-600",
  },
  "Eastern Suburbs": {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    icon: "text-indigo-600",
  },
};

export default function ServiceAreasClient({
  locationsBySuburb,
  allSuburbs,
  totalLocations,
  totalSuburbs,
}: ServiceAreasClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSuburbs, setExpandedSuburbs] = useState<Set<string>>(new Set());
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Filter suburbs and locations based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return { suburbs: allSuburbs, locationsBySuburb };
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: Record<string, ServiceLocation[]> = {};
    const matchingSuburbs: string[] = [];

    allSuburbs.forEach((suburb) => {
      const locations = locationsBySuburb[suburb] || [];
      const matchingLocations = locations.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          suburb.toLowerCase().includes(query)
      );

      if (matchingLocations.length > 0 || suburb.toLowerCase().includes(query)) {
        filtered[suburb] = matchingLocations.length > 0 ? matchingLocations : locations;
        matchingSuburbs.push(suburb);
      }
    });

    return { suburbs: matchingSuburbs, locationsBySuburb: filtered };
  }, [searchQuery, allSuburbs, locationsBySuburb]);

  const toggleSuburb = (suburb: string) => {
    setExpandedSuburbs((prev) => {
      // If clicking the same suburb that's already open, close it
      if (prev.has(suburb)) {
        return new Set();
      }
      // Otherwise, close all others and open only this one
      return new Set([suburb]);
    });
  };

  const expandAll = () => {
    setExpandedSuburbs(new Set(filteredData.suburbs));
  };

  const collapseAll = () => {
    setExpandedSuburbs(new Set());
  };

  // Get all locations for the "All Locations" section
  const allLocations = useMemo(() => {
    return Object.values(locationsBySuburb)
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locationsBySuburb]);

  const filteredAllLocations = useMemo(() => {
    if (!searchQuery.trim()) return allLocations;
    const query = searchQuery.toLowerCase().trim();
    return allLocations.filter((location) =>
      location.name.toLowerCase().includes(query)
    );
  }, [searchQuery, allLocations]);

  return (
    <div id="top" className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <a href="/" className="hover:text-[#007bff] transition-colors">
              Home
            </a>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium" aria-current="page">
            Service Areas
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Globe className="w-10 h-10 text-[#007bff]" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Service Areas in Cape Town
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Professional cleaning services available throughout Cape Town and surrounding suburbs
            </p>
            <p className="text-base md:text-lg text-gray-500 max-w-3xl mx-auto mb-8">
              Bokkie Cleaning Services provides trusted residential, commercial, and specialized cleaning services across {totalSuburbs} major suburbs in Cape Town, covering {totalLocations} locations. Whether you're in Atlantic Seaboard, City Bowl, Southern Suburbs, Northern Suburbs, West Coast, South Peninsula, Cape Flats, or Eastern Suburbs, we have professional cleaners ready to serve your area.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                <div className="text-3xl font-bold text-[#007bff]">{totalSuburbs}</div>
                <div className="text-sm text-gray-600">Suburbs</div>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                <div className="text-3xl font-bold text-[#007bff]">{totalLocations}</div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a location or suburb..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-gray-200 focus:border-[#007bff] focus:outline-none text-lg shadow-sm transition-colors"
                aria-label="Search service areas and locations"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Suburb Cards Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Browse by Suburb
            </h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {filteredData.suburbs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No locations found</p>
              <p className="text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {filteredData.suburbs.map((suburb) => {
                const locations = filteredData.locationsBySuburb[suburb] || [];
                const isExpanded = expandedSuburbs.has(suburb);
                const colors = suburbColors[suburb] || suburbColors["Cape Flats"];
                const Icon = suburbIcons[suburb] || MapPin;

                return (
                  <div
                    key={suburb}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${colors.border} overflow-hidden`}
                  >
                    {/* Suburb Header */}
                    <button
                      onClick={() => toggleSuburb(suburb)}
                      className={`w-full p-6 ${colors.bg} hover:opacity-90 transition-opacity flex items-center justify-between`}
                      aria-expanded={isExpanded}
                      aria-controls={`suburb-${suburb.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-white ${colors.icon}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className={`text-xl font-bold ${colors.text}`}>{suburb}</h3>
                          <p className="text-sm text-gray-600">
                            {locations.length} {locations.length === 1 ? "location" : "locations"}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className={`w-6 h-6 ${colors.icon}`} />
                      ) : (
                        <ChevronDown className={`w-6 h-6 ${colors.icon}`} />
                      )}
                    </button>

                    {/* Locations List */}
                    {isExpanded && (
                      <div
                        id={`suburb-${suburb.replace(/\s+/g, "-").toLowerCase()}`}
                        className="p-6 pt-4"
                        role="region"
                        aria-label={`Locations in ${suburb}`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {locations.map((location) => (
                            <Link
                              key={location.id}
                              href={`/areas/${location.slug}`}
                              className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#007bff] transition-colors" />
                              <span className="text-gray-700 group-hover:text-[#007bff] transition-colors">
                                {location.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* All Locations Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                All Locations
              </h2>
              <button
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showAllLocations ? "Hide" : "Show"} All
              </button>
            </div>

            {showAllLocations && (
              <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAllLocations.map((location) => (
                    <Link
                      key={location.id}
                      href={`/areas/${location.slug}`}
                      className="text-gray-700 hover:text-[#007bff] hover:underline transition-colors text-sm md:text-base py-2"
                    >
                      {location.name}
                    </Link>
                  ))}
                </div>
                {filteredAllLocations.length === 0 && (
                  <p className="text-center text-gray-600 py-8">
                    No locations found matching your search
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#007bff] to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don't see your area?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We may still be able to help! Contact us to check availability in your area.
            </p>
            <Link
              href="/booking/quote"
              className="inline-block px-8 py-4 bg-white text-[#007bff] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

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
  );
}

