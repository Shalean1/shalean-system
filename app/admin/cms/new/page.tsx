"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCMSContent, type CMSContentInput } from "@/app/actions/cms";
import CMSContentForm from "@/components/admin/cms/CMSContentForm";

export default function NewCMSPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CMSContentInput) => {
    setIsSubmitting(true);
    try {
      const result = await createCMSContent(data);
      if (result.success && result.id) {
        router.push(`/admin/cms/${result.id}`);
      }
      return result;
    } catch (error) {
      console.error("Error creating CMS content:", error);
      return { success: false, error: "Failed to create content" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          New CMS Content
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Create new content for guides, FAQs, or pages
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CMSContentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
