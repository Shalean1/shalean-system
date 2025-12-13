module.exports = [
"[next]/internal/font/google/inter_5901b7c6.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "inter_5901b7c6-module__ec5Qua__className",
  "variable": "inter_5901b7c6-module__ec5Qua__variable",
});
}),
"[next]/internal/font/google/inter_5901b7c6.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5901b7c6.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Inter', 'Inter Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/lib/structured-data.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateStructuredData",
    ()=>generateStructuredData
]);
function generateStructuredData() {
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
            addressCountry: "ZA"
        },
        sameAs: [],
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+27871535250",
            contactType: "Customer Service",
            areaServed: "ZA",
            availableLanguage: [
                "en",
                "af"
            ]
        }
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
            addressCountry: "ZA"
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: -33.9806,
            longitude: 18.4653
        },
        priceRange: "$$",
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                opens: "00:00",
                closes: "23:59"
            }
        ],
        areaServed: [
            {
                "@type": "City",
                name: "Cape Town"
            },
            {
                "@type": "City",
                name: "Sea Point"
            },
            {
                "@type": "City",
                name: "Camps Bay"
            },
            {
                "@type": "City",
                name: "Claremont"
            },
            {
                "@type": "City",
                name: "Green Point"
            },
            {
                "@type": "City",
                name: "V&A Waterfront"
            },
            {
                "@type": "City",
                name: "Constantia"
            }
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: "150",
            bestRating: "5",
            worstRating: "1"
        }
    };
    const services = [
        {
            "@type": "Service",
            serviceType: "Regular Cleaning",
            description: "Ongoing maintenance cleaning to keep your home fresh and organized",
            provider: {
                "@id": `${baseUrl}#organization`
            },
            areaServed: {
                "@type": "City",
                name: "Cape Town"
            }
        },
        {
            "@type": "Service",
            serviceType: "Deep Cleaning",
            description: "Thorough cleaning that addresses every corner and surface",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Move In/Out Cleaning",
            description: "Comprehensive cleaning for property transitions",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Airbnb Cleaning",
            description: "Professional turnover cleaning for short-term rentals",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Office Cleaning",
            description: "Commercial cleaning services to maintain a clean workspace",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Apartment Cleaning",
            description: "Specialized services tailored for apartments and condos",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Window Cleaning",
            description: "Professional window cleaning for streak-free results",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        },
        {
            "@type": "Service",
            serviceType: "Home Maintenance",
            description: "Comprehensive services to keep your home in perfect condition",
            provider: {
                "@id": `${baseUrl}#organization`
            }
        }
    ];
    const reviews = [
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Sumaya"
            },
            reviewBody: "The professionalism of the Company is exceptional, and they ensure a suitable lady is available for your clean day/s. The ladies allocated to me thus far have good cleaning skills... I highly recommend Shalean Cleaning Services.",
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
                bestRating: "5"
            },
            datePublished: "2024-01-15"
        },
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Sarah M."
            },
            reviewBody: "Outstanding service! The team was punctual, thorough, and left my home spotless. Highly professional and reliable cleaning service.",
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
                bestRating: "5"
            },
            datePublished: "2024-02-20"
        },
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "John D."
            },
            reviewBody: "Best cleaning service in Cape Town. They pay attention to every detail and use eco-friendly products. My apartment has never looked better!",
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
                bestRating: "5"
            },
            datePublished: "2024-03-10"
        }
    ];
    const aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1"
    };
    const breadcrumbList = {
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: baseUrl
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Services",
                item: `${baseUrl}#services`
            },
            {
                "@type": "ListItem",
                position: 3,
                name: "Cape Town Cleaning Services",
                item: baseUrl
            }
        ]
    };
    const website = {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        url: baseUrl,
        name: "Shalean Cleaning Services",
        description: "Professional cleaning services in Cape Town",
        publisher: {
            "@id": `${baseUrl}#organization`
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
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
                    text: "Shalean Cleaning Services covers Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, and more."
                }
            },
            {
                "@type": "Question",
                name: "What cleaning services do you offer?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "We offer a comprehensive range of cleaning services including regular cleaning, deep cleaning, move in/out cleaning, Airbnb cleaning, office cleaning, apartment cleaning, window cleaning, and home maintenance services."
                }
            },
            {
                "@type": "Question",
                name: "What are your operating hours?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "We operate 24/7, every day of the week, including holidays. Contact us anytime to book your preferred time slot."
                }
            },
            {
                "@type": "Question",
                name: "Do you provide eco-friendly cleaning supplies?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, our professional cleaners arrive with all necessary eco-friendly supplies to ensure a safe and clean environment."
                }
            },
            {
                "@type": "Question",
                name: "Do you offer a satisfaction guarantee?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, we offer a 100% satisfaction guarantee on all our cleaning services."
                }
            }
        ]
    };
    return {
        "@context": "https://schema.org",
        "@graph": [
            organization,
            localBusiness,
            website,
            ...services,
            ...reviews,
            aggregateRating,
            faqPage,
            breadcrumbList
        ]
    };
}
}),
"[project]/components/Header.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/Header.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/Header.tsx <module evaluation>", "default");
}),
"[project]/components/Header.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/Header.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/Header.tsx", "default");
}),
"[project]/components/Header.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/Header.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/Header.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5901b7c6.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$structured$2d$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/structured-data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Header.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
const metadata = {
    metadataBase: new URL("https://shalean.co.za"),
    title: {
        default: "Shalean Cleaning Services | Professional Cleaning Services Cape Town",
        template: "%s | Shalean Cleaning Services"
    },
    description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services. Book your clean today with Shalean Cleaning Services.",
    keywords: [
        "cleaning services Cape Town",
        "professional cleaners Cape Town",
        "professional cleaners South Africa",
        "house cleaning Cape Town",
        "office cleaning Cape Town",
        "deep cleaning Cape Town",
        "move in cleaning Cape Town",
        "professional cleaning services Cape Town",
        "reliable cleaners Cape Town",
        "residential cleaning Cape Town",
        "commercial cleaning Cape Town",
        "Airbnb cleaning Cape Town",
        "window cleaning Cape Town",
        "best cleaning service in Cape Town",
        "affordable cleaners Cape Town",
        "move-in cleaning Claremont",
        "cleaning services Sea Point",
        "cleaning services Camps Bay"
    ],
    authors: [
        {
            name: "Shalean Cleaning Services"
        }
    ],
    creator: "Shalean Cleaning Services",
    publisher: "Shalean Cleaning Services",
    category: "Cleaning Services",
    classification: "Home Services",
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    openGraph: {
        type: "website",
        locale: "en_ZA",
        url: "https://shalean.co.za",
        siteName: "Shalean Cleaning Services",
        title: "Shalean Cleaning Services | Professional Cleaning Services Cape Town",
        description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services. Book your clean today!",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Shalean Cleaning Services - Professional Cleaning Services in Cape Town",
                type: "image/jpeg"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Shalean Cleaning Services | Professional Cleaning Services Cape Town",
        description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
        images: [
            "/og-image.jpg"
        ],
        creator: "@shaleancleaning",
        site: "@shaleancleaning"
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    alternates: {
        canonical: "https://shalean.co.za",
        languages: {
            "en-ZA": "https://shalean.co.za"
        }
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ""
    },
    other: {
        "geo.region": "ZA-WC",
        "geo.placename": "Cape Town",
        "geo.position": "-33.9806;18.4653",
        "ICBM": "-33.9806, 18.4653"
    }
};
function RootLayout({ children }) {
    const structuredData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$structured$2d$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateStructuredData"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en-ZA",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                        id: "structured-data",
                        type: "application/ld+json",
                        dangerouslySetInnerHTML: {
                            __html: JSON.stringify(structuredData)
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "manifest",
                        href: "/manifest.json"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "theme-color",
                        content: "#10b981"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1, maximum-scale=5"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                className: `${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} antialiased`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    children
                ]
            }, void 0, true, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__69b04a86._.js.map