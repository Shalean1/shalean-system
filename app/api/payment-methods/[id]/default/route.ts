import { NextRequest, NextResponse } from "next/server";
import { setDefaultPaymentMethod } from "@/lib/storage/payment-methods-supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentMethod = await setDefaultPaymentMethod(id);
    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error setting default payment method:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to set default payment method" },
      { status: 500 }
    );
  }
}













