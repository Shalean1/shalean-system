import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserDisplayName } from "@/lib/storage/profile-supabase";
import ReferralCode from "@/components/dashboard/ReferralCode";
import ShareButtons from "@/components/dashboard/ShareButtons";
import ReferralStats from "@/components/dashboard/ReferralStats";
import ReferralHistory from "@/components/dashboard/ReferralHistory";
import { UserPlus, Gift, Info } from "lucide-react";

export default async function ReferEarnPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const displayName = await getUserDisplayName();
  
  // Get or create referral code for user
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

  const referralUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/signup?ref=${referralCode}`;

  // TODO: Fetch actual referral stats from database when referral system is implemented
  // For now, using placeholder data
  const referralStats = {
    totalReferrals: 0,
    successfulReferrals: 0,
    totalRewards: 0,
    pendingRewards: 0,
  };

  const referralHistory: Array<{
    id: string;
    referredEmail: string;
    status: "pending" | "completed" | "failed";
    rewardAmount: number;
    createdAt: string;
  }> = [];

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Refer & Earn
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Share with friends and earn rewards for every successful referral
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="mb-8">
          <ReferralCode code={referralCode} referralUrl={referralUrl} />
        </div>

        {/* Share Buttons */}
        <div className="mb-8">
          <ShareButtons referralUrl={referralUrl} referralCode={referralCode} />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <ReferralStats
            totalReferrals={referralStats.totalReferrals}
            successfulReferrals={referralStats.successfulReferrals}
            totalRewards={referralStats.totalRewards}
            pendingRewards={referralStats.pendingRewards}
          />
        </div>

        {/* How It Works */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 md:p-8">
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
                Copy your unique referral code or share the link with friends and family
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-sm text-gray-600">
                Your friends sign up using your referral code and make their first booking
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Earn R50 in BokCred credits for each successful referral when they complete their first booking
              </p>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Rewards</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                <span className="font-semibold">R50 BokCred Credits</span> for you and <span className="font-semibold">R50 for your friend</span> when they complete their first booking
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Credits are added to your account automatically once the referral completes their first booking
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Use your BokCred credits to pay for bookings instantly - no expiration date!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <p>
                Track all your referrals and rewards in the history section below
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

