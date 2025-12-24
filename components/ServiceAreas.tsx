import Link from "next/link";
import { Globe } from "lucide-react";
import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";

export default function ServiceAreas() {
  return (
    <section id="service-areas" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* H2 Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Areas we serve in Cape Town
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional cleaning services available throughout Cape Town and surrounding suburbs
          </p>
        </div>

        {/* Areas List */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-[#007bff]" />
            <span className="text-lg font-semibold text-gray-700">Cape Town, Western Cape</span>
          </div>

          {/* Multi-column grid of areas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {capeTownAreas.map((area) => (
              <Link
                key={area}
                href={`/areas/${getLocationSlug(area)}`}
                className="text-gray-700 hover:text-[#007bff] hover:underline transition-colors text-sm md:text-base"
              >
                {area}
              </Link>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Don't see your area? We may still be able to help!
            </p>
            <Link
              href="/service-areas"
              className="text-[#007bff] hover:underline font-medium"
            >
              View All Service Areas →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
