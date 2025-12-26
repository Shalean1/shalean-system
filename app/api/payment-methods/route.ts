import { NextRequest, NextResponse } from "next/server";
import { createPaymentMethod, getUserPaymentMethods } from "@/lib/storage/payment-methods-supabase";

export async function GET() {
  try {
    const paymentMethods = await getUserPaymentMethods();
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentMethod = await createPaymentMethod(body);
    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create payment method" },
      { status: 500 }
    );
  }
}
























