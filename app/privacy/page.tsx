import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Shalean Cleaning Services ("we", "us", "our") is committed to protecting your 
              privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our services or visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We may collect the following types of information:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>• Personal identification information (name, email address, phone number)</li>
              <li>• Property address and access information</li>
              <li>• Payment information (processed securely through third-party providers)</li>
              <li>• Service preferences and history</li>
              <li>• Website usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use collected information to:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>• Provide and improve our cleaning services</li>
              <li>• Process bookings and payments</li>
              <li>• Communicate with you about your services</li>
              <li>• Send service-related updates and information</li>
              <li>• Improve our website and user experience</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information only:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>• With your explicit consent</li>
              <li>• With service providers who assist in our operations (under strict confidentiality agreements)</li>
              <li>• When required by law or to protect our rights</li>
              <li>• In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or 
              destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>• Access your personal information</li>
              <li>• Correct inaccurate information</li>
              <li>• Request deletion of your information</li>
              <li>• Object to processing of your information</li>
              <li>• Request data portability</li>
              <li>• Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              Our website may use cookies and similar tracking technologies to enhance your 
              experience. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible 
              for the privacy practices of these external sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not directed to individuals under 18. We do not knowingly 
              collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new policy on this page and updating the "Last 
              updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, 
              please contact us:
            </p>
            <ul className="text-gray-700">
              <li>Phone: <a href="tel:+27871535250" className="text-blue-600 hover:underline">+27 87 153 5250</a></li>
              <li>Email: <a href="mailto:support@shalean.com" className="text-blue-600 hover:underline">support@shalean.com</a></li>
              <li>Address: 39 Harvey Road, Claremont, Cape Town 7708, Western Cape</li>
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


