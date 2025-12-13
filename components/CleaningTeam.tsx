import Image from "next/image";
import { CheckCircle } from "lucide-react";

const teamBenefits = [
  {
    icon: CheckCircle,
    text: "Compare cleaner reviews, ratings, and prices",
  },
  {
    icon: CheckCircle,
    text: "Choose and connect with the best person for the job",
  },
  {
    icon: CheckCircle,
    text: "Save your favorites to book again and again",
  },
];

export default function CleaningTeam() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/services/team-at-your-fingertips.jpg"
                  alt="A go-to team at your fingertips - Trusted cleaning professionals"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Trusted cleaning professionals at your fingertips
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Build your team of local, background-checked cleaners for all your cleaning needs. From regular cleaning to deep cleans, we cover it all.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-4 mt-8">
                {teamBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <span className="text-lg text-gray-700">{benefit.text}</span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA Button */}
              <div className="pt-4">
                <a
                  href="#contact"
                  className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Find Your Cleaner
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
