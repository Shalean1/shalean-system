import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bokkie Cleaning Services",
    short_name: "Bokkie",
    description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    // Icons removed to prevent 404 errors - add icon files to public directory when available
    icons: [],
    categories: ["business", "lifestyle"],
    lang: "en-ZA",
    dir: "ltr",
    orientation: "portrait-primary",
  };
}
