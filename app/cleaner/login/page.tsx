"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authenticateCleanerWithPassword, sendCleanerSMSCode, verifyCleanerSMSCode } from "@/app/actions/cleaner-auth";
import { CleanerLoginData, CleanerAuthMethod } from "@/lib/types/cleaner";
import { extractPhoneNumber } from "@/lib/utils/phone";

function CleanerLoginForm() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<CleanerAuthMethod>("password");
  const [formData, setFormData] = useState<CleanerLoginData>({
    phone: "",
    password: "",
    smsCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handleInputChange = (field: keyof CleanerLoginData, value: string) => {
    // If phone field, extract phone number (remove email domain if present)
    if (field === "phone") {
      value = extractPhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSendSMSCode = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrors({});

    const result = await sendCleanerSMSCode(formData.phone);

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: result.message,
      });
      setSmsSent(true);
    } else {
      setSubmitStatus({
        type: "error",
        message: result.message,
      });
      if (result.errors) {
        setErrors(result.errors);
      }
    }

    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrors({});

    let result;

    if (authMethod === "password") {
      result = await authenticateCleanerWithPassword(formData);
    } else {
      // SMS Code method
      if (!smsSent) {
        // First step: send SMS code
        result = await sendCleanerSMSCode(formData.phone);
        if (result.success) {
          setSmsSent(true);
          setSubmitStatus({
            type: "success",
            message: "SMS code sent! Please check your phone.",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Second step: verify SMS code
        result = await verifyCleanerSMSCode(formData.phone, formData.smsCode || "");
      }
    }

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: result.message,
      });
      // Redirect to cleaner dashboard after successful login
      setTimeout(() => {
        router.push("/cleaner");
      }, 500);
    } else {
      setSubmitStatus({
        type: "error",
        message: result.message,
      });
      if (result.errors) {
        setErrors(result.errors);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-md mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your dashboard and manage bookings
            </p>
          </div>

          {/* Success/Error Message */}
          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{submitStatus.message}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setSmsSent(false);
                  setFormData({ phone: formData.phone, password: "", smsCode: "" });
                  setErrors({});
                  setSubmitStatus(null);
                }}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  authMethod === "password"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("sms");
                  setSmsSent(false);
                  setFormData({ phone: formData.phone, password: "", smsCode: "" });
                  setErrors({});
                  setSubmitStatus(null);
                }}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  authMethod === "sms"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                SMS Code
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+27 12 345 6789"
                    required
                    disabled={smsSent && authMethod === "sms"}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password Field (for Password tab) */}
              {authMethod === "password" && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              )}

              {/* SMS Code Field (for SMS Code tab) */}
              {authMethod === "sms" && smsSent && (
                <div>
                  <label htmlFor="smsCode" className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="smsCode"
                      value={formData.smsCode}
                      onChange={(e) => handleInputChange("smsCode", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.smsCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                  {errors.smsCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.smsCode}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSendSMSCode}
                    disabled={isSubmitting}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Processing..."
                  : authMethod === "sms" && !smsSent
                  ? "Send SMS Code"
                  : "Sign In"}
              </button>
            </form>

            {/* Support Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact support at{" "}
                <a
                  href="mailto:support@shalean.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  support@shalean.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CleanerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CleanerLoginForm />
    </Suspense>
  );
}
