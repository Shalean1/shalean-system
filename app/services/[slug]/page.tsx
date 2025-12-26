import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { generateMetaTitle, generateMetaDescription, generateCanonicalUrl, generateImageAlt } from "@/lib/seo";
import ServiceImage from "@/components/services/ServiceImage";
import FAQItem from "@/components/services/FAQItem";
import Footer from "@/components/Footer";
import { Home, CheckCircle2, Shield, Clock, Leaf, ArrowRight, Sparkle, Star, Users, Award, Sparkles, Calendar, Gift, Layers, ChevronDown } from "lucide-react";
import { getServiceCategoryPricingByCategoryId } from "@/lib/supabase/booking-data";
import { formatPrice } from "@/lib/pricing";

export const dynamic = 'force-dynamic';

// Map old service IDs to new ones or redirect to services section
const serviceRedirects: Record<string, string> = {
  "holiday-cleaning": "residential-cleaning",
  "office-cleaning": "commercial-cleaning",
  "residential-cleaning": "residential-cleaning",
  "move-in-cleaning": "specialized-cleaning",
  "deep-cleaning": "specialized-cleaning",
};

const validServices = [
  "residential-cleaning",
  "commercial-cleaning",
  "specialized-cleaning",
];

// Service-specific data
const serviceData: Record<string, {
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  icon: any;
  image: string;
  gradient: string;
  bgGradient: string;
  features: string[];
  benefits: Array<{ title: string; description: string; icon: any }>;
  popularAreas: string[];
  faqs: Array<{ question: string; answer: string }>;
}> = {
  "residential-cleaning": {
    name: "General Residential Cleaning Services",
    shortName: "Residential Cleaning",
    description: "Regular maintenance cleaning for homes and private properties",
    longDescription: "Keep your home fresh, organized, and hygienic with our comprehensive residential cleaning services. Our professional cleaners are trained to provide thorough, consistent cleaning that maintains the comfort and cleanliness of your living space.",
    icon: Home,
    image: "/services/residential-cleaning.jpg",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100/50",
    features: [
      "Regular maintenance cleaning",
      "Kitchen and bathroom deep sanitization",
      "Dusting and vacuuming",
      "Floor mopping and polishing",
      "Trash removal",
      "Eco-friendly cleaning products available",
      "Window cleaning (interior)",
      "Appliance cleaning",
    ],
    benefits: [
      {
        title: "Consistent Quality",
        description: "Our trained professionals ensure every clean meets our high standards",
        icon: Star,
      },
      {
        title: "Flexible Scheduling",
        description: "Book weekly, bi-weekly, or monthly - we work around your schedule",
        icon: Calendar,
      },
      {
        title: "Eco-Friendly Options",
        description: "Choose eco-friendly cleaning products that are safe for your family and pets",
        icon: Leaf,
      },
      {
        title: "Fully Insured",
        description: "All cleaners are insured and bonded for your peace of mind",
        icon: Shield,
      },
    ],
    popularAreas: ["Claremont", "Sea Point", "Camps Bay", "Constantia", "Green Point", "Newlands"],
    faqs: [
      {
        question: "What is included in residential cleaning?",
        answer: "Our residential cleaning service includes dusting all surfaces, vacuuming and mopping floors, cleaning and sanitizing bathrooms and kitchens, wiping down appliances, taking out trash, and general tidying. We can customize the service based on your specific needs.",
      },
      {
        question: "How often should I book residential cleaning?",
        answer: "Most customers book weekly or bi-weekly cleaning to maintain a consistently clean home. However, you can schedule cleaning as frequently or infrequently as needed - we offer one-time, weekly, bi-weekly, and monthly options.",
      },
      {
        question: "Do I need to provide cleaning supplies?",
        answer: "For standard residential cleaning, you can choose to provide your own supplies or request that our cleaners bring supplies at an additional cost. All our cleaners use high-quality, eco-friendly cleaning products when supplies are provided.",
      },
      {
        question: "Can I request specific areas to focus on?",
        answer: "Absolutely! When booking, you can specify which areas need extra attention. Our cleaners will prioritize your requests while ensuring all standard cleaning tasks are completed.",
      },
      {
        question: "What if I'm not satisfied with the cleaning?",
        answer: "We offer a 100% satisfaction guarantee. If you're not completely satisfied, contact us within 24 hours and we'll send a cleaner back to address any issues at no additional cost.",
      },
      {
        question: "How long does a residential cleaning take?",
        answer: "The duration depends on the size of your home and the level of cleaning required. Typically, a 2-bedroom, 1-bathroom home takes 2-3 hours, while larger homes may take 4-6 hours. We'll provide an estimated time when you book.",
      },
    ],
  },
  "commercial-cleaning": {
    name: "General Commercial Cleaning Services",
    shortName: "Commercial Cleaning",
    description: "Professional cleaning services for businesses, offices, and retail spaces",
    longDescription: "Maintain a clean, professional workspace that impresses clients and creates a healthy environment for your team. Our commercial cleaning services are designed to keep your business looking its best.",
    icon: Home,
    image: "/services/commercial-cleaning.jpg",
    gradient: "from-emerald-500 to-emerald-600",
    bgGradient: "from-emerald-50 to-emerald-100/50",
    features: [
      "Office and workspace cleaning",
      "Restroom sanitization",
      "Kitchen and break room cleaning",
      "Floor care and maintenance",
      "Window cleaning",
      "Waste management",
      "Flexible scheduling",
    ],
    benefits: [
      {
        title: "Professional Standards",
        description: "Maintain a professional appearance that impresses clients and employees",
        icon: Award,
      },
      {
        title: "Flexible Scheduling",
        description: "Book same-day or schedule in advance - we work around your business hours",
        icon: Clock,
      },
      {
        title: "Eco-Friendly Products",
        description: "We use environmentally safe cleaning products that are effective and gentle",
        icon: Leaf,
      },
      {
        title: "Fully Insured",
        description: "All cleaners are insured and bonded for your peace of mind",
        icon: Shield,
      },
    ],
    popularAreas: ["Cape Town CBD", "V&A Waterfront", "Green Point", "Century City"],
    faqs: [
      {
        question: "What areas do you clean in commercial spaces?",
        answer: "We clean all areas of your commercial space including offices, restrooms, kitchens, break rooms, reception areas, conference rooms, and common areas. We can also provide specialized services like window cleaning and floor care.",
      },
      {
        question: "Can you clean after business hours?",
        answer: "Yes! We offer flexible scheduling including after-hours cleaning to minimize disruption to your business operations. Many of our commercial clients prefer evening or weekend cleaning.",
      },
      {
        question: "Do you provide cleaning supplies?",
        answer: "For standard commercial cleaning, supplies are available at an additional cost that you can request during booking. All our cleaners use high-quality, eco-friendly cleaning products.",
      },
      {
        question: "How do I book regular commercial cleaning?",
        answer: "You can book one-time cleaning or set up a recurring schedule. Contact us to discuss your needs and we'll create a customized cleaning plan for your business.",
      },
    ],
  },
  "specialized-cleaning": {
    name: "Specialized Cleaning Services",
    shortName: "Specialized Cleaning",
    description: "Deep cleaning and specialized services for both residential and commercial properties",
    longDescription: "Perfect for move-in/out, post-construction, seasonal deep cleans, and specialized cleaning needs. Our specialized cleaning services go beyond regular maintenance to address every corner and surface.",
    icon: Sparkles,
    image: "/services/specialized-cleaning.jpg",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100/50",
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
    benefits: [
      {
        title: "Comprehensive Cleaning",
        description: "Thorough cleaning that addresses every corner, surface, and hard-to-reach area",
        icon: Sparkles,
      },
      {
        title: "All Supplies Included",
        description: "All cleaning supplies and equipment are included at no extra charge",
        icon: Gift,
      },
      {
        title: "Move-In/Out Ready",
        description: "Perfect for property transitions - we ensure spaces are spotless for new occupants",
        icon: Home,
      },
      {
        title: "Specialized Equipment",
        description: "We use professional-grade equipment for deep cleaning, carpet cleaning, and more",
        icon: Layers,
      },
    ],
    popularAreas: ["All Cape Town Areas", "Newlands", "Rondebosch", "Observatory"],
    faqs: [
      {
        question: "What's the difference between regular cleaning and deep cleaning?",
        answer: "Deep cleaning is more comprehensive than regular cleaning. It includes cleaning behind appliances, inside ovens and refrigerators, detailed scrubbing of bathrooms, cleaning baseboards and window sills, and addressing areas that aren't typically cleaned during regular maintenance.",
      },
      {
        question: "How long does a deep cleaning take?",
        answer: "Deep cleaning typically takes 4-8 hours depending on the size of your property and the level of detail required. We'll provide an estimated time when you book based on your specific needs.",
      },
      {
        question: "Are cleaning supplies included?",
        answer: "Yes! For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. Our cleaners bring everything needed for a thorough clean.",
      },
      {
        question: "When should I book move-in/out cleaning?",
        answer: "It's best to book move-in/out cleaning 1-2 weeks in advance to ensure availability. However, we also offer same-day booking when possible. For move-out cleaning, schedule it for the day after you've moved all belongings out.",
      },
    ],
  },
};

