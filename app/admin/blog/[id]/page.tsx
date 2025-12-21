"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getBlogPostById, updateBlogPost, type BlogPostInput } from "@/app/actions/blog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import type { BlogPost } from "@/app/actions/blog";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await getBlogPostById(id);
      if (data) {
        setPost(data);
      } else {
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error loading post:", error);
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: BlogPostInput) => {
    setIsSubmitting(true);
    try {
      const result = await updateBlogPost(id, data);
      if (result.success) {
        // Reload post to get updated data
        await loadPost();
      }
      return result;
    } catch (error) {
      console.error("Error updating blog post:", error);
      return { success: false, error: "Failed to update blog post" };
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Post not found</h2>
          <button
            onClick={() => router.push("/admin/blog")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Blog Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Edit Blog Post
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {post.title}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <BlogPostForm
          initialData={{
            title: post.title,
            excerpt: post.excerpt ?? undefined,
            content: post.content,
            featured_image_url: post.featured_image_url ?? undefined,
            status: post.status,
            seo_title: post.seo_title ?? undefined,
            seo_description: post.seo_description ?? undefined,
            seo_keywords: post.seo_keywords ?? undefined,
            focus_keyword: post.focus_keyword ?? undefined,
            category: post.category ?? undefined,
            tags: post.tags ?? undefined,
            canonical_url: post.canonical_url ?? undefined,
            og_image_url: post.og_image_url ?? undefined,
            internal_links: post.internal_links ?? undefined,
            related_post_ids: post.related_post_ids ?? undefined,
            id: post.id,
            slug: post.slug,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
