import Link from "next/link";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sumaya",
    image: "/testimonials/sumaya.jpg",
    rating: 5,
    text: "The professionalism of the Company is exceptional, and they ensure a suitable lady is available for your clean day/s. The ladies allocated to me thus far have good cleaning skills... I highly recommend Bokkie Cleaning Services.",
    date: "January 15, 2024",
  },
  {
    name: "Sarah M.",
    image: "/testimonials/sarah.jpg",
    rating: 5,
    text: "Outstanding service! The team was punctual, thorough, and left my home spotless. Highly professional and reliable cleaning service.",
    date: "February 20, 2024",
  },
  {
    name: "John D.",
    image: "/testimonials/john.jpg",
    rating: 5,
    text: "Best cleaning service in Cape Town. They pay attention to every detail and use eco-friendly products. My apartment has never looked better!",
    date: "March 10, 2024",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#e6f0ff]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* H2 Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Don't just take our word for it
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our satisfied customers have to say about Bokkie Cleaning Services
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              itemScope
              itemType="https://schema.org/Review"
            >
              {/* Profile Picture */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#007bff] flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{testimonial.name}</span>
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p
                className="text-gray-700 mb-4 italic"
                itemProp="reviewBody"
              >
                "{testimonial.text}"
              </p>

              {/* Rating Schema */}
              <div
                itemProp="reviewRating"
                itemScope
                itemType="https://schema.org/Rating"
                className="hidden"
              >
                <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                <meta itemProp="bestRating" content="5" />
              </div>

              {/* Date */}
              <p className="text-sm text-gray-500" itemProp="datePublished">
                {testimonial.date}
              </p>
            </div>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Join hundreds of satisfied customers across Cape Town
          </p>
          <Link
            href="/booking/service/standard/details"
            className="inline-block px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            Book Your Cleaning Service Today
          </Link>
        </div>
      </div>
    </section>
  );
}
