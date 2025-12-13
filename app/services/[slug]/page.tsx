import { redirect } from "next/navigation";
import Link from "next/link";

// Map old service IDs to new ones or redirect to services section
const serviceRedirects: Record<string, string> = {
  "holiday-cleaning": "residential-cleaning",
  "office-cleaning": "commercial-cleaning",
  "residential-cleaning": "residential-cleaning",
  "move-in-cleaning": "specialized-cleaning",
  "deep-cleaning": "specialized-cleaning",
};

const validServices = [
  "residential-cleaning",
  "commercial-cleaning",
  "specialized-cleaning",
];

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // If it's an old service ID, redirect to the new one
  if (serviceRedirects[slug] && serviceRedirects[slug] !== slug) {
    redirect(`/services/${serviceRedirects[slug]}`);
  }

  // If it's a valid service, show the service page
  if (validServices.includes(slug)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/#services"
              className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
            >
              ← Back to Services
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h1>
            <p className="text-lg text-gray-600">
              Learn more about our {slug.replace(/-/g, " ")} services. Visit our{" "}
              <Link href="/#services" className="text-blue-600 hover:underline">
                services page
              </Link>{" "}
              to see all available cleaning services.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For any other service ID, redirect to services section
  redirect("/#services");
}
