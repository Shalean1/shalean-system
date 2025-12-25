"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout;
    let innerTimeoutId: NodeJS.Timeout;

    // Wait for content to be rendered
    timeoutId = setTimeout(() => {
      // Parse HTML content to extract headings
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
      
      const extractedHeadings: Heading[] = [];
      headingElements.forEach((heading) => {
        const text = heading.textContent?.trim() || "";
        if (!text) return; // Skip empty headings
        
        const level = parseInt(heading.tagName.charAt(1));
        const id = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        
        extractedHeadings.push({ id, text, level });
      });

      setHeadings(extractedHeadings);

      // Add IDs to headings in the actual content
      const contentElement = document.querySelector('[data-blog-content]');
      if (contentElement) {
        const contentHeadings = contentElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
        contentHeadings.forEach((heading, index) => {
          if (extractedHeadings[index] && !heading.id) {
            heading.id = extractedHeadings[index].id;
          }
        });
      }

      // Set up intersection observer for active heading
      const observerOptions = {
        rootMargin: "-20% 0px -80% 0px",
        threshold: 0,
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, observerOptions);

      // Observe all headings after a short delay to ensure they're rendered
      innerTimeoutId = setTimeout(() => {
        const allHeadings = document.querySelectorAll('[data-blog-content] h1, [data-blog-content] h2, [data-blog-content] h3, [data-blog-content] h4, [data-blog-content] h5, [data-blog-content] h6');
        allHeadings.forEach((heading) => {
          if (observer) {
            observer.observe(heading);
          }
        });
      }, 100);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(innerTimeoutId);
      if (observer) {
        const allHeadings = document.querySelectorAll('[data-blog-content] h1, [data-blog-content] h2, [data-blog-content] h3, [data-blog-content] h4, [data-blog-content] h5, [data-blog-content] h6');
        allHeadings.forEach((heading) => {
          observer.unobserve(heading);
        });
        observer.disconnect();
      }
    };
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sticky top-24 self-start">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">On this page</h3>
        <nav className="space-y-2">
          {headings.map((heading) => {
            const paddingLeft = `${(heading.level - 1) * 12}px`;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
                className={`block text-sm transition-colors ${
                  activeId === heading.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ paddingLeft }}
              >
                {heading.text}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

