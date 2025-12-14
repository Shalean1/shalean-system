import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPayments } from "@/lib/storage/payments-supabase";
import { getUserPaymentMethods } from "@/lib/storage/payment-methods-supabase";
import PaymentsSection from "@/components/dashboard/PaymentsSection";

export default async function PaymentsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch payments and payment methods
  const [payments, paymentMethods] = await Promise.all([
    getUserPayments().catch(() => []),
    getUserPaymentMethods().catch(() => []),
  ]);

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Payments
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            View your payment history and manage payment methods
          </p>
        </div>

        {/* Payments Section with Filter Bar and List */}
        <PaymentsSection payments={payments} paymentMethods={paymentMethods} />
      </div>
    </div>
  );
}

