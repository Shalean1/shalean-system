"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Phone, ArrowRight } from "lucide-react";

export default function QuoteConfirmationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Bokkie
              </span>
            </Link>

            {/* Back Button */}
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Quote Request Received!
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Thank you for requesting a quote from Bokkie Cleaning Services. We've received your request and will get back to you shortly.
            </p>
          </div>

          {/* Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Review Your Request</h3>
                  <p className="text-gray-600 text-sm">
                    Our team will review your cleaning requirements and prepare a personalized quote.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Receive Your Quote</h3>
                  <p className="text-gray-600 text-sm">
                    We'll send you a detailed quote via email within 24 hours. Check your inbox for updates.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Schedule Your Service</h3>
                  <p className="text-gray-600 text-sm">
                    Once you approve the quote, we'll help you schedule your cleaning service at your convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or need to modify your request, feel free to reach out to us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="mailto:info@bokkiecleaning.co.za" className="text-blue-600 hover:text-blue-700 font-medium">
                  info@bokkiecleaning.co.za
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <a href="tel:+27724162547" className="text-blue-600 hover:text-blue-700 font-medium">
                  +27 72 416 2547
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              Return to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/booking/quote"
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 text-center flex items-center justify-center gap-2"
            >
              Request Another Quote
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your email address with all the details of your quote request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
