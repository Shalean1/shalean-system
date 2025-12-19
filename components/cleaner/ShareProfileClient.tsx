"use client";

import { useState } from "react";
import { Copy, Check, Share2, Mail, MessageSquare, Link2 } from "lucide-react";
import { CleanerProfile } from "@/lib/types/cleaner";

interface ShareProfileClientProps {
  cleaner: CleanerProfile;
  profileLink: string;
}

export default function ShareProfileClient({ cleaner, profileLink }: ShareProfileClientProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Book ${cleaner.name} for your cleaning service`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd love to help you with your cleaning needs! Check out my profile:\n\n${profileLink}\n\nBest regards,\n${cleaner.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi! I'm ${cleaner.name}, a professional cleaner. Check out my profile: ${profileLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Share My Profile
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Share your profile link with customers to get more bookings
          </p>
        </div>

        {/* Profile Link Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your Profile Link</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <Share2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={profileLink}
                readOnly
                className="flex-1 bg-transparent text-gray-900 text-sm md:text-base focus:outline-none"
              />
            </div>
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Share this link with customers so they can view your profile and book your services directly.
          </p>
        </div>

        {/* Sharing Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Via</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">Share via email</p>
              </div>
            </button>

            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">Share via WhatsApp</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for Sharing</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                1
              </div>
              <p>Share your profile link in your social media bios and posts</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                2
              </div>
              <p>Send the link directly to satisfied customers who might want to book again</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                3
              </div>
              <p>Include your profile link in your email signature</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                4
              </div>
              <p>Ask happy customers to share your profile with their friends and family</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
