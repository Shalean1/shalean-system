"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getCMSContentById, updateCMSContent, type CMSContentInput } from "@/app/actions/cms";
import CMSContentForm from "@/components/admin/cms/CMSContentForm";
import type { CMSContent } from "@/app/actions/cms";

export default function EditCMSPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getCMSContentById(id);
      if (data) {
        setContent(data);
      } else {
        router.push("/admin/cms");
      }
    } catch (error) {
      console.error("Error loading content:", error);
      router.push("/admin/cms");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CMSContentInput) => {
    setIsSubmitting(true);
    try {
      const result = await updateCMSContent(id, data);
      if (result.success) {
        await loadContent();
      }
      return result;
    } catch (error) {
      console.error("Error updating content:", error);
      return { success: false, error: "Failed to update content" };
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Content not found</h2>
          <button
            onClick={() => router.push("/admin/cms")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to CMS Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Edit CMS Content
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {content.title}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CMSContentForm
          initialData={{
            title: content.title,
            content: content.content ?? undefined,
            content_type: content.content_type,
            status: content.status,
            seo_title: content.seo_title ?? undefined,
            seo_description: content.seo_description ?? undefined,
            seo_keywords: content.seo_keywords ?? undefined,
            id: content.id,
            slug: content.slug,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
