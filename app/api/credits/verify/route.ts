import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCreditsAfterPayment } from "@/app/actions/credits";
import { verifyPayment } from "@/lib/paystack";

/**
 * API route to verify credit purchase payment and allocate credits
 * Called from the frontend after Paystack redirects with success parameters
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

    // Check if reference is for credit purchase
    if (!reference.startsWith("credit-")) {
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

    // Check if credits have already been allocated for this reference
    const { data: existingTransaction } = await supabase
      .from("credit_transactions")
      .select("id, status")
      .eq("payment_reference", reference)
      .eq("user_id", user.id)
      .single();

    if (existingTransaction) {
      if (existingTransaction.status === "completed") {
        return NextResponse.json({
          success: true,
          message: "Credits already allocated",
          alreadyAllocated: true,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Transaction exists but is not completed",
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

    // Fetch transaction details from Paystack to get the amount
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

    // Get amount from transaction (convert from cents to Rands)
    const amount = paystackData.data.amount ? paystackData.data.amount / 100 : 0;

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount" },
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

    // Add credits
    const creditsResult = await addCreditsAfterPayment(
      user.id,
      amount,
      "card",
      reference,
      {
        type: "credit_purchase",
        amount: amount,
        paystack_reference: reference,
        verified_at: new Date().toISOString(),
      }
    );

    if (creditsResult.success) {
      return NextResponse.json({
        success: true,
        message: "Credits allocated successfully",
        balance: creditsResult.balance,
        amount: amount,
      });
    } else {
      console.error("Failed to add credits:", creditsResult.error);
      return NextResponse.json(
        { success: false, message: creditsResult.error || "Failed to add credits" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying credit payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}























