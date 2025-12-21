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
      ratingValue: "5",
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
    ratingValue: "5",
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
          text: "Yes, our professional cleaners arrive with all necessary eco-friendly supplies to ensure a safe and clean environment.",
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





