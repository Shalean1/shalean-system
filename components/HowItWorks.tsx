import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: CheckCircle,
    text: "Choose your cleaner by reviews, skills, and price",
  },
  {
    icon: CheckCircle,
    text: "Schedule when it works for you – as early as today",
  },
  {
    icon: CheckCircle,
    text: "Chat, pay, tip, and review all through one platform",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#e6f7e6]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Keeping your home clean, made simple.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                When life gets busy, let professionals handle the cleaning. More time for you, at affordable rates.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-4 mt-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-6 h-6 text-[#28a745]" />
                      </div>
                      <span className="text-lg text-gray-700">{benefit.text}</span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/booking/service/standard/details"
                  className="inline-block px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors shadow-lg text-center"
                >
                  Book Your Clean Today
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-block px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-colors shadow-lg border border-gray-300 text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/services/everyday-life-made-easier.jpg"
                  alt="Everyday life made easier - Professional cleaning services"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
