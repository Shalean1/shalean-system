"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";

function SignupConfirmationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from query params if available
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Shalean
              </span>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-lg text-gray-600">
                We've sent you a verification link
              </p>
            </div>

            {/* Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Account Created Successfully!
                  </p>
                  <p className="text-sm text-blue-800">
                    {email ? (
                      <>
                        We've sent a verification email to <strong>{email}</strong>. 
                        Please check your inbox and click the verification link to activate your account.
                      </>
                    ) : (
                      <>
                        We've sent a verification email to your email address. 
                        Please check your inbox and click the verification link to activate your account.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-gray-700">1</span>
                </div>
                <p className="text-sm text-gray-700">
                  Check your email inbox (and spam folder if you don't see it)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-gray-700">2</span>
                </div>
                <p className="text-sm text-gray-700">
                  Click on the verification link in the email
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-gray-700">3</span>
                </div>
                <p className="text-sm text-gray-700">
                  You'll be automatically logged in and redirected to your account
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-600 text-center">
                <strong>Note:</strong> The verification link will expire after a certain period. 
                If you didn't receive the email, please check your spam folder or try signing up again.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupConfirmationForm />
    </Suspense>
  );
}
