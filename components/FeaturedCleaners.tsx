import Image from "next/image";
import { CheckCircle } from "lucide-react";

const featuredCleaners = [
  {
    id: 1,
    name: "Lucia",
    image: "/cleaners/team-lucia.jpg",
    positiveReviews: 100,
    completedTasks: "1.2k",
    tagline: "Expert cleaning professional",
  },
  {
    id: 2,
    name: "Nyasha",
    image: "/cleaners/team-nyasha.jpg",
    positiveReviews: 100,
    completedTasks: "950",
    tagline: "Expert cleaning professional",
  },
  {
    id: 3,
    name: "Normatter",
    image: "/cleaners/team-normatter.jpg",
    positiveReviews: 100,
    completedTasks: "800",
    tagline: "Expert cleaning professional",
  },
];

export default function FeaturedCleaners() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* H2 Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Featured Cleaners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our top-rated professional cleaners ready to make your space spotless
          </p>
        </div>

        {/* Cleaner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {featuredCleaners.map((cleaner) => (
            <div
              key={cleaner.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group"
            >
              {/* Profile Picture */}
              <div className="relative h-64 bg-gradient-to-br from-[#e6f0ff] to-[#cce0ff] flex items-center justify-center p-8">
                <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={cleaner.image}
                    alt={cleaner.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 192px, 192px"
                  />
                  {/* Verified Badge */}
                  <div className="absolute bottom-0 right-0 bg-[#007bff] rounded-full p-1.5 shadow-md border-2 border-white">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Cleaner Info */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {cleaner.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-sm font-semibold text-[#28a745]">
                    {cleaner.positiveReviews}% positive reviews
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {cleaner.completedTasks} Cleaning Jobs Completed
                </p>
                <p className="text-sm text-gray-500 italic">
                  "{cleaner.tagline}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
