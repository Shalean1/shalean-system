"use client";

import { useEffect, useRef } from "react";

interface BlogPostContentProps {
  content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple HTML rendering - in production, use a proper markdown/HTML renderer
    if (contentRef.current) {
      contentRef.current.innerHTML = content;
      
      // Add IDs to headings for table of contents
      const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        if (!heading.id) {
          const text = heading.textContent?.trim() || "";
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          heading.id = id;
        }
      });
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      data-blog-content
      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-img:rounded-lg prose-img:shadow-lg"
    />
  );
}
