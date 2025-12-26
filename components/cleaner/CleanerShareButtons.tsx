"use client";

import { useState, useEffect } from "react";
import { Share2, MessageCircle, Mail, Facebook, Twitter } from "lucide-react";

interface CleanerShareButtonsProps {
  referralUrl: string;
  referralCode: string;
}

export default function CleanerShareButtons({ referralUrl, referralCode }: CleanerShareButtonsProps) {
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    // Check for native share API only on client side
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareMessage = `Join Bokkie Cleaning Services as a cleaner! Use my referral code ${referralCode} to apply: ${referralUrl}`;

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join Bokkie Cleaning Services as a Cleaner");
    const body = encodeURIComponent(
      `Hi there!\n\nI wanted to share an opportunity to join Bokkie Cleaning Services as a cleaner. It's a great way to grow your own business while keeping Cape Town homes spotless!\n\nUse my referral code: ${referralCode}\n\nApply here: ${referralUrl}\n\nThanks!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Bokkie Cleaning Services as a Cleaner",
          text: shareMessage,
          url: referralUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Share via</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {hasNativeShare && (
          <button
            onClick={shareViaNative}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Share2 className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Share</span>
          </button>
        )}
        <button
          onClick={shareViaWhatsApp}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-gray-700">WhatsApp</span>
        </button>
        <button
          onClick={shareViaEmail}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Mail className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Email</span>
        </button>
        <button
          onClick={shareViaFacebook}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Facebook className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Facebook</span>
        </button>
        <button
          onClick={shareViaTwitter}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Twitter className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-medium text-gray-700">Twitter</span>
        </button>
        <button
          onClick={() => {
            const textarea = document.createElement("textarea");
            textarea.value = shareMessage;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            alert("Message copied to clipboard!");
          }}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Copy Text</span>
        </button>
      </div>
    </div>
  );
}
