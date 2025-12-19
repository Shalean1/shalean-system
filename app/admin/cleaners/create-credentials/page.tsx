"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { 
  createCleanerCredentials, 
  getCleanersWithCredentialsStatus,
  type CreateCleanerCredentialsData,
  type CleanerWithCredentialsStatus 
} from "@/app/actions/create-cleaner-credentials";

export default function CreateCleanerCredentialsPage() {
  const router = useRouter();
  const [cleaners, setCleaners] = useState<CleanerWithCredentialsStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCleanerCredentialsData>({
    cleanerId: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadCleaners();
  }, []);

  async function loadCleaners() {
    setLoading(true);
    try {
      const data = await getCleanersWithCredentialsStatus();
      // Filter out "no-preference" cleaner
      const filteredData = data.filter((c) => c.cleaner_id !== "no-preference");
      setCleaners(filteredData);
    } catch (error) {
      console.error("Error loading cleaners:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to load cleaners. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof CreateCleanerCredentialsData, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrors({});

    const result = await createCleanerCredentials(formData);

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: result.message,
      });
      // Reset form
      setFormData({
        cleanerId: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Reload cleaners to update status
      await loadCleaners();
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

  // Get selected cleaner name for display
  const selectedCleaner = cleaners.find((c) => c.cleaner_id === formData.cleanerId);
  const selectedCleanerHasCredentials = selectedCleaner?.hasCredentials;

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create Cleaner Credentials
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Create login credentials for cleaners to access their dashboard
              </p>
            </div>
          </div>
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

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cleaners...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cleaner Selection */}
              <div>
                <label htmlFor="cleanerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cleaner *
                </label>
                <select
                  id="cleanerId"
                  value={formData.cleanerId}
                  onChange={(e) => handleInputChange("cleanerId", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cleanerId ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">-- Select a cleaner --</option>
                  {cleaners.map((cleaner) => (
                    <option key={cleaner.cleaner_id} value={cleaner.cleaner_id}>
                      {cleaner.name}
                      {cleaner.hasCredentials && " (Has Credentials)"}
                    </option>
                  ))}
                </select>
                {errors.cleanerId && (
                  <p className="mt-1 text-sm text-red-600">{errors.cleanerId}</p>
                )}
                {selectedCleanerHasCredentials && (
                  <p className="mt-1 text-sm text-yellow-600">
                    ⚠️ This cleaner already has credentials. Creating new credentials will fail.
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
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
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Phone number is required for cleaner login
                </p>
              </div>

              {/* Email (Optional) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="cleaner@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  If provided, cleaner can login with email or phone
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
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
                    placeholder="Enter password"
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
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedCleanerHasCredentials}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Credentials
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Cleaners Status List */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleaners Status</h3>
              {cleaners.length === 0 ? (
                <p className="text-gray-500 text-sm">No cleaners found</p>
              ) : (
                <div className="space-y-2">
                  {cleaners.map((cleaner) => (
                    <div
                      key={cleaner.cleaner_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900">{cleaner.name}</span>
                      {cleaner.hasCredentials ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Has Credentials
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          No Credentials
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
