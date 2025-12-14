import { MetadataRoute } from "next";

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "Shalean Cleaning Services",
    short_name: "Shalean",
    description:
      "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [],
    categories: ["business", "lifestyle"],
    lang: "en-ZA",
    dir: "ltr",
    orientation: "portrait-primary",
  };

  return Response.json(manifest);
}






