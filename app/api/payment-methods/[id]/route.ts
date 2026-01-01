import { NextRequest, NextResponse } from "next/server";
import { updatePaymentMethod, deletePaymentMethod } from "@/lib/storage/payment-methods-supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const paymentMethod = await updatePaymentMethod(id, body);
    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePaymentMethod(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

























