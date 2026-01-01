import { MetadataRoute } from "next";
import { getBlogPosts } from "@/app/actions/blog";
import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bokkiecleaning.co.za";

  // Helper function to safely construct URLs
  const makeUrl = (path: string): string => {
    try {
      const url = new URL(path, baseUrl);
      return url.toString();
    } catch {
      // Fallback to string concatenation if URL constructor fails
      return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    }
  };

  // Static routes
  const routes = [
    {
      url: makeUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: makeUrl("/services"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: makeUrl("/service-areas"),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: makeUrl("/guides"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: makeUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: makeUrl("/privacy"),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: makeUrl("/booking/quote"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: makeUrl("/how-it-works"),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: makeUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Service pages - only valid services that exist
  const services = [
    "residential-cleaning",
    "commercial-cleaning",
    "specialized-cleaning",
  ];

  const serviceRoutes = services.map((service) => ({
    url: makeUrl(`/services/${service}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Location pages - use shared constants for consistency
  const locationRoutes = capeTownAreas.map((area) => ({
    url: makeUrl(`/areas/${getLocationSlug(area)}`),
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
    url: makeUrl(`/guides/${guide}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog posts - fetch from database
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getBlogPosts({
      status: "published",
      limit: 1000, // Get all published posts
    });

    blogRoutes = posts
      .filter((post) => post.slug && post.slug.trim().length > 0) // Ensure slug exists and is valid
      .map((post) => {
        // Calculate priority based on views and recency
        let priority = 0.7;
        if (post.views > 100) priority = 0.8;
        if (post.views > 500) priority = 0.9;

        // Recent posts get higher priority
        if (post.published_at) {
          const daysSincePublished = Math.floor(
            (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSincePublished < 30) priority = Math.min(priority + 0.1, 1.0);
        }

        // Ensure valid date for lastModified
        let lastModified = new Date();
        if (post.updated_at) {
          const date = new Date(post.updated_at);
          if (!isNaN(date.getTime())) {
            lastModified = date;
          }
        }

        return {
          url: makeUrl(`/blog/${post.slug}`),
          lastModified,
          changeFrequency: "weekly" as const,
          priority,
        };
      });
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  return [...routes, ...serviceRoutes, ...locationRoutes, ...guideRoutes, ...blogRoutes];
}
