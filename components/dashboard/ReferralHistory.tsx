"use client";

import { Calendar, CheckCircle, Clock, XCircle, Users } from "lucide-react";

interface Referral {
  id: string;
  referredEmail: string;
  status: "pending" | "completed" | "failed";
  rewardAmount: number;
  createdAt: string;
}

interface ReferralHistoryProps {
  referrals: Referral[];
}

export default function ReferralHistory({ referrals }: ReferralHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (referrals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No referrals yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start sharing your referral code to see your referral history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h3>
      <div className="space-y-3">
        {referrals.map((referral) => (
          <div
            key={referral.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">{getStatusIcon(referral.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{referral.referredEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{formatDate(referral.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {referral.status === "completed" && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    R{referral.rewardAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Reward</p>
                </div>
              )}
              {getStatusBadge(referral.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
