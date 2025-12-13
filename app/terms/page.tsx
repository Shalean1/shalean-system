import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Service Agreement</h2>
            <p className="text-gray-700 mb-4">
              By booking our cleaning services, you agree to these terms and conditions. 
              Shalean Cleaning Services ("we", "us", "our") provides professional cleaning 
              services to residential and commercial clients.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Booking and Cancellation</h2>
            <p className="text-gray-700 mb-4">
              Bookings must be confirmed at least 24 hours in advance. Cancellations made less 
              than 24 hours before the scheduled service may incur a cancellation fee. We 
              reserve the right to reschedule or cancel services due to unforeseen circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              Payment is due upon completion of service unless otherwise agreed. We accept 
              cash, bank transfer, and other agreed payment methods. Late payments may result 
              in suspension of services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Guarantee</h2>
            <p className="text-gray-700 mb-4">
              We guarantee our work and will return to address any issues reported within 
              24 hours of service completion at no additional charge, provided the issue 
              is due to our service quality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Liability</h2>
            <p className="text-gray-700 mb-4">
              We are fully insured and bonded. However, we are not responsible for damage 
              to items not disclosed before service or damage resulting from pre-existing 
              conditions. Clients should secure valuables before service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Access and Security</h2>
            <p className="text-gray-700 mb-4">
              Clients are responsible for providing safe access to the property. We reserve 
              the right to refuse service if conditions are unsafe or if our staff feel 
              threatened or uncomfortable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Continued use of our 
              services constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these terms, please contact us at:
            </p>
            <ul className="text-gray-700">
              <li>Phone: <a href="tel:+27871535250" className="text-blue-600 hover:underline">+27 87 153 5250</a></li>
              <li>Email: <a href="mailto:support@shalean.com" className="text-blue-600 hover:underline">support@shalean.com</a></li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


