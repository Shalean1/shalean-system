"use client";

import Link from "next/link";
import { useState } from "react";

const popularServices = [
  {
    id: "residential-cleaning",
    name: "General Residential Cleaning Services",
    category: "Residential",
    description: "Regular maintenance cleaning for homes and private properties",
    avgPrice: "R500",
    image: "/services/residential-cleaning.jpg",
  },
  {
    id: "commercial-cleaning",
    name: "General Commercial Cleaning Services",
    category: "Commercial",
    description: "Regular maintenance cleaning for businesses, offices, and retail spaces",
    avgPrice: "R800",
    image: "/services/commercial-cleaning.jpg",
  },
  {
    id: "specialized-cleaning",
    name: "Specialized Cleaning Services",
    category: "Specialized",
    description: "Deep cleaning and specialized services for both residential and commercial properties",
    avgPrice: "R900",
    image: "/services/specialized-cleaning.jpg",
  },
];

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setImageError(true)}
    />
  );
}

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* H2 Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Popular cleaning services in Cape Town
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our most requested cleaning services, trusted by thousands of Cape Town residents
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {popularServices.map((service) => {
            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <ServiceImage src={service.image} alt={service.name} />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      Avg. {service.avgPrice}
                    </span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/booking/service/standard/details"
            className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            Book a Service
          </Link>
        </div>
      </div>
    </section>
  );
}
