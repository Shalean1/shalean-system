import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";

export function generateStructuredData() {
  const baseUrl = "https://shalean.co.za";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    name: "Shalean Cleaning Services",
    legalName: "Shalean Cleaning Services",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    telephone: "+27871535250",
    email: "support@shalean.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "39 Harvey Road",
      addressLocality: "Claremont",
      addressRegion: "Western Cape",
      postalCode: "7708",
      addressCountry: "ZA",
    },
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+27871535250",
      contactType: "Customer Service",
      areaServed: "ZA",
      availableLanguage: ["en", "af"],
    },
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}#localBusiness`,
    name: "Shalean Cleaning Services",
    image: `${baseUrl}/logo.png`,
    url: baseUrl,
    telephone: "+27871535250",
    email: "support@shalean.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "39 Harvey Road",
      addressLocality: "Claremont",
      addressRegion: "Western Cape",
      postalCode: "7708",
      addressCountry: "ZA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.9806,
      longitude: 18.4653,
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Cape Town",
      },
      {
        "@type": "City",
        name: "Sea Point",
      },
      {
        "@type": "City",
        name: "Camps Bay",
      },
      {
        "@type": "City",
        name: "Claremont",
      },
      {
        "@type": "City",
        name: "Green Point",
      },
      {
        "@type": "City",
        name: "V&A Waterfront",
      },
      {
        "@type": "City",
        name: "Constantia",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const services = [
    {
      "@type": "Service",
      serviceType: "Regular Cleaning",
      description: "Ongoing maintenance cleaning to keep your home fresh and organized",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
      areaServed: {
        "@type": "City",
        name: "Cape Town",
      },
    },
    {
      "@type": "Service",
      serviceType: "Deep Cleaning",
      description: "Thorough cleaning that addresses every corner and surface",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Move In/Out Cleaning",
      description: "Comprehensive cleaning for property transitions",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Airbnb Cleaning",
      description: "Professional turnover cleaning for short-term rentals",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Office Cleaning",
      description: "Commercial cleaning services to maintain a clean workspace",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Apartment Cleaning",
      description: "Specialized services tailored for apartments and condos",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Window Cleaning",
      description: "Professional window cleaning for streak-free results",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
    {
      "@type": "Service",
      serviceType: "Home Maintenance",
      description: "Comprehensive services to keep your home in perfect condition",
      provider: {
        "@id": `${baseUrl}#organization`,
      },
    },
  ];

  const reviews = [
    {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "Sumaya",
      },
      reviewBody: "The professionalism of the Company is exceptional, and they ensure a suitable lady is available for your clean day/s. The ladies allocated to me thus far have good cleaning skills... I highly recommend Shalean Cleaning Services.",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      datePublished: "2024-01-15",
    },
    {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "Sarah M.",
      },
      reviewBody: "Outstanding service! The team was punctual, thorough, and left my home spotless. Highly professional and reliable cleaning service.",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      datePublished: "2024-02-20",
    },
    {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "John D.",
      },
      reviewBody: "Best cleaning service in Cape Town. They pay attention to every detail and use eco-friendly products. My apartment has never looked better!",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      datePublished: "2024-03-10",
    },
  ];

  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "150",
    bestRating: "5",
    worstRating: "1",
  };

  const breadcrumbList = {
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
        item: `${baseUrl}#services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Cape Town Cleaning Services",
        item: baseUrl,
      },
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    url: baseUrl,
    name: "Shalean Cleaning Services",
    description: "Professional cleaning services in Cape Town",
    publisher: {
      "@id": `${baseUrl}#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const blog = {
    "@type": "Blog",
    "@id": `${baseUrl}#blog`,
    url: `${baseUrl}/blog`,
    name: "Shalean Cleaning Services Blog",
    description: "Tips, guides, and insights about cleaning services in Cape Town",
    publisher: {
      "@id": `${baseUrl}#organization`,
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What areas does Shalean Cleaning Services cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Shalean Cleaning Services covers Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, and more.",
        },
      },
      {
        "@type": "Question",
        name: "What cleaning services do you offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer a comprehensive range of cleaning services including regular cleaning, deep cleaning, move in/out cleaning, Airbnb cleaning, office cleaning, apartment cleaning, window cleaning, and home maintenance services.",
        },
      },
      {
        "@type": "Question",
        name: "What are your operating hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We operate 24/7, every day of the week, including holidays. Contact us anytime to book your preferred time slot.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide eco-friendly cleaning supplies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our professional cleaners use eco-friendly cleaning supplies. For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. For standard cleaning, Airbnb, office, and holiday cleaning services, supplies and equipment are available at an additional cost that you can request during booking.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer a satisfaction guarantee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer a 100% satisfaction guarantee on all our cleaning services.",
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      localBusiness,
      website,
      blog,
      ...services,
      ...reviews,
      aggregateRating,
      faqPage,
      breadcrumbList,
    ],
  };
}