// Generate metadata for each service
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    // If it's an old service ID, redirect to the new one
    if (serviceRedirects[slug] && serviceRedirects[slug] !== slug) {
      return {};
    }

    // If it's not a valid service, return empty metadata (will redirect)
    if (!validServices.includes(slug)) {
      return {};
    }

    const service = serviceData[slug];
    if (!service) {
      return {};
    }

  const title = `${service.shortName} in Cape Town`;
  const description = `${service.description}. Professional ${service.shortName.toLowerCase()} services throughout Cape Town. Trusted by thousands of residents.`;

  return {
    title: generateMetaTitle(title),
    description: generateMetaDescription(description),
    keywords: [
      `${service.shortName.toLowerCase()} Cape Town`,
      `professional ${service.shortName.toLowerCase()} Cape Town`,
      `cleaning services Cape Town`,
      `house cleaning Cape Town`,
      `residential cleaning Cape Town`,
      `commercial cleaning Cape Town`,
      `best cleaning service Cape Town`,
      `affordable cleaners Cape Town`,
    ],
    alternates: {
      canonical: generateCanonicalUrl(`/services/${slug}`),
    },
    openGraph: {
      title: `${service.shortName} in Cape Town | Bokkie Cleaning Services`,
      description: description,
      url: generateCanonicalUrl(`/services/${slug}`),
      siteName: "Bokkie Cleaning Services",
      images: [
        {
          url: "https://bokkie.co.za/og-image.jpg",
          width: 1200,
          height: 630,
          alt: generateImageAlt(service.shortName, "Cape Town"),
          type: "image/jpeg",
        },
      ],
      locale: "en_ZA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.shortName} in Cape Town | Bokkie Cleaning Services`,
      description: description,
      images: ["https://bokkie.co.za/og-image.jpg"],
      creator: "@shaloclean",
      site: "@shaloclean",
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
  } catch (error) {
    console.error("Error generating metadata for service page:", error);
    return {
      title: "Service Page",
      description: "Cleaning services in Cape Town",
    };
  }
}

