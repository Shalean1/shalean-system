import Link from "next/link";
import type { BlogPost } from "@/app/actions/blog";
import BlogPostCard from "./BlogPostCard";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
