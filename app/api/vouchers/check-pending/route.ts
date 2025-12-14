import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API route to check if a pending voucher purchase exists for a payment reference
 * Useful for checking purchase status before attempting to complete it
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User must be logged in" },
        { status: 401 }
      );
    }

    // Check if pending purchase exists
    const { data: pendingPurchase, error } = await supabase
      .from("pending_voucher_purchases")
      .select("id, voucher_id, payment_reference, amount, status, created_at, updated_at")
      .eq("payment_reference", reference)
      .eq("user_id", user.id)
      .single();

    if (error || !pendingPurchase) {
      return NextResponse.json({
        success: false,
        message: "Pending purchase not found",
        exists: false,
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      purchase: {
        id: pendingPurchase.id,
        voucher_id: pendingPurchase.voucher_id,
        payment_reference: pendingPurchase.payment_reference,
        amount: Number(pendingPurchase.amount),
        status: pendingPurchase.status,
        created_at: pendingPurchase.created_at,
        updated_at: pendingPurchase.updated_at,
      },
    });
  } catch (error) {
    console.error("Error checking pending voucher purchase:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
