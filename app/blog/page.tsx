import { Metadata } from "next";
import { getBlogPosts, getBlogCategories } from "@/app/actions/blog";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Footer from "@/components/Footer";
import { generateBlogListingSEOMetadata } from "@/lib/seo/blog-seo";
import { Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generateBlogListingSEOMetadata();

export const dynamic = 'force-dynamic';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;

  const filters: any = {
    status: "published",
    sortBy: "published_at",
    sortOrder: "desc",
    limit: 20,
  };

  if (category) {
    filters.category = category;
  }

  if (search) {
    filters.search = search;
  }

  const { posts } = await getBlogPosts(filters);
  const categories = await getBlogCategories();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-blue-100">
            Tips, guides, and insights from Shalean Cleaning Services
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Posts
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts found.</p>
            {search && (
              <p className="text-gray-500 mt-2">Try a different search term.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                featuredImageUrl={post.featured_image_url}
                publishedAt={post.published_at}
                readingTime={post.reading_time}
                category={post.category}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
