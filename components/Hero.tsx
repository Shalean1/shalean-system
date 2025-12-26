"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getPopularServices, getTopBookedPopularServices, type PopularService } from "@/app/actions/popular-services";

export default function Hero() {
  const [popularCategories, setPopularCategories] = useState<PopularService[]>([]);
  const [topBookedCategories, setTopBookedCategories] = useState<PopularService[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredServices, setFilteredServices] = useState<PopularService[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch popular services on mount (for search dropdown)
  useEffect(() => {
    async function fetchPopularServices() {
      const services = await getPopularServices();
      setPopularCategories(services);
      setFilteredServices(services);
    }
    fetchPopularServices();
  }, []);

  // Fetch top 5 most booked services for category tags
  useEffect(() => {
    async function fetchTopBookedServices() {
      const topServices = await getTopBookedPopularServices(5);
      setTopBookedCategories(topServices);
    }
    fetchTopBookedServices();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter services based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = popularCategories.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(popularCategories);
    }
  }, [searchQuery, popularCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    if (searchQuery.trim()) {
      window.location.href = `/services?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleBookCleaning = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingModalOpen(true);
  };

  // Map popular service slugs to booking service types
  const mapServiceSlugToType = (slug: string): string => {
    const mapping: Record<string, string> = {
      "deep-cleaning": "deep",
      "move-in-cleaning": "move-in-out",
      "move-out-cleaning": "move-in-out",
      "office-cleaning": "office",
      "holiday-cleaning": "holiday",
      "airbnb-cleaning": "airbnb",
    };
    return mapping[slug] || "standard";
  };

  const handleServiceSelect = (service: PopularService) => {
    setSearchQuery(service.name);
    setIsDropdownOpen(false);
    // Navigate to booking form with dynamic service type
    // Map service slug to booking service type
    const serviceType = mapServiceSlugToType(service.slug);
    window.location.href = `/booking/service/${serviceType}/details`;
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-start justify-center pt-12 lg:pt-16 overflow-visible">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/hero-background.jpg"
          alt="Clean, bright indoor home"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* White Content Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 lg:p-6 border border-gray-200">
            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 text-center">
              Professional Cleaning services,<br />
              on demand
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-gray-600 mb-6 text-center">
              Professional cleaning services for your home from trusted cleaners. Regular cleaning, deep cleaning, move-in cleaning, office cleaning, and more.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative" ref={dropdownRef}>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="I need cleaning for..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleInputFocus}
                      className="w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent text-base"
                      aria-label="Search for cleaning services"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Toggle dropdown"
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && filteredServices.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className="w-full px-6 py-4 text-left hover:bg-[#e6f0ff] transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="font-semibold text-gray-900 mb-1">
                            {service.name}
                          </div>
                          {service.description && (
                            <div className="text-sm text-gray-600">
                              {service.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {isDropdownOpen && searchQuery && filteredServices.length === 0 && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl px-6 py-4">
                      <p className="text-gray-500 text-sm">No services found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                <Link
                  href="/booking/service/standard/details"
                  className="px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center text-base"
                >
                  Book a service
                </Link>
              </div>
            </form>

            {/* Category Tags - Top 5 Most Booked */}
            <div className="hidden md:flex flex-wrap items-center gap-2 mb-4">
              {topBookedCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/booking/service/${mapServiceSlugToType(category.slug)}/details`}
                  className="px-4 py-2 bg-white border border-[#007bff] hover:bg-[#e6f0ff] text-[#007bff] rounded-lg text-sm font-medium transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
