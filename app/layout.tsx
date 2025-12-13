import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateStructuredData } from "@/lib/structured-data";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shalean.co.za"),
  title: {
    default: "Shalean Cleaning Services | Professional Cleaning Services Cape Town",
    template: "%s | Shalean Cleaning Services",
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
    "cleaning services Camps Bay",
  ],
  authors: [{ name: "Shalean Cleaning Services" }],
  creator: "Shalean Cleaning Services",
  publisher: "Shalean Cleaning Services",
  category: "Cleaning Services",
  classification: "Home Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shalean Cleaning Services | Professional Cleaning Services Cape Town",
    description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
    images: ["/og-image.jpg"],
    creator: "@shaleancleaning",
    site: "@shaleancleaning",
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
  alternates: {
    canonical: "https://shalean.co.za",
    languages: {
      "en-ZA": "https://shalean.co.za",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
    // Add other verification codes when available
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "geo.region": "ZA-WC",
    "geo.placename": "Cape Town",
    "geo.position": "-33.9806;18.4653",
    "ICBM": "-33.9806, 18.4653",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateStructuredData();

  return (
    <html lang="en-ZA">
      <head>
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
