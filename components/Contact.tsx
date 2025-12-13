import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Contact us today to discuss your cleaning
            needs.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
            <div className="bg-[#D1FAE5] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Phone className="w-8 h-8 text-[#0C53ED]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Phone
            </h3>
            <a
              href="tel:+27871535250"
              className="text-[#0C53ED] hover:text-[#0A3FC7] font-semibold text-lg"
            >
              +27 87 153 5250
            </a>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
            <div className="bg-[#D1FAE5] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Mail className="w-8 h-8 text-[#10B981]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
            <a
              href="mailto:support@shalean.com"
              className="text-[#10B981] hover:text-[#14B8A6] font-semibold text-lg break-all"
            >
              support@shalean.com
            </a>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
            <div className="bg-[#D1FAE5] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <MapPin className="w-8 h-8 text-[#14B8A6]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Address
            </h3>
            <p className="text-gray-700">
              39 Harvey Road
              <br />
              Claremont, Cape Town 7708
              <br />
              Western Cape, South Africa
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-[#D1FAE5] to-[#D1FAE5] p-8 rounded-lg border border-[#10B981]/30">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-[#0C53ED] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Operating Hours
              </h3>
              <p className="text-gray-700">
                <strong>24/7 Operation</strong>
                <br />
                We're available around the clock, every day of the week, including holidays.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                Contact us anytime to book your preferred time slot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
