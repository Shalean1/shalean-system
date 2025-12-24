import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  Shield, 
  Clock,
  Star,
  Phone,
  MessageCircle,
  Users,
  Leaf,
  Award
} from "lucide-react";
import { generateCanonicalUrl, generateMetaDescription } from "@/lib/seo";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How It Works: Book Professional Cleaning Services in Cape Town | Shalean Cleaning Services",
  description: generateMetaDescription("Learn how to book professional cleaning services in Cape Town with Shalean. Simple 5-step process: choose service, select cleaner, schedule, pay securely, and enjoy your clean space. Same-day booking available. Rated 4.8 stars with 150+ reviews."),
  keywords: [
    "how it works cleaning service Cape Town",
    "how to book cleaning service Cape Town",
    "cleaning service booking process Cape Town",
    "how does Shalean cleaning work",
    "step by step booking cleaning service Cape Town",
    "how to schedule cleaning service Cape Town",
    "book cleaning service online Cape Town",
    "cleaning service booking guide Cape Town",
  ],
  openGraph: {
    title: "How It Works: Book Professional Cleaning Services in Cape Town",
    description: "Learn how to book professional cleaning services in Cape Town with Shalean. Simple 5-step process with same-day booking available.",
    url: "https://shalean.co.za/how-it-works",
    siteName: "Shalean Cleaning Services",
    images: [
      {
        url: "https://shalean.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "How It Works - Shalean Cleaning Services Cape Town",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works: Book Professional Cleaning Services in Cape Town",
    description: "Learn how to book professional cleaning services in Cape Town. Simple 5-step process with same-day booking.",
    images: ["https://shalean.co.za/og-image.jpg"],
  },
  alternates: {
    canonical: generateCanonicalUrl("/how-it-works"),
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

// Step-by-step process data
const bookingSteps = [
  {
    number: 1,
    title: "Choose Your Service",
    description: "Select from our range of professional cleaning services including residential cleaning, commercial cleaning, deep cleaning, move-in/out cleaning, and specialized services. Each service is tailored to meet your specific needs in Cape Town.",
    icon: Sparkles,
    image: "/services/residential-cleaning.jpg",
    details: [
      "Residential cleaning for homes and apartments",
      "Commercial cleaning for offices and businesses",
      "Deep cleaning for thorough, detailed cleaning",
      "Move-in/out cleaning for property transitions",
      "Specialized services like Airbnb cleaning and window cleaning",
    ],
    link: "/services",
    linkText: "View All Services",
  },
  {
    number: 2,
    title: "Select Your Cleaner",
    description: "Browse our network of vetted, professional cleaners. View their profiles, read customer reviews, check their skills and specialties, and compare prices. Choose the cleaner that best matches your needs and preferences.",
    icon: Users,
    image: "/services/team-at-your-fingertips.jpg",
    details: [
      "Read verified customer reviews and ratings",
      "View cleaner profiles with skills and experience",
      "Compare prices and availability",
      "Choose cleaners with specific specialties",
      "All cleaners are background-checked and insured",
    ],
    link: "/#featured-cleaners",
    linkText: "Browse Cleaners",
  },
  {
    number: 3,
    title: "Schedule Your Clean",
    description: "Pick a date and time that works for you. We offer flexible scheduling with same-day booking available. Whether you need a one-time clean or recurring service, we accommodate your schedule.",
    icon: Calendar,
    image: "/services/everyday-life-made-easier.jpg",
    details: [
      "Same-day booking available",
      "Flexible scheduling 7 days a week",
      "Recurring cleaning options",
      "Easy rescheduling if needed",
      "24/7 availability for bookings",
    ],
    link: "/booking/quote",
    linkText: "Get Started",
  },
  {
    number: 4,
    title: "Payment & Confirmation",
    description: "Securely pay online through our encrypted payment system. You'll receive instant confirmation via email and SMS. All payments are processed securely, and you can pay via credit card, debit card, or other secure payment methods.",
    icon: CreditCard,
    image: "/services/commercial-cleaning.jpg",
    details: [
      "Secure, encrypted payment processing",
      "Instant booking confirmation",
      "Multiple payment options available",
      "Transparent pricing with no hidden fees",
      "Payment protection and guarantees",
    ],
    link: "/booking/quote",
    linkText: "Book Now",
  },
  {
    number: 5,
    title: "Enjoy Your Clean Space",
    description: "Your professional cleaner arrives on time, ready to complete the cleaning according to your specifications. You can communicate directly through our platform, and after completion, you can review and rate your experience.",
    icon: CheckCircle,
    image: "/services/spotless-home-guide.jpg",
    details: [
      "Cleaners arrive on time and professionally equipped",
      "Direct communication through our platform",
      "Quality assurance and satisfaction guarantee",
      "Post-cleaning follow-up and support",
      "Easy rebooking for future services",
    ],
    link: "/booking/service/standard/details",
    linkText: "Book Your Clean",
  },
];

// FAQ data
const faqs = [
  {
    question: "How do I book a cleaning service in Cape Town?",
    answer: "Booking a cleaning service with Shalean is simple. Visit our booking page, choose your service type, select a cleaner based on reviews and availability, pick your preferred date and time, and complete secure payment. You'll receive instant confirmation. Same-day booking is available for urgent cleaning needs.",
  },
  {
    question: "Can I book same-day cleaning?",
    answer: "Yes! Shalean Cleaning Services offers same-day booking for cleaning services in Cape Town. Simply select your service, choose an available cleaner, and schedule your clean for today. Availability depends on cleaner schedules, but we work hard to accommodate urgent requests.",
  },
  {
    question: "How do I choose a cleaner?",
    answer: "You can browse our network of professional cleaners, read verified customer reviews and ratings, view their skills and specialties, and compare prices. Each cleaner profile shows their experience, areas of expertise, and customer feedback. Choose the cleaner that best matches your cleaning needs and preferences.",
  },
  {
    question: "What if I'm not satisfied with the cleaning?",
    answer: "We offer a 100% satisfaction guarantee on all our cleaning services. If you're not completely satisfied, contact us within 24 hours and we'll send a cleaner back to address any issues at no additional cost. Your satisfaction is our priority.",
  },
  {
    question: "Do cleaners bring their own supplies?",
    answer: "For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. For standard cleaning, Airbnb, office, and holiday cleaning services, supplies and equipment are available at an additional cost that you can request during booking. All our cleaners use high-quality, eco-friendly cleaning products that are effective yet gentle on your home and the environment.",
  },
  {
    question: "How much does cleaning service cost in Cape Town?",
    answer: "Pricing varies based on the type of service, size of your space, and frequency. We offer transparent pricing with no hidden fees. Get an instant quote by visiting our booking page and entering your requirements. We provide competitive rates for professional cleaning services across Cape Town.",
  },
  {
    question: "What areas in Cape Town do you serve?",
    answer: "Shalean Cleaning Services covers Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, Green Point, V&A Waterfront, Constantia, Newlands, Rondebosch, and many more neighborhoods. Check our service areas page for a complete list of locations we serve.",
  },
  {
    question: "Can I schedule recurring cleaning services?",
    answer: "Absolutely! We offer flexible recurring cleaning options including weekly, bi-weekly, and monthly schedules. Set up your preferred schedule and enjoy consistent, professional cleaning services. You can easily modify or cancel recurring bookings through your dashboard.",
  },
  {
    question: "Are your cleaners insured and background-checked?",
    answer: "Yes, all our cleaners are thoroughly vetted, background-checked, and insured. We ensure every cleaner in our network meets our high standards for professionalism, reliability, and trustworthiness. Your safety and security are our top priorities.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and secure online payment methods. All payments are processed through our encrypted payment system for your security. Payment is required at the time of booking to confirm your cleaning service.",
  },
  {
    question: "How far in advance should I book?",
    answer: "You can book as far in advance as you'd like, or take advantage of our same-day booking option. For best availability, we recommend booking at least 24-48 hours in advance, especially for weekends and popular time slots. However, we always try to accommodate last-minute requests.",
  },
  {
    question: "What's included in a standard cleaning service?",
    answer: "Our standard cleaning includes dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning, trash removal, and general tidying. Deep cleaning services include additional tasks like inside appliances, baseboards, and detailed scrubbing. Specific inclusions vary by service type.",
  },
];

// Benefits data
const benefits = [
  {
    icon: Shield,
    title: "100% Satisfaction Guarantee",
    description: "We stand behind our work with a complete satisfaction guarantee. If you're not happy, we'll make it right.",
  },
  {
    icon: Star,
    title: "5-Star Rated Cleaners",
    description: "All our cleaners are highly rated by customers. Browse reviews and ratings to find the perfect match for your needs.",
  },
  {
    icon: Clock,
    title: "Same-Day Booking",
    description: "Need cleaning today? We offer same-day booking for urgent cleaning needs across Cape Town.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Products",
    description: "Our cleaners use eco-friendly, safe cleaning products that are effective yet gentle on your home and environment.",
  },
  {
    icon: Award,
    title: "Vetted Professionals",
    description: "Every cleaner is background-checked, insured, and trained to meet our high standards of professionalism.",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Communicate directly with your cleaner through our secure platform. Chat, share instructions, and coordinate easily.",
  },
];

export default function HowItWorksPage() {
  // Generate structured data for this page
  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Book Professional Cleaning Services in Cape Town",
    description: "Step-by-step guide on how to book professional cleaning services with Shalean Cleaning Services in Cape Town",
    step: bookingSteps.map((step) => ({
      "@type": "HowToStep",
      position: step.number,
      name: step.title,
      text: step.description,
      itemListElement: step.details.map((detail, index) => ({
        "@type": "HowToDirection",
        position: index + 1,
        text: detail,
      })),
    })),
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://shalean.co.za",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "How It Works",
        item: "https://shalean.co.za/how-it-works",
      },
    ],
  };

  const webpageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://shalean.co.za/how-it-works#webpage",
    url: "https://shalean.co.za/how-it-works",
    name: "How It Works: Book Professional Cleaning Services in Cape Town",
    description: "Learn how to book professional cleaning services in Cape Town with Shalean. Simple 5-step process with same-day booking available.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": "https://shalean.co.za#website",
    },
    about: {
      "@id": "https://shalean.co.za#organization",
    },
    breadcrumb: {
      "@id": "https://shalean.co.za/how-it-works#breadcrumb",
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageStructuredData) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-green-50 pt-12 pb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/hero-background.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    Book Professional Cleaning Services in Cape Town
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Booking professional cleaning services in Cape Town has never been easier. Follow our simple 5-step process to get started today.
                  </p>
                  
                  {/* Trust Signals */}
                  <div className="flex flex-wrap items-center gap-6 mb-8 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                        <div className="relative w-5 h-5">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <div className="absolute inset-0 overflow-hidden" style={{ width: '80%' }}>
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-700 font-semibold">4.8 Rating</span>
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">150+</span> Verified Reviews
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Same-Day</span> Booking Available
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link
                      href="/booking/quote"
                      className="inline-flex items-center justify-center px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors shadow-lg"
                    >
                      Book Your Clean Today
                    </Link>
                    <a
                      href="tel:+27871535250"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-colors shadow-lg border border-gray-300"
                    >
                      <Phone className="w-5 h-5" />
                      Call Us Now
                    </a>
                  </div>
                </div>
                <div className="relative w-full aspect-[16/9] md:aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/services/everyday-life-made-easier.jpg"
                    alt="Professional cleaning services made easy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Process */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Simple 5-Step Booking Process
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From choosing your service to enjoying your clean space, we've made the process simple and straightforward.
                </p>
              </div>

              <div className="space-y-12">
                {bookingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isEven = index % 2 === 0;
                  return (
                    <div
                      key={step.number}
                      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                    >
                      {/* Step Image */}
                      <div className="w-full md:w-1/2">
                        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-xl">
                          <Image
                            src={step.image}
                            alt={step.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="w-full md:w-1/2">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Step Number & Icon */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {step.number}
                              </div>
                              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-[#007bff]" />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {step.title}
                            </h3>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-3 mb-6">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={step.link}
                          className="inline-flex items-center gap-2 text-[#007bff] hover:text-[#0056b3] font-semibold transition-colors"
                        >
                          {step.linkText}
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Service Experience Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  What to Expect During Your Cleaning Service
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Understanding what happens during your cleaning service helps ensure a smooth experience.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src="/services/residential-cleaning.jpg"
                      alt="Before your clean"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Before Your Clean</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">You'll receive a confirmation with cleaner details</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Direct communication channel opens with your cleaner</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">You can share specific instructions or preferences</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src="/services/commercial-cleaning.jpg"
                      alt="During your clean"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">During Your Clean</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Cleaner arrives on time and ready to work</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Professional cleaning according to service type</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">You can monitor progress through our platform</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src="/services/spotless-home-guide.jpg"
                      alt="After your clean"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">After Your Clean</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Quality check and satisfaction confirmation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Easy rebooking for future services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Review and rate your experience</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src="/services/eco-friendly-cleaning-guide.jpg"
                      alt="Quality assurance"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">100% satisfaction guarantee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Post-cleaning follow-up and support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Continuous improvement based on feedback</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Benefits of Booking with Shalean
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We're committed to providing the best cleaning service experience in Cape Town.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                      <div className="w-16 h-16 rounded-full bg-[#007bff] flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Common Questions About Our Booking Process
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about booking cleaning services in Cape Town
                </p>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 md:p-8 rounded-xl shadow-lg"
                    itemScope
                    itemType="https://schema.org/Question"
                  >
                    <h3
                      className="text-xl font-bold text-gray-900 mb-4"
                      itemProp="name"
                    >
                      {faq.question}
                    </h3>
                    <div
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <p className="text-gray-600 leading-relaxed" itemProp="text">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/hero-background.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Experience Professional Cleaning Services?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join hundreds of satisfied customers across Cape Town. Book your cleaning service today and enjoy a spotless home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/booking/quote"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-[#007bff] font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Get Started Now
                </Link>
                <a
                  href="tel:+27871535250"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border-2 border-white"
                >
                  <Phone className="w-5 h-5" />
                  Call +27 87 153 5250
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

