"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { getEFTSubmissionsAction } from "@/app/actions/credits";
import { EFTPaymentSubmission } from "@/lib/storage/eft-supabase";

export default function EFTPendingStatus() {
  const [submissions, setSubmissions] = useState<EFTPaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const result = await getEFTSubmissionsAction();
      if (result.success && result.submissions) {
        setSubmissions(result.submissions);
      }
    } catch (error) {
      console.error("Error loading EFT submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  if (loading) {
    return null;
  }

  if (pendingSubmissions.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-900 mb-2">
            Pending EFT Payments ({pendingSubmissions.length})
          </h3>
          <div className="space-y-2">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-3 bg-white rounded-lg border border-yellow-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      R{submission.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ref: {submission.referenceNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-700 mt-3">
            Your credits will be added after manual verification (usually within 24 hours)
          </p>
        </div>
      </div>
    </div>
  );
}