/**
 * Generate structured data for the How It Works page
 */
export function generateHowItWorksStructuredData() {
  const baseUrl = "https://shalean.co.za";

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${baseUrl}/how-it-works#howto`,
    name: "How to Book Professional Cleaning Services in Cape Town",
    description: "Step-by-step guide on how to book professional cleaning services with Shalean Cleaning Services in Cape Town",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose Your Service",
        text: "Select from our range of professional cleaning services including residential cleaning, commercial cleaning, deep cleaning, move-in/out cleaning, and specialized services.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Select Your Cleaner",
        text: "Browse our network of vetted, professional cleaners. View their profiles, read customer reviews, check their skills and specialties, and compare prices.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Schedule Your Clean",
        text: "Pick a date and time that works for you. We offer flexible scheduling with same-day booking available.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Payment & Confirmation",
        text: "Securely pay online through our encrypted payment system. You'll receive instant confirmation via email and SMS.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Enjoy Your Clean Space",
        text: "Your professional cleaner arrives on time, ready to complete the cleaning according to your specifications. After completion, you can review and rate your experience.",
      },
    ],
  };

  const howItWorksFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/how-it-works#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I book a cleaning service in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Booking a cleaning service with Shalean is simple. Visit our booking page, choose your service type, select a cleaner based on reviews and availability, pick your preferred date and time, and complete secure payment. You'll receive instant confirmation. Same-day booking is available for urgent cleaning needs.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book same-day cleaning?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Shalean Cleaning Services offers same-day booking for cleaning services in Cape Town. Simply select your service, choose an available cleaner, and schedule your clean for today. Availability depends on cleaner schedules, but we work hard to accommodate urgent requests.",
        },
      },
      {
        "@type": "Question",
        name: "How do I choose a cleaner?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can browse our network of professional cleaners, read verified customer reviews and ratings, view their skills and specialties, and compare prices. Each cleaner profile shows their experience, areas of expertise, and customer feedback.",
        },
      },
      {
        "@type": "Question",
        name: "What if I'm not satisfied with the cleaning?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer a 100% satisfaction guarantee on all our cleaning services. If you're not completely satisfied, contact us within 24 hours and we'll send a cleaner back to address any issues at no additional cost.",
        },
      },
      {
        "@type": "Question",
        name: "Do cleaners bring their own supplies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. For standard cleaning, Airbnb, office, and holiday cleaning services, supplies and equipment are available at an additional cost that you can request during booking. All our cleaners use high-quality, eco-friendly cleaning products that are effective yet gentle on your home and the environment.",
        },
      },
    ],
  };

  const howItWorksBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/how-it-works#breadcrumb`,
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
        name: "How It Works",
        item: `${baseUrl}/how-it-works`,
      },
    ],
  };

  const howItWorksWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${baseUrl}/how-it-works#webpage`,
    url: `${baseUrl}/how-it-works`,
    name: "How It Works: Book Professional Cleaning Services in Cape Town",
    description: "Learn how to book professional cleaning services in Cape Town with Shalean. Simple 5-step process with same-day booking available.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    breadcrumb: {
      "@id": `${baseUrl}/how-it-works#breadcrumb`,
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      howTo,
      howItWorksFAQ,
      howItWorksBreadcrumb,
      howItWorksWebPage,
    ],
  };
}

/**
 * Generate structured data for the Service Areas page
 */
