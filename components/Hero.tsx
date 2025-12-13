"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Star, Globe } from "lucide-react";

const popularCategories = [
  "Holiday Cleaning",
  "Office Cleaning",
  "Deep Cleaning",
  "Move-In Cleaning",
];

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="I need cleaning for..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    aria-label="Search for cleaning services"
                  />
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
                  key={category}
                  href={`#services?category=${encodeURIComponent(category.toLowerCase())}`}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium transition-colors"
                >
                  {category}
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
