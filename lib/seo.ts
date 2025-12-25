/**
 * SEO utility functions for Bokkie Cleaning Services
 */

export const siteConfig = {
  name: "Bokkie Cleaning Services",
  url: "https://www.bokkiecleaning.co.za",
  description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://x.com/shaloclean",
    facebook: "https://facebook.com/shaleancleaning",
    instagram: "https://www.instagram.com/shalean_cleaning_services",
  },
};

/**
 * Generate meta title with proper length
 */
export function generateMetaTitle(title: string): string {
  const maxLength = 60;
  const suffix = " | Bokkie Cleaning Services";
  const availableLength = maxLength - suffix.length;
  
  if (title.length <= availableLength) {
    return `${title}${suffix}`;
  }
  
  return `${title.substring(0, availableLength - 3)}...${suffix}`;
}

/**
 * Generate meta description with proper length
 */
export function generateMetaDescription(description: string): string {
  const maxLength = 155;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  return `${description.substring(0, maxLength - 3)}...`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string = ""): string {
  const baseUrl = siteConfig.url;
  if (!path || path === "/") {
    return baseUrl;
  }
  
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Generate image alt text with keywords
 */
export function generateImageAlt(imageType: string, location?: string): string {
  const base = `Bokkie Cleaning Services - ${imageType}`;
  if (location) {
    return `${base} in ${location}, Cape Town`;
  }
  return `${base} in Cape Town`;
}

/**
 * Primary keywords for SEO
 */
export const primaryKeywords = [
  "cleaning services Cape Town",
  "professional cleaners Cape Town",
  "house cleaning Cape Town",
  "office cleaning Cape Town",
  "deep cleaning Cape Town",
];

/**
 * Secondary keywords for SEO
 */
export const secondaryKeywords = [
  "move in cleaning Cape Town",
  "Airbnb cleaning Cape Town",
  "residential cleaning Cape Town",
  "commercial cleaning Cape Town",
  "window cleaning Cape Town",
];

/**
 * Long-tail keywords for SEO
 */
export const longTailKeywords = [
  "best cleaning service in Cape Town",
  "affordable cleaners Cape Town",
  "move-in cleaning Claremont",
  "cleaning services Sea Point",
  "cleaning services Camps Bay",
  "professional cleaners South Africa",
];
