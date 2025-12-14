import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPayment } from "@/lib/paystack";

/**
 * API route to verify voucher purchase payment and complete the purchase
 * Called from the frontend after Paystack redirects with success parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, voucher_id } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    if (!voucher_id) {
      return NextResponse.json(
        { success: false, message: "Voucher ID is required" },
        { status: 400 }
      );
    }

    // Check if reference is for voucher purchase
    if (!reference.startsWith("voucher-")) {
      return NextResponse.json(
        { success: false, message: "Invalid payment reference" },
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

    // Check if purchase has already been completed
    const { data: pendingPurchase } = await supabase
      .from("pending_voucher_purchases")
      .select("id, voucher_id, status")
      .eq("payment_reference", reference)
      .eq("user_id", user.id)
      .single();

    if (pendingPurchase) {
      if (pendingPurchase.status === "completed") {
        return NextResponse.json({
          success: true,
          message: "Voucher purchase already completed",
          alreadyCompleted: true,
        });
      }
      
      if (pendingPurchase.voucher_id !== voucher_id) {
        return NextResponse.json({
          success: false,
          message: "Voucher ID mismatch",
        });
      }
    }

    // Verify payment with Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { success: false, message: "Payment verification service not configured" },
        { status: 500 }
      );
    }

    const verified = await verifyPayment(reference, secretKey);
    
    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Fetch transaction details from Paystack to verify amount
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment not successful" },
        { status: 400 }
      );
    }

    // Verify the payment was for the correct user
    const customerEmail = paystackData.data.customer?.email || paystackData.data.email;
    if (customerEmail && customerEmail !== user.email) {
      return NextResponse.json(
        { success: false, message: "Payment email does not match user account" },
        { status: 400 }
      );
    }

    // Complete voucher purchase using database function
    const { data: voucherResult, error: voucherError } = await supabase.rpc("purchase_voucher", {
      p_user_id: user.id,
      p_voucher_id: voucher_id,
      p_payment_reference: reference,
    });

    if (voucherError) {
      console.error("Error completing voucher purchase:", voucherError);
      return NextResponse.json(
        { success: false, message: voucherError.message || "Failed to complete voucher purchase" },
        { status: 500 }
      );
    }

    if (!voucherResult || voucherResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to complete voucher purchase" },
        { status: 500 }
      );
    }

    const result = voucherResult[0];
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to complete voucher purchase" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Voucher purchased successfully",
      user_voucher_id: result.user_voucher_id,
    });
  } catch (error) {
    console.error("Error completing voucher purchase:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
