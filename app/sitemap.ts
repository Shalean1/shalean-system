import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shalean.co.za";

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/booking/quote`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // Service pages - only valid services that exist
  const services = [
    "residential-cleaning",
    "commercial-cleaning",
    "specialized-cleaning",
  ];

  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Location pages
  const locations = [
    "sea-point",
    "camps-bay",
    "claremont",
    "green-point",
    "va-waterfront",
    "constantia",
    "newlands",
    "rondebosch",
    "observatory",
    "woodstock",
    "city-bowl",
    "gardens",
    "tamboerskloof",
    "oranjezicht",
    "vredehoek",
    "devils-peak",
    "mouille-point",
    "three-anchor-bay",
    "bantry-bay",
    "fresnaye",
    "bakoven",
    "llandudno",
    "hout-bay",
    "wynberg",
    "kenilworth",
    "plumstead",
    "diep-river",
    "bergvliet",
    "tokai",
    "steenberg",
    "muizenberg",
    "kalk-bay",
    "fish-hoek",
    "simons-town",
  ];

  const locationRoutes = locations.map((location) => ({
    url: `${baseUrl}/areas/${location}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Guide pages
  const guides = [
    "maintain-spotless-home",
    "eco-friendly-cleaning",
    "move-in-cleaning",
    "office-cleaning-best-practices",
  ];

  const guideRoutes = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...serviceRoutes, ...locationRoutes, ...guideRoutes];
}
