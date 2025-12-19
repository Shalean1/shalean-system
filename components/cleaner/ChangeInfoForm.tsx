"use client";

import { useState, FormEvent } from "react";
import { UserProfile } from "@/lib/storage/profile-supabase";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, Save, Loader2, Globe, FileText, ChevronDown } from "lucide-react";

interface ChangeInfoFormProps {
  initialProfile: UserProfile | null;
  userEmail: string;
  cancelLink?: string;
}

const QUERY_OPTIONS = [
  "Profile Change Request",
  "Contact Information Update",
  "Personal Details Update",
  "Other",
];

const SUB_QUERY_OPTIONS: Record<string, string[]> = {
  "Profile Change Request": [
    "Change Name",
    "Change Email",
    "Change Phone Number",
    "Change Country",
    "Other Profile Change",
  ],
  "Contact Information Update": [
    "Update Email Address",
    "Update Phone Number",
    "Update Work Mobile",
    "Other Contact Update",
  ],
  "Personal Details Update": [
    "Update First Name",
    "Update Surname",
    "Update Full Name",
    "Other Personal Update",
  ],
  "Other": [
    "General Inquiry",
    "Account Issue",
    "Technical Support",
  ],
};

const COUNTRIES = [
  "South Africa",
  "Lesotho",
  "Botswana",
  "Namibia",
  "Zimbabwe",
  "Mozambique",
  "Eswatini",
  "Other",
];

export default function ChangeInfoForm({ 
  initialProfile, 
  userEmail, 
  cancelLink = "/cleaner" 
}: ChangeInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    email: initialProfile?.email || userEmail || "",
    workMobile: initialProfile?.phone || "",
    country: "South Africa",
    firstName: initialProfile?.firstName || "",
    surname: initialProfile?.lastName || "",
    query: "Profile Change Request",
    subQuery: "",
    description: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: formData.firstName || null,
          last_name: formData.surname || null,
          full_name: formData.firstName && formData.surname 
            ? `${formData.firstName} ${formData.surname}` 
            : formData.firstName || formData.surname || null,
          email: formData.email || null,
          phone: formData.workMobile || null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw profileError;
      }

      // TODO: Store query/subquery/description in a support/requests table if needed
      // For now, we'll just update the profile

      setMessage({ type: "success", text: "Your information change request has been submitted successfully!" });
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          ...formData,
          query: "Profile Change Request",
          subQuery: "",
          description: "",
        });
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableSubQueries = formData.query ? (SUB_QUERY_OPTIONS[formData.query] || []) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address:
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        {/* Work Mobile */}
        <div>
          <label htmlFor="workMobile" className="block text-sm font-medium text-gray-700 mb-2">
            Work Mobile:
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="workMobile"
              type="tel"
              value={formData.workMobile}
              onChange={(e) => setFormData({ ...formData, workMobile: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              placeholder="Enter your work mobile number"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Work mobile should be same as Personal mobile if the Worker is using own phone.
          </p>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country:
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50"
              required
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First name:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              placeholder="Enter your first name"
              required
            />
          </div>
        </div>

        {/* Surname */}
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
            Surname:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="surname"
              type="text"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              placeholder="Enter your surname"
              required
            />
          </div>
        </div>

        {/* Query */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Query:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <select
              id="query"
              value={formData.query}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  query: e.target.value,
                  subQuery: "", // Reset sub query when query changes
                });
              }}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50"
              required
            >
              {QUERY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub Query */}
        <div>
          <label htmlFor="subQuery" className="block text-sm font-medium text-gray-700 mb-2">
            Sub Query:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <select
              id="subQuery"
              value={formData.subQuery}
              onChange={(e) => setFormData({ ...formData, subQuery: e.target.value })}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50"
              required
            >
              <option value="">---------</option>
              {availableSubQueries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description:
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y bg-gray-50"
            placeholder="Please provide details about your request..."
          />
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