// Generate structured data for service page
function generateServiceStructuredData(slug: string, service: typeof serviceData[string], price: number) {
  const baseUrl = "https://bokkie.co.za";
  const serviceUrl = `${baseUrl}/services/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${baseUrl}/services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.shortName,
            item: serviceUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        url: serviceUrl,
        name: `${service.shortName} in Cape Town`,
        description: service.description,
        inLanguage: "en-ZA",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Services",
              item: `${baseUrl}/services`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: service.shortName,
              item: serviceUrl,
            },
          ],
        },
      },
      {
        "@type": "Service",
        name: service.name,
        description: service.longDescription,
        provider: {
          "@type": "Organization",
          name: "Bokkie Cleaning Services",
          url: baseUrl,
        },
        areaServed: {
          "@type": "City",
          name: "Cape Town",
        },
        offers: {
          "@type": "Offer",
          price: price.toString(),
          priceCurrency: "ZAR",
          description: `Starting from ${formatPrice(price)}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // If it's an old service ID, redirect to the new one
  if (serviceRedirects[slug] && serviceRedirects[slug] !== slug) {
    redirect(`/services/${serviceRedirects[slug]}`);
  }

  // If it's not a valid service, redirect to services section
  if (!validServices.includes(slug)) {
    redirect("/services");
  }

  const service = serviceData[slug];
  if (!service) {
    redirect("/services");
  }

  // Fetch pricing with error handling
  let displayPrice = 500;
  try {
    const pricing = await getServiceCategoryPricingByCategoryId(slug);
    displayPrice = pricing?.display_price || 500;
  } catch (error) {
    console.error(`Error fetching pricing for ${slug}:`, error);
    // Use default price if fetch fails
  }
  
  const Icon = service.icon;

  // Generate structured data
  const structuredData = generateServiceStructuredData(slug, service, displayPrice);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className={`relative bg-gradient-to-br ${service.gradient} pt-4 pb-16 sm:pb-20 md:pb-28 overflow-hidden`}>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <ServiceImage
              src={service.image}
              alt={`${service.shortName} in Cape Town`}
              className="object-cover opacity-20"
              priority
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-90`}></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden z-[1]">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                {/* Content Section */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{service.shortName}</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    {service.shortName}
                    <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-yellow-200 to-yellow-300 bg-clip-text text-transparent">
                      in Cape Town
                    </span>
                  </h1>
                  
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                    {service.longDescription}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0">
                    <Link
                      href="/booking/quote"
                      className="group bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="#features"
                      className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all text-base sm:text-lg flex items-center justify-center gap-2"
                    >
                      Learn More
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="relative hidden lg:block">
                  <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <ServiceImage
                      src={service.image}
                      alt={`${service.shortName} services in Cape Town`}
                      className="object-cover"
                      priority
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-30`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${service.bgGradient} rounded-full text-blue-600 text-xs sm:text-sm font-semibold mb-3 sm:mb-4`}>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-blue-600" />
                  <span>What's Included</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                  Comprehensive {service.shortName} Services
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                  Our professional cleaners provide thorough, consistent cleaning tailored to your needs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-700 font-medium">{feature}</p>
                  </div>
                ))}
              </div>

              {/* Benefits Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {service.benefits.map((benefit, idx) => {
                  const BenefitIcon = benefit.icon;
                  // Determine icon color based on service gradient
                  const iconColor = slug === "residential-cleaning" 
                    ? "text-blue-600" 
                    : slug === "commercial-cleaning" 
                    ? "text-emerald-600" 
                    : "text-purple-600";
                  return (
                    <div key={idx} className="text-center group">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${service.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <BenefitIcon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${iconColor}`} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{benefit.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2 sm:px-0">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                  Transparent Pricing
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4 sm:px-0">
                  No hidden fees. Get an instant quote based on your property size and needs.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl border border-gray-200">
                <div className="text-center mb-6 sm:mb-8">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">Starting from</span>
                  <p className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent mt-2`}>
                    {formatPrice(displayPrice)}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 px-2 sm:px-0">
                    Final price depends on property size, frequency, and additional services
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/booking/quote"
                    className={`group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r ${service.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105`}
                  >
                    Get Instant Quote
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    How It Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Areas Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                  Serving All of Cape Town
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4 sm:px-0">
                  We provide {service.shortName.toLowerCase()} services throughout Cape Town and surrounding areas
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg border border-gray-200">
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                  {service.popularAreas.map((area) => (
                    <Link
                      key={area}
                      href={`/areas/${area.toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      {area}
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-6 sm:mt-8">
                  <Link
                    href="/service-areas"
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2 text-sm sm:text-base"
                  >
                    View All Service Areas
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                  Frequently Asked Questions
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4 sm:px-0">
                  Everything you need to know about our {service.shortName.toLowerCase()} services
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {service.faqs.map((faq, idx) => (
                  <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`relative py-12 sm:py-16 md:py-20 bg-gradient-to-br ${service.gradient} overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Same-day booking available</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2 sm:px-0">
                Ready to Book Your {service.shortName}?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4 sm:px-0">
                Get an instant quote and book your preferred cleaner today. Same-day booking available!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
                <Link
                  href="/booking/quote"
                  className="group bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/service-areas"
                  className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg flex items-center justify-center gap-2"
                >
                  View Service Areas
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
