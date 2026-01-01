import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const guides = [
  {
    id: "maintain-spotless-home",
    title: "How to maintain a spotless home",
    description: "Expert tips and tricks for keeping your home clean and organized",
    image: "/services/spotless-home-guide.jpg",
  },
  {
    id: "move-in-cleaning",
    title: "Preparing for move-in cleaning",
    description: "Complete guide to getting your new home ready",
    image: "/services/move-in-cleaning-guide.jpg",
  },
  {
    id: "office-cleaning-best-practices",
    title: "Office cleaning best practices",
    description: "Maintain a professional and healthy workspace",
    image: "/services/commercial-cleaning.jpg",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cleaning Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert tips and advice to help you maintain a clean and healthy home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {guides.map((guide) => {
            return (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {guide.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}





























