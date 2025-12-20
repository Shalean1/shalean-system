"use client";

import { useState, useRef } from "react";
import { Upload, Building2, Copy, Check } from "lucide-react";
import { submitEFTPaymentAction } from "@/app/actions/credits";

interface EFTPaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Bank account details - should be moved to environment variables or database
const BANK_DETAILS = {
  bankName: "Shalean Bank Account",
  accountName: "Shalean Cleaning Services",
  accountNumber: "1234567890", // Replace with actual account number
  branchCode: "123456", // Replace with actual branch code
  accountType: "Cheque Account",
};

export default function EFTPaymentForm({
  amount,
  onSuccess,
  onError,
}: EFTPaymentFormProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      onError?.("Invalid file type. Only images and PDFs are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.("File size exceeds 5MB limit.");
      return;
    }

    setProofFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/credits/eft/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      setProofUrl(data.url);
    } catch (error) {
      console.error("Error uploading file:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to upload proof"
      );
      setProofFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referenceNumber.trim()) {
      onError?.("Please enter a reference number");
      return;
    }

    if (!proofUrl && !proofFile) {
      onError?.("Please upload proof of payment");
      return;
    }

    setSubmitting(true);
    onError?.(undefined as any);

    try {
      // If file was selected but not uploaded yet, upload it first
      let finalProofUrl = proofUrl;
      if (proofFile && !proofUrl) {
        const formData = new FormData();
        formData.append("file", proofFile);

        const uploadResponse = await fetch("/api/credits/eft/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Failed to upload file");
        }
        finalProofUrl = uploadData.url;
      }

      const result = await submitEFTPaymentAction(
        amount,
        referenceNumber.trim(),
        finalProofUrl || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to submit EFT payment");
      }

      // Reset form
      setReferenceNumber("");
      setProofFile(null);
      setProofUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting EFT payment:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to submit EFT payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bank Account Details */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Bank Account Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Bank:</span>
            <span className="font-medium text-gray-900">{BANK_DETAILS.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium text-gray-900">{BANK_DETAILS.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Account Number:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-gray-900">
                {BANK_DETAILS.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy account number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Branch Code:</span>
            <span className="font-medium text-gray-900">{BANK_DETAILS.branchCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-medium text-gray-900">{BANK_DETAILS.accountType}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-blue-600">
                R{amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Number *
        </label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Enter your payment reference"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use your name or booking reference as the payment reference
        </p>
      </div>

      {/* Proof Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proof of Payment *
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {proofFile || proofUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {proofFile?.name || "File uploaded"}
                </p>
                {proofUrl && (
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View uploaded file
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null);
                    setProofUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="proof-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="proof-upload"
                      ref={fileInputRef}
                      name="proof-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
        {uploading && (
          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !referenceNumber.trim() || (!proofFile && !proofUrl)}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Submit EFT Payment"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your credits will be added after manual verification (usually within 24 hours)
      </p>
    </form>
  );
}









