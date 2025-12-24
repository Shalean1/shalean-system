import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCreditBalanceAction } from "@/app/actions/credits";
import CreditBalance from "@/components/credits/CreditBalance";
import CreditPurchaseForm from "@/components/credits/CreditPurchaseForm";
import TransactionHistory from "@/components/credits/TransactionHistory";
import EFTPendingStatus from "@/components/credits/EFTPendingStatus";
import PaymentSuccessHandler from "@/components/credits/PaymentSuccessHandler";
import { Coins } from "lucide-react";

export default async function ShalCredPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Get initial balance (handle errors gracefully)
  let initialBalance = 0;
  try {
    const balanceResult = await getUserCreditBalanceAction();
    initialBalance = balanceResult.success && balanceResult.balance !== undefined ? balanceResult.balance : 0;
  } catch (error) {
    console.error("Error loading credit balance in page:", error);
    // Continue with 0 balance if there's an error
    initialBalance = 0;
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
              <Coins className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                ShalCred
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Purchase credits and manage your balance
              </p>
            </div>
          </div>
        </div>

        {/* Payment Success Handler */}
        <PaymentSuccessHandler />

        {/* Credit Balance Card */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CreditBalance initialBalance={initialBalance} />
          </div>
        </div>

        {/* Pending EFT Status */}
        <div className="mb-6">
          <EFTPendingStatus />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Purchase Credits
            </h2>
            <CreditPurchaseForm />
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Transaction History
            </h2>
            <TransactionHistory />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">About ShalCred</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Purchase credits from R20 to R5000</li>
            <li>• Use credits to pay for bookings instantly</li>
            <li>• Card payments are instant, EFT deposits require manual verification</li>
            <li>• Credits never expire</li>
            <li>• View your transaction history anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

















