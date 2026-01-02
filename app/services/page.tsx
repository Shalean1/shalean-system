import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { truncateTitle, generateMetaDescription, generateCanonicalUrl, generateImageAlt } from "@/lib/seo";
import { generateServicesPageStructuredData } from "@/lib/structured-data";
import ServiceImage from "@/components/services/ServiceImage";
import FAQItem from "@/components/services/FAQItem";
import Footer from "@/components/Footer";
import { Home, Building2, Sparkles, Calendar, Gift, Layers, CheckCircle2, Shield, Clock, Leaf, ArrowRight, Sparkle, Star, Users, Award, ChevronDown } from "lucide-react";
import { getServiceCategoryPricing } from "@/lib/supabase/booking-data";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: { default: truncateTitle("Professional Cleaning Services in Cape Town") },
  description: generateMetaDescription(
    "Discover Bokkie Cleaning Services' comprehensive range of professional cleaning services in Cape Town. Residential cleaning, commercial cleaning, deep cleaning, move-in/out, Airbnb cleaning, and specialized services. Trusted by thousands of Cape Town residents."
  ),
  keywords: [
    "cleaning services Cape Town",
    "professional cleaners Cape Town",
    "residential cleaning Cape Town",
    "commercial cleaning Cape Town",
    "deep cleaning Cape Town",
    "move in cleaning Cape Town",
    "Airbnb cleaning Cape Town",
    "office cleaning Cape Town",
    "specialized cleaning Cape Town",
    "house cleaning Cape Town",
    "apartment cleaning Cape Town",
    "window cleaning Cape Town",
    "carpet cleaning Cape Town",
    "best cleaning service Cape Town",
    "affordable cleaners Cape Town",
  ],
  alternates: {
    canonical: generateCanonicalUrl("/services"),
  },
  openGraph: {
    title: "Professional Cleaning Services in Cape Town | Bokkie Cleaning Services",
    description:
      "Comprehensive cleaning services in Cape Town: residential, commercial, deep cleaning, move-in/out, Airbnb cleaning, and specialized services. Trusted by thousands.",
    url: generateCanonicalUrl("/services"),
    siteName: "Bokkie Cleaning Services",
    images: [
      {
        url: "https://bokkiecleaning.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: generateImageAlt("Professional Cleaning Services", "Cape Town"),
        type: "image/jpeg",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Cleaning Services in Cape Town | Bokkie Cleaning Services",
    description:
      "Comprehensive cleaning services in Cape Town: residential, commercial, deep cleaning, move-in/out, Airbnb cleaning, and specialized services.",
    images: ["https://bokkiecleaning.co.za/og-image.jpg"],
    creator: "@bokkiecleaning",
    site: "@bokkiecleaning",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "ZA-WC",
    "geo.placename": "Cape Town",
    "geo.position": "-33.9806;18.4653",
    "ICBM": "-33.9806, 18.4653",
  },
};

// Base service definitions (prices will be fetched dynamically)
const baseServices = [
  {
    id: "residential-cleaning",
    name: "General Residential Cleaning Services",
    category: "Residential",
    icon: Home,
    description:
      "Regular maintenance cleaning for homes and private properties. Our professional cleaners ensure your living space stays fresh, organized, and hygienic with comprehensive cleaning services tailored to your needs.",
    features: [
      "Regular maintenance cleaning",
      "Kitchen and bathroom deep sanitization",
      "Dusting and vacuuming",
      "Floor mopping and polishing",
      "Trash removal",
      "Eco-friendly cleaning products available",
    ],
    image: "/services/residential-cleaning.jpg",
    popularAreas: ["Claremont", "Sea Point", "Camps Bay", "Constantia"],
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100/50",
  },
  {
    id: "commercial-cleaning",
    name: "General Commercial Cleaning Services",
    category: "Commercial",
    icon: Building2,
    description:
      "Professional cleaning services for businesses, offices, and retail spaces. Maintain a clean, professional workspace that impresses clients and creates a healthy environment for your team.",
    features: [
      "Office and workspace cleaning",
      "Restroom sanitization",
      "Kitchen and break room cleaning",
      "Floor care and maintenance",
      "Window cleaning",
      "Waste management",
      "Flexible scheduling",
    ],
    image: "/services/commercial-cleaning.jpg",
    popularAreas: ["Cape Town CBD", "V&A Waterfront", "Green Point", "Century City"],
    gradient: "from-emerald-500 to-emerald-600",
    bgGradient: "from-emerald-50 to-emerald-100/50",
  },
  {
    id: "specialized-cleaning",
    name: "Specialized Cleaning Services",
    category: "Specialized",
    icon: Sparkles,
    description:
      "Deep cleaning and specialized services for both residential and commercial properties. Perfect for move-in/out, post-construction, seasonal deep cleans, and specialized cleaning needs.",
    features: [
      "Deep cleaning services",
      "Move-in/move-out cleaning",
      "Post-construction cleaning",
      "Carpet and upholstery cleaning",
      "Window cleaning (interior & exterior)",
      "High-pressure cleaning",
      "Mattress cleaning",
      "All supplies and equipment included",
    ],
    image: "/services/specialized-cleaning.jpg",
    popularAreas: ["All Cape Town Areas", "Newlands", "Rondebosch", "Observatory"],
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100/50",
  },
];

const additionalServices = [
  {
    name: "Airbnb Cleaning",
    description: "Quick, efficient turnover cleaning between guest stays",
    link: "/booking/service/airbnb/details",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Holiday Cleaning",
    description: "Special cleaning services for holiday periods",
    link: "/booking/service/holiday/details",
    icon: Gift,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    name: "Carpet Cleaning",
    description: "Professional carpet and rug cleaning services",
    link: "/booking/service/carpet-cleaning/details",
    icon: Layers,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const faqs = [
  {
    question: "What cleaning services do you offer in Cape Town?",
    answer:
      "We offer comprehensive cleaning services including residential cleaning (regular maintenance for homes), commercial cleaning (offices and businesses), and specialized cleaning (deep cleaning, move-in/out, post-construction, carpet cleaning, window cleaning, and more). We also provide Airbnb cleaning and holiday cleaning services.",
  },
  {
    question: "How much do cleaning services cost in Cape Town?",
    answer:
      "Our pricing varies based on service type, property size, and frequency. On average, residential cleaning starts around R500, commercial cleaning around R800, and specialized cleaning around R900. We provide transparent pricing with no hidden fees. Get an instant quote on our booking page.",
  },
  {
    question: "Do you provide cleaning supplies and equipment?",
    answer:
      "For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. For standard cleaning, Airbnb, office, and holiday cleaning services, supplies and equipment are available at an additional cost that you can request during booking. All our cleaners use high-quality, eco-friendly cleaning products.",
  },
  {
    question: "What areas in Cape Town do you serve?",
    answer:
      "We serve Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, Green Point, Constantia, Newlands, V&A Waterfront, Century City, and 30+ more areas. If you don't see your area listed, contact us as we may still be able to help!",
  },
  {
    question: "Can I book same-day cleaning services?",
    answer:
      "Yes! We offer same-day booking for cleaning services throughout Cape Town. Availability depends on cleaner schedules, but we work hard to accommodate urgent requests. Book online or call us at +27 72 416 2547.",
  },
  {
    question: "Are your cleaners insured and vetted?",
    answer:
      "Yes, all our professional cleaners are fully insured, bonded, and thoroughly vetted. We conduct background checks and verify credentials. We also offer a 100% satisfaction guarantee on all our cleaning services.",
  },
  {
    question: "How do I book a cleaning service?",
    answer:
      "Booking is simple! Visit our booking page, choose your service type, select a cleaner based on reviews and availability, pick your preferred date and time, and complete secure payment. You'll receive instant confirmation via email and SMS.",
  },
  {
    question: "What if I'm not satisfied with the cleaning?",
    answer:
      "We offer a 100% satisfaction guarantee on all our cleaning services. If you're not completely satisfied, contact us within 24 hours and we'll send a cleaner back to address any issues at no additional cost.",
  },
];

export default async function ServicesPage() {
  const structuredData = generateServicesPageStructuredData();

  // Fetch dynamic pricing from database
  const categoryPricing = await getServiceCategoryPricing();
  const pricingMap = new Map(
    categoryPricing.map((pricing) => [pricing.category_id, pricing.display_price])
  );

  // Merge base services with dynamic prices
  const services = baseServices.map((service) => ({
    ...service,
    avgPrice: formatPrice(pricingMap.get(service.id) || 500), // Fallback to R500 if not found
  }));

  // Update FAQ with dynamic prices
  const residentialPrice = pricingMap.get("residential-cleaning") || 500;
  const commercialPrice = pricingMap.get("commercial-cleaning") || 800;
  const specializedPrice = pricingMap.get("specialized-cleaning") || 900;

  const faqsWithDynamicPrices = faqs.map((faq) => {
    if (faq.question === "How much do cleaning services cost in Cape Town?") {
      return {
        ...faq,
        answer: `Our pricing varies based on service type, property size, and frequency. On average, residential cleaning starts around ${formatPrice(residentialPrice)}, commercial cleaning around ${formatPrice(commercialPrice)}, and specialized cleaning around ${formatPrice(specializedPrice)}. We provide transparent pricing with no hidden fees. Get an instant quote on our booking page.`,
      };
    }
    return faq;
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 pt-4 pb-20 md:pb-28 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/services/residential-cleaning.jpg"
              alt="Professional cleaning services"
              fill
              className="object-cover opacity-20"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-indigo-600/90"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden z-[1]">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content Section */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Comprehensive Cleaning Services
                    <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-yellow-300 bg-clip-text text-transparent">
                      in Cape Town
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-blue-50 mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                    Comprehensive cleaning services tailored to your needs, from regular maintenance to specialized deep cleaning.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link
                      href="/booking/quote"
                      className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Get Instant Quote
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all text-lg flex items-center justify-center gap-2"
                    >
                      How It Works
                      <ChevronDown className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="relative hidden lg:block">
                  <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <Image
                      src="/services/residential-cleaning.jpg"
                      alt="Professional cleaning services in Cape Town"
                      fill
                      className="object-cover"
                      priority
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Services Section */}
        <section className="py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">
                  <Star className="w-4 h-4 fill-blue-600" />
                  <span>Our Services</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Cleaning Service Categories
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Choose from our three main service categories, each designed to meet specific
                  cleaning needs for residential and commercial properties in Cape Town.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <article
                      key={service.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2"
                    >
                      {/* Service Image */}
                      <div className="relative h-64 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`}></div>
                        <ServiceImage
                          src={service.image}
                          alt={`${service.name} in Cape Town`}
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10"></div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                          <div className={`p-2 bg-white rounded-xl shadow-lg`}>
                            <Icon className={`w-5 h-5 bg-gradient-to-br ${service.gradient} bg-clip-text text-transparent`} />
                          </div>
                          <span className={`px-4 py-2 bg-gradient-to-r ${service.gradient} text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
                            {service.category}
                          </span>
                        </div>
                      </div>

                      {/* Service Content */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                        {/* Features List */}
                        <ul className="space-y-3 mb-6">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Popular Areas */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Popular in:</p>
                          <div className="flex flex-wrap gap-2">
                            {service.popularAreas.map((area) => (
                              <span
                                key={area}
                                className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg shadow-sm border border-gray-200"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Starting from</span>
                            <p className={`text-3xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                              {service.avgPrice}
                            </p>
                          </div>
                          <Link
                            href={`/services/${service.id}`}
                            className={`group/btn px-6 py-3 bg-gradient-to-r ${service.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105`}
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Services Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Additional Cleaning Services
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Beyond our main categories, we offer specialized services for specific needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {additionalServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.name}
                      href={service.link}
                      className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-transparent hover:-translate-y-1"
                    >
                      <div className={`w-14 h-14 ${service.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 ${service.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      <div className={`flex items-center gap-2 ${service.color} font-semibold group-hover:gap-3 transition-all`}>
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-600 text-sm font-semibold mb-4">
                  <Award className="w-4 h-4" />
                  <span>Why Choose Us</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Why Choose Bokkie Cleaning Services?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We're committed to providing exceptional cleaning services that exceed your expectations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Professional Cleaners",
                    description: "All cleaners are vetted, insured, and experienced professionals",
                    icon: Users,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                  },
                  {
                    title: "100% Satisfaction Guarantee",
                    description: "We guarantee your satisfaction or we'll make it right",
                    icon: Shield,
                    color: "text-emerald-600",
                    bgColor: "bg-emerald-50",
                  },
                  {
                    title: "Flexible Scheduling",
                    description: "Book same-day or schedule in advance - we work around your schedule",
                    icon: Clock,
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                  },
                  {
                    title: "Eco-Friendly Products",
                    description: "We use environmentally safe cleaning products that are effective and gentle",
                    icon: Leaf,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="text-center group">
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about our cleaning services in Cape Town
                </p>
              </div>

              <div className="space-y-4">
                {faqsWithDynamicPrices.map((faq, idx) => (
                  <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <Sparkle className="w-4 h-4" />
                <span>Same-day booking available</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Book Your Cleaning Service?
              </h2>
              <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto">
                Get an instant quote and book your preferred cleaner today. Same-day booking available!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/booking/quote"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/service-areas"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all text-lg flex items-center justify-center gap-2"
                >
                  View Service Areas
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

