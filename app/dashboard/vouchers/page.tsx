import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserVouchers, getVoucherUsageHistory, getPurchasableVouchers } from "@/app/actions/vouchers";
import VoucherList from "@/components/dashboard/VoucherList";
import VoucherUsageHistoryComponent from "@/components/dashboard/VoucherUsageHistory";
import PurchasableVouchersList from "@/components/dashboard/PurchasableVouchersList";

export default async function VouchersPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch vouchers, purchasable vouchers, and usage history
  // Use Promise.allSettled to prevent one failure from breaking the page
  const [vouchersResult, purchasableVouchersResult, usageHistoryResult] = await Promise.allSettled([
    getUserVouchers(),
    getPurchasableVouchers(),
    getVoucherUsageHistory(),
  ]);

  const vouchers = vouchersResult.status === "fulfilled" ? vouchersResult.value : [];
  const purchasableVouchers = purchasableVouchersResult.status === "fulfilled" ? purchasableVouchersResult.value : [];
  const usageHistory = usageHistoryResult.status === "fulfilled" ? usageHistoryResult.value : [];

  // Log errors if any occurred
  if (vouchersResult.status === "rejected") {
    console.error("Error fetching vouchers:", vouchersResult.reason);
  }
  if (purchasableVouchersResult.status === "rejected") {
    console.error("Error fetching purchasable vouchers:", purchasableVouchersResult.reason);
  }
  if (usageHistoryResult.status === "rejected") {
    console.error("Error fetching usage history:", usageHistoryResult.reason);
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Vouchers
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View and redeem your vouchers, purchase new vouchers, and view usage history
          </p>
        </div>

        {/* Purchasable Vouchers */}
        {purchasableVouchers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Purchase Vouchers
            </h2>
            <PurchasableVouchersList vouchers={purchasableVouchers} />
          </div>
        )}

        {/* Vouchers List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Vouchers
          </h2>
          <VoucherList vouchers={vouchers} />
        </div>

        {/* Usage History */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage History
          </h2>
          <VoucherUsageHistoryComponent history={usageHistory} />
        </div>
      </div>
    </div>
  );
}

