import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import ReferralCode from "@/components/dashboard/ReferralCode";
import CleanerShareButtons from "@/components/cleaner/CleanerShareButtons";
import ReferralStats from "@/components/dashboard/ReferralStats";
import ReferralHistory from "@/components/dashboard/ReferralHistory";
import { UserPlus, Gift, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferFriendPage() {
  const cleaner = await getCurrentCleaner();

  if (!cleaner) {
    redirect("/cleaner/login");
  }

  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cleaner/login");
  }

  // Get or create referral code for cleaner
  let referralCode: string;
  const { data: referralCodeData, error: referralCodeError } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .single();

  if (referralCodeError || !referralCodeData) {
    // If code doesn't exist, create it using the database function
    const { data: newCode, error: createError } = await supabase.rpc(
      "get_or_create_referral_code",
      { p_user_id: user.id }
    );

    if (createError || !newCode) {
      // Fallback: generate a simple code
      const hash = user.id.split("-").join("").substring(0, 8).toUpperCase();
      referralCode = `REF-${hash}`;
    } else {
      referralCode = newCode;
    }
  } else {
    referralCode = referralCodeData.code;
  }

  // Cleaner referral URL - points to cleaner application page
  const referralUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cleaner/apply?ref=${referralCode}`;

  // Fetch referral stats from database
  const { data: referralsData, error: referralsError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", user.id);

  let referralStats = {
    totalReferrals: 0,
    successfulReferrals: 0,
    totalRewards: 0,
    pendingRewards: 0,
  };

  let referralHistory: Array<{
    id: string;
    referredEmail: string;
    status: "pending" | "completed" | "failed";
    rewardAmount: number;
    createdAt: string;
  }> = [];

  if (!referralsError && referralsData) {
    referralStats.totalReferrals = referralsData.length;
    referralStats.successfulReferrals = referralsData.filter(
      (r) => r.status === "completed"
    ).length;
    
    // Calculate rewards (R50 per completed referral)
    referralStats.totalRewards = referralStats.successfulReferrals * 50;
    referralStats.pendingRewards = referralsData.filter(
      (r) => r.status === "pending"
    ).length * 50;

    // Build referral history
    // Note: We need to get referee email from profiles table
    const refereeIds = referralsData.map((r) => r.referee_id);
    const { data: refereeProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", refereeIds);

    referralHistory = referralsData.map((referral) => {
      const refereeProfile = refereeProfiles?.find(
        (p) => p.id === referral.referee_id
      );
      return {
        id: referral.id,
        referredEmail: refereeProfile?.email || "Unknown",
        status: referral.status as "pending" | "completed" | "failed",
        rewardAmount: referral.status === "completed" ? 50 : 0,
        createdAt: referral.created_at,
      };
    });

    // Sort by most recent first
    referralHistory.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Refer a Friend Cleaner
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Refer other cleaners to join Shalean and earn rewards when they start working
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="mb-6">
          <ReferralCode 
            code={referralCode} 
            referralUrl={referralUrl}
            description="Share this code with other cleaners to join Shalean and earn rewards"
          />
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <CleanerShareButtons referralUrl={referralUrl} referralCode={referralCode} />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <ReferralStats
            totalReferrals={referralStats.totalReferrals}
            successfulReferrals={referralStats.successfulReferrals}
            totalRewards={referralStats.totalRewards}
            pendingRewards={referralStats.pendingRewards}
          />
        </div>

        {/* How It Works */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Code</h3>
              <p className="text-sm text-gray-600">
                Copy your unique referral code or share the link with other cleaners who want to join Shalean
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Apply</h3>
              <p className="text-sm text-gray-600">
                Your referred cleaner applies using your referral code and gets approved to work with Shalean
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Earn rewards when your referred cleaner completes their first booking with Shalean
              </p>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Rewards</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                <span className="font-semibold">Reward for you</span> when your referred cleaner completes their first booking with Shalean
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Help grow the Shalean team by referring quality cleaners you know and trust
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Rewards are added to your account automatically once your referral starts working
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Track all your cleaner referrals and rewards in the history section below
              </p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div>
          <ReferralHistory referrals={referralHistory} />
        </div>
      </div>
    </div>
  );
}
