import { MetadataRoute } from "next";

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "Bokkie Cleaning Services",
    short_name: "Bokkie",
    description:
      "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [],
    categories: ["business", "lifestyle"],
    lang: "en-ZA",
    dir: "ltr",
    orientation: "portrait-primary",
  };

  return Response.json(manifest);
}






















