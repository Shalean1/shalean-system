"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralCodeProps {
  code: string;
  referralUrl: string;
}

export default function ReferralCode({ code, referralUrl }: ReferralCodeProps) {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500 text-white">
          <Share2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Referral Code</h2>
          <p className="text-sm text-gray-600">Share this code with friends to earn rewards</p>
        </div>
      </div>

      {/* Referral Code Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-lg border-2 border-blue-300 px-4 py-3 font-mono text-lg font-bold text-gray-900 tracking-wider">
            {code}
          </div>
          <button
            onClick={copyCode}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Referral URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-lg border-2 border-blue-300 px-4 py-3 text-sm text-gray-700 break-all">
            {referralUrl}
          </div>
          <button
            onClick={copyUrl}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {copiedUrl ? (
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
      </div>
    </div>
  );
}
