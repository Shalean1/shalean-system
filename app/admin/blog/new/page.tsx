"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBlogPost, type BlogPostInput } from "@/app/actions/blog";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BlogPostInput) => {
    setIsSubmitting(true);
    try {
      const result = await createBlogPost(data);
      if (result.success && result.id) {
        router.push(`/admin/blog/${result.id}`);
      }
      return result;
    } catch (error) {
      console.error("Error creating blog post:", error);
      return { success: false, error: "Failed to create blog post" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          New Blog Post
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Create a new SEO-optimized blog post
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <BlogPostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
