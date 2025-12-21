"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track pageview
    const trackPageview = async () => {
      try {
        const response = await fetch("/api/track-pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagePath: pathname,
            pageTitle: document.title,
            referrer: document.referrer || undefined,
          }),
        });

        if (!response.ok) {
          console.error("Failed to track pageview");
        }
      } catch (error) {
        // Silently fail - pageview tracking shouldn't break the app
        console.error("Error tracking pageview:", error);
      }
    };

    trackPageview();
  }, [pathname]);

  return null; // This component doesn't render anything
}












