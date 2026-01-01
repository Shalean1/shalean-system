import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Professional Cleaning Services Cape Town",
  description: "Get in touch with Bokkie Cleaning Services in Cape Town. Contact us via phone, email, or visit our office in Lansdowne. We're available 24/7 to help with your cleaning needs. Professional cleaners serving Sea Point, Camps Bay, Claremont & more.",
  keywords: [
    "contact cleaning services Cape Town",
    "cleaning services contact Cape Town",
    "professional cleaners contact",
    "Bokkie Cleaning contact",
    "cleaning services phone number",
    "cleaning services email Cape Town",
    "cleaning services address Cape Town",
    "contact cleaners Cape Town",
    "cleaning services support",
    "book cleaning service Cape Town",
  ],
  openGraph: {
    title: "Contact Us | Bokkie Cleaning Services Cape Town",
    description: "Get in touch with Bokkie Cleaning Services. Available 24/7. Professional cleaning services in Cape Town. Call +27 72 416 2547 or email info@bokkiecleaning.co.za",
    url: "https://www.bokkiecleaning.co.za/contact",
    siteName: "Bokkie Cleaning Services",
    images: [
      {
        url: "https://www.bokkiecleaning.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Bokkie Cleaning Services - Professional Cleaning Services in Cape Town",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Bokkie Cleaning Services Cape Town",
    description: "Get in touch with Bokkie Cleaning Services. Available 24/7. Call +27 72 416 2547 or email info@bokkiecleaning.co.za",
    images: ["https://www.bokkiecleaning.co.za/og-image.jpg"],
    creator: "@shaloclean",
    site: "@shaloclean",
  },
  alternates: {
    canonical: "https://www.bokkiecleaning.co.za/contact",
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

export default function ContactPage() {
  const baseUrl = "https://www.bokkiecleaning.co.za";
  const contactUrl = `${baseUrl}/contact`;

  // ContactPage structured data
  const contactPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${contactUrl}#contactpage`,
    url: contactUrl,
    name: "Contact Us | Bokkie Cleaning Services",
    description: "Contact Bokkie Cleaning Services for professional cleaning services in Cape Town. Available 24/7. Phone: +27 72 416 2547, Email: info@bokkiecleaning.co.za",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    mainEntity: {
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      name: "Bokkie Cleaning Services",
      telephone: "+27724162547",
      email: "info@bokkiecleaning.co.za",
      address: {
        "@type": "PostalAddress",
        streetAddress: "348 Imam Haron Road Lansdowne",
        addressLocality: "Cape Town",
        addressRegion: "Western Cape",
        postalCode: "7780",
        addressCountry: "ZA",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+27724162547",
          contactType: "Customer Service",
          areaServed: "ZA",
          availableLanguage: ["en", "af"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        },
        {
          "@type": "ContactPoint",
          telephone: "+27724162547",
          contactType: "Sales",
          areaServed: "ZA",
          availableLanguage: ["en", "af"],
        },
        {
          "@type": "ContactPoint",
          email: "info@bokkiecleaning.co.za",
          contactType: "Customer Support",
          areaServed: "ZA",
          availableLanguage: ["en", "af"],
        },
      ],
    },
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${contactUrl}#breadcrumb`,
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
        name: "Contact Us",
        item: contactUrl,
      },
    ],
  };

  // WebPage structured data
  const webpageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${contactUrl}#webpage`,
    url: contactUrl,
    name: "Contact Us | Bokkie Cleaning Services",
    description: "Contact Bokkie Cleaning Services for professional cleaning services in Cape Town. Available 24/7.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    breadcrumb: {
      "@id": `${contactUrl}#breadcrumb`,
    },
  };

  // FAQ structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${contactUrl}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "How can I contact Bokkie Cleaning Services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can contact Bokkie Cleaning Services by phone at +27 72 416 2547, by email at info@bokkiecleaning.co.za, or visit our office at 348 Imam Haron Road Lansdowne, Cape Town 7780, Western Cape. We're available 24/7 to assist with your cleaning needs.",
        },
      },
      {
        "@type": "Question",
        name: "What are your operating hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We operate 24/7, every day of the week, including holidays. You can contact us anytime to book your preferred time slot or discuss your cleaning needs.",
        },
      },
      {
        "@type": "Question",
        name: "How quickly can I get a response?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We aim to respond to all inquiries within 24 hours. For urgent requests, please contact us directly. Same-day booking is available for cleaning services.",
        },
      },
      {
        "@type": "Question",
        name: "Do you serve my area in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We serve Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, Green Point, Constantia, V&A Waterfront, and 30+ more areas. If you don't see your area listed, please contact us as we may still be able to help!",
        },
      },
      {
        "@type": "Question",
        name: "Can I book a cleaning service over the phone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can book a cleaning service by contacting us. Our team will help you choose the right service, select a cleaner, and schedule your preferred date and time. You can also book online through our website.",
        },
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      contactPageStructuredData,
      breadcrumbStructuredData,
      webpageStructuredData,
      faqStructuredData,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're here to help! Get in touch with Bokkie Cleaning Services for professional cleaning services in Cape Town. 
                Available 24/7 to assist with your cleaning needs.
              </p>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
                <div className="bg-[#DBEAFE] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Phone className="w-8 h-8 text-[#0C53ED]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Phone
                </h2>
                <a
                  href="tel:+27724162547"
                  className="text-[#0C53ED] hover:text-[#0A3FC7] font-semibold text-lg block mb-2"
                  aria-label="Call Bokkie Cleaning Services"
                >
                  +27 72 416 2547
                </a>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
                <div className="bg-[#DBEAFE] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail className="w-8 h-8 text-[#0C53ED]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email</h2>
                <a
                  href="mailto:info@bokkiecleaning.co.za"
                  className="text-[#0C53ED] hover:text-[#0A3FC7] font-semibold text-lg break-all block mb-2"
                  aria-label="Email Bokkie Cleaning Services"
                >
                  info@bokkiecleaning.co.za
                </a>
                <p className="text-sm text-gray-600">We respond within 24 hours</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 text-center">
                <div className="bg-[#DBEAFE] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="w-8 h-8 text-[#0C53ED]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Address
                </h2>
                <address className="text-gray-700 not-italic">
                  348 Imam Haron Road Lansdowne
                  <br />
                  Cape Town 7780
                  <br />
                  Western Cape, South Africa
                </address>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mb-12 bg-gradient-to-r from-[#DBEAFE] to-[#DBEAFE] p-8 rounded-lg border border-[#0C53ED]/30">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-[#0C53ED] mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Operating Hours
                  </h2>
                  <p className="text-gray-700 mb-2">
                    <strong>24/7 Operation</strong>
                  </p>
                  <p className="text-gray-700 mb-2">
                    We're available around the clock, every day of the week, including holidays. 
                    Contact us anytime to book your preferred time slot or discuss your cleaning needs.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Same-day booking available for urgent cleaning requests.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose Bokkie Cleaning Services?
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>Professional, vetted cleaners with verified credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>Fully insured and bonded for your peace of mind</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>100% satisfaction guarantee on all services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>Same-day booking available throughout Cape Town</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>Eco-friendly cleaning products and methods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0C53ED] mt-0.5 flex-shrink-0" />
                    <span>Rated 4.8/5 stars with 150+ customer reviews</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Service Areas
                </h2>
                <p className="text-gray-700 mb-4">
                  We proudly serve Cape Town and surrounding areas including:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Sea Point</li>
                  <li>• Camps Bay</li>
                  <li>• Claremont</li>
                  <li>• Green Point</li>
                  <li>• V&A Waterfront</li>
                  <li>• Constantia</li>
                  <li>• Newlands</li>
                  <li>• Century City</li>
                  <li>• And 30+ more areas</li>
                </ul>
                <p className="text-gray-600 text-sm mt-4">
                  Don't see your area? Contact us - we may still be able to help!
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-900 text-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-300 mb-6">
                Book your cleaning service today or get a free quote. Our team is standing by to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/booking/quote"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0C53ED] hover:bg-[#0A3FC7] text-white font-semibold rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Get Free Quote
                </Link>
                <a
                  href="tel:+27724162547"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    How can I contact Bokkie Cleaning Services?
                  </h3>
                  <p className="text-gray-700">
                    You can contact us by phone at <a href="tel:+27724162547" className="text-[#0C53ED] hover:underline">+27 72 416 2547</a>, 
                    by email at <a href="mailto:info@bokkiecleaning.co.za" className="text-[#0C53ED] hover:underline">info@bokkiecleaning.co.za</a>, 
                    or visit our office at 348 Imam Haron Road Lansdowne, Cape Town 7780. We're available 24/7.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    What are your operating hours?
                  </h3>
                  <p className="text-gray-700">
                    We operate 24/7, every day of the week, including holidays. You can contact us anytime to book your preferred time slot or discuss your cleaning needs.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    How quickly can I get a response?
                  </h3>
                  <p className="text-gray-700">
                    We aim to respond to all inquiries within 24 hours. For urgent requests, please contact us directly. Same-day booking is available for cleaning services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Do you serve my area in Cape Town?
                  </h3>
                  <p className="text-gray-700">
                    We serve Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, Green Point, Constantia, V&A Waterfront, and 30+ more areas. If you don't see your area listed, please contact us as we may still be able to help!
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Can I book a cleaning service over the phone?
                  </h3>
                  <p className="text-gray-700">
                    Yes! You can book a cleaning service by contacting us. Our team will help you choose the right service, select a cleaner, and schedule your preferred date and time. You can also book online through our website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