export function generateServiceAreasStructuredData() {
  const baseUrl = "https://shalean.co.za";

  const serviceAreasBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/service-areas#breadcrumb`,
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
        name: "Service Areas",
        item: `${baseUrl}/service-areas`,
      },
    ],
  };

  const serviceAreasWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${baseUrl}/service-areas#webpage`,
    url: `${baseUrl}/service-areas`,
    name: "Professional Cleaning Services Cape Town - All Service Areas",
    description: "Professional cleaning services throughout Cape Town. We serve Sea Point, Camps Bay, Claremont, Green Point, Constantia, and 30+ more areas.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    breadcrumb: {
      "@id": `${baseUrl}/service-areas#breadcrumb`,
    },
  };

  const serviceAreasItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${baseUrl}/service-areas#itemlist`,
    name: "Cape Town Service Areas",
    description: "List of all areas where Shalean Cleaning Services provides professional cleaning services",
    numberOfItems: capeTownAreas.length,
    itemListElement: capeTownAreas.map((area, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: area,
      item: `${baseUrl}/areas/${getLocationSlug(area)}`,
    })),
  };

  const serviceAreasFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/service-areas#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What areas do you serve in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `We serve over 35 areas throughout Cape Town including Sea Point, Camps Bay, Claremont, Green Point, Constantia, Newlands, and many more. If you don't see your area listed, please contact us as we may still be able to help!`,
        },
      },
      {
        "@type": "Question",
        name: "Can I book same-day cleaning in my area?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We offer same-day booking for cleaning services throughout Cape Town. Availability depends on cleaner schedules, but we work hard to accommodate urgent requests.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide cleaning supplies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For deep cleaning, move-in/out, and carpet cleaning services, all supplies and equipment are included at no extra charge. For standard cleaning services, supplies are available at an additional cost that you can request during booking.",
        },
      },
      {
        "@type": "Question",
        name: "Are your cleaners insured and bonded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all our professional cleaners are fully insured and bonded. We also offer a 100% satisfaction guarantee on all our cleaning services.",
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      serviceAreasBreadcrumb,
      serviceAreasWebPage,
      serviceAreasItemList,
      serviceAreasFAQ,
    ],
  };
}

/**
 * Generate structured data for individual location pages
 */
export function generateLocationStructuredData(locationName: string, slug: string) {
  const baseUrl = "https://shalean.co.za";
  const locationUrl = `${baseUrl}/areas/${slug}`;

  const locationBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${locationUrl}#breadcrumb`,
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
        name: "Service Areas",
        item: `${baseUrl}/service-areas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Cleaning Services in ${locationName}`,
        item: locationUrl,
      },
    ],
  };

  const locationWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${locationUrl}#webpage`,
    url: locationUrl,
    name: `Cleaning Services in ${locationName}, Cape Town`,
    description: `Professional cleaning services available in ${locationName}, Cape Town. Residential, commercial, and specialized cleaning services.`,
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#organization`,
    },
    breadcrumb: {
      "@id": `${locationUrl}#breadcrumb`,
    },
  };

  const locationService = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Professional Cleaning Services",
    name: `Cleaning Services in ${locationName}`,
    description: `Professional cleaning services in ${locationName}, Cape Town including residential cleaning, commercial cleaning, and specialized cleaning services.`,
    provider: {
      "@id": `${baseUrl}#organization`,
    },
    areaServed: {
      "@type": "City",
      name: locationName,
      containedIn: {
        "@type": "City",
        name: "Cape Town",
      },
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: locationUrl,
      servicePhone: "+27871535250",
    },
  };

  const locationLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${locationUrl}#localBusiness`,
    name: `Shalean Cleaning Services - ${locationName}`,
    image: `${baseUrl}/logo.png`,
    url: locationUrl,
    telephone: "+27871535250",
    email: "support@shalean.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: locationName,
      addressRegion: "Western Cape",
      addressCountry: "ZA",
    },
    areaServed: {
      "@type": "City",
      name: locationName,
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      locationBreadcrumb,
      locationWebPage,
      locationService,
      locationLocalBusiness,
    ],
  };
}

