import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const guides: Record<string, { title: string; description: string; content: string[] }> = {
  "maintain-spotless-home": {
    title: "How to maintain a spotless home",
    description: "Expert tips and tricks for keeping your home clean and organized",
    content: [
      "Establish a daily cleaning routine for high-traffic areas like kitchens and bathrooms.",
      "Declutter regularly to prevent accumulation of unnecessary items.",
      "Use the right cleaning products for different surfaces to avoid damage.",
      "Clean from top to bottom to avoid re-soiling cleaned areas.",
      "Set aside time each week for deeper cleaning tasks.",
      "Involve all household members in maintaining cleanliness.",
      "Keep cleaning supplies easily accessible in each room.",
    ],
  },
  "move-in-cleaning": {
    title: "Preparing for move-in cleaning",
    description: "Complete guide to getting your new home ready",
    content: [
      "Start with a thorough deep clean before moving in any furniture.",
      "Clean all cabinets, drawers, and storage spaces.",
      "Sanitize bathrooms and kitchens completely.",
      "Clean windows and window sills for a fresh start.",
      "Vacuum and mop all floors, including baseboards.",
      "Check and clean air vents and filters.",
      "Disinfect all surfaces, especially in kitchens and bathrooms.",
      "Consider professional deep cleaning for carpets and upholstery.",
    ],
  },
  "office-cleaning-best-practices": {
    title: "Office cleaning best practices",
    description: "Maintain a professional and healthy workspace",
    content: [
      "Establish a regular cleaning schedule for daily, weekly, and monthly tasks.",
      "Focus on high-touch surfaces like keyboards, phones, and door handles.",
      "Keep common areas like break rooms and restrooms well-maintained.",
      "Use appropriate disinfectants for different office surfaces.",
      "Maintain proper ventilation and air quality.",
      "Organize cleaning supplies and ensure they're easily accessible.",
      "Train staff on basic cleaning protocols and hygiene practices.",
      "Consider professional cleaning services for thorough deep cleaning.",
    ],
  },
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = guides[id];

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/guides"
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {guide.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {guide.description}
          </p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Key Tips
            </h2>
            <ul className="space-y-3 text-gray-700">
              {guide.content.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 p-8 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Professional Help?
            </h3>
            <p className="text-gray-700 mb-6">
              Our experienced cleaning team can help you maintain a spotless home or office. 
              Contact us today for a free quote.
            </p>
            <Link
              href="/#contact"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}















