"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, Star, Globe, ChevronDown } from "lucide-react";
import { getPopularServices, type PopularService } from "@/app/actions/popular-services";

export default function Hero() {
  const [popularCategories, setPopularCategories] = useState<PopularService[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredServices, setFilteredServices] = useState<PopularService[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch popular services on mount
  useEffect(() => {
    async function fetchPopularServices() {
      const services = await getPopularServices();
      setPopularCategories(services);
      setFilteredServices(services);
    }
    fetchPopularServices();
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
      window.location.href = `#services?q=${encodeURIComponent(searchQuery)}`;
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
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-visible">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=80"
          alt="Clean, bright indoor home"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="max-w-4xl mx-auto">
          {/* White Content Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 lg:p-6 border border-gray-200">
            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 text-center">
              Professional cleaning services,<br />
              ready when you need them
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-gray-600 mb-5 text-center">
              Get professional cleaning for your home from trusted professional cleaners. From regular cleaning and deep cleaning to move-in cleaning, office cleaning, and more.
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
                      className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                    <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
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
                    <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl px-6 py-4">
                      <p className="text-gray-500 text-sm">No services found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                <Link
                  href="/booking/service/standard/details"
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-base"
                >
                  <Search className="w-5 h-5" />
                  Book cleaning today
                </Link>
              </div>
            </form>

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-gray-600 font-medium text-sm">Popular:</span>
              {popularCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/booking/service/${mapServiceSlugToType(category.slug)}/details`}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">1.5+ Million Reviews</p>
                  <p className="text-xs text-gray-600">Trusted by thousands in Cape Town</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>Powered by</span>
                <span className="text-xl font-bold text-gray-900">Shalean</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
