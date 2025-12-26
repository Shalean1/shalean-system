import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug, getRelatedPosts, incrementBlogViews } from "@/app/actions/blog";
import BlogPostContent from "@/components/blog/BlogPostContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import SocialShare from "@/components/blog/SocialShare";
import TableOfContents from "@/components/blog/TableOfContents";
import Footer from "@/components/Footer";
import { generateBlogSEOMetadata } from "@/lib/seo/blog-seo";
import { generateBlogPostSchema, generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import { formatReadingTime } from "@/lib/utils/reading-time";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return generateBlogSEOMetadata(
    post.title,
    post.excerpt || post.seo_description || "",
    post.slug,
    post.seo_title ?? undefined,
    post.seo_description ?? undefined,
    post.seo_keywords || [],
    (post.og_image_url || post.featured_image_url) ?? undefined,
    post.published_at ?? undefined,
    post.updated_at,
    post.author_name,
    post.category ?? undefined,
    post.tags || []
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment views (fire and forget)
  incrementBlogViews(slug).catch(() => {});

  // Get related posts
  const relatedPosts = await getRelatedPosts(
    post.id,
    post.category || undefined,
    post.tags || [],
    3
  );

  // Generate structured data
  const blogSchema = generateBlogPostSchema(
    post.title,
    post.excerpt || post.seo_description || "",
    `https://bokkie.co.za/blog/${post.slug}`,
    post.featured_image_url || undefined,
    post.author_name,
    post.published_at || post.created_at,
    post.updated_at,
    post.seo_keywords || [],
    post.category || undefined,
    post.content,
    post.reading_time
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bokkie.co.za" },
    { name: "Blog", url: "https://bokkie.co.za/blog" },
    { name: post.title, url: `https://bokkie.co.za/blog/${post.slug}` },
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            {post.category && (
              <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-blue-600 bg-white rounded-full">
                {post.category.toLowerCase().replace(/\s+/g, "-")}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            {post.excerpt && (
              <p className="text-xl text-blue-100 mb-6">{post.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatReadingTime(post.reading_time)}
              </div>
              {post.author_name && (
                <div>By {post.author_name}</div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Table of Contents Sidebar - Left on desktop */}
              <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
                <TableOfContents content={post.content} />
              </aside>

              {/* Main Content */}
              <div className="flex-1 max-w-4xl order-1 lg:order-2">
                {/* Social Share */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <SocialShare
                    url={`/blog/${post.slug}`}
                    title={post.title}
                    description={post.excerpt || undefined}
                  />
                </div>

                {/* Blog Content */}
                <BlogPostContent content={post.content} />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <RelatedPosts posts={relatedPosts} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
