import Link from "next/link";
import { Sparkles, Users } from "lucide-react";

export default function ReadyToStart() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* H2 Heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Customer CTA */}
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-200 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready for a spotless home?
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Start enjoying a cleaner home.
              </p>
              <Link
                href="tel:+27871535250"
                className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                Sign up
              </Link>
            </div>

            {/* Cleaner CTA */}
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-200 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Grow your own business
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                while keeping Cape Town homes spotless.
              </p>
              <Link
                href="#contact"
                className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                Become a Cleaner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
