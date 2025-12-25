"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";

export default function BookingLayoutHeader() {
  const pathname = usePathname();
  
  // Hide header on confirmation page (it has its own header)
  if (pathname?.includes("/confirmation")) {
    return null;
  }
  
  // Determine current step based on pathname
  let currentStep = 1;
  if (pathname?.includes("/schedule")) {
    currentStep = 2;
  } else if (pathname?.includes("/review")) {
    currentStep = 3;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/bokkie-logo.png" 
              alt="Bokkie" 
              width={40}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
              Bokkie
            </span>
          </Link>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center">
            <ProgressIndicator currentStep={currentStep} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="hidden md:block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Become a Cleaner
            </Link>
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
    </div>
  );
}
