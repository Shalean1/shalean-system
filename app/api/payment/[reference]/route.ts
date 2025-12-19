import { NextRequest, NextResponse } from "next/server";

/**
 * API route to fetch payment transaction details from Paystack
 * This allows us to retrieve booking metadata if localStorage is missing data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Fetch transaction details from Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      return NextResponse.json(
        { success: false, message: "Payment transaction not found" },
        { status: 404 }
      );
    }

    const transaction = data.data;
    let metadata = transaction.metadata || {};
    
    // Paystack might store nested objects as JSON strings in metadata
    // Try to parse booking_data if it's a string
    if (metadata.booking_data && typeof metadata.booking_data === 'string') {
      try {
        metadata = {
          ...metadata,
          booking_data: JSON.parse(metadata.booking_data),
        };
      } catch (e) {
        console.error("Error parsing booking_data from metadata:", e);
      }
    }
    
    // Log metadata structure for debugging
    console.log("Paystack transaction metadata structure:", JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      transaction: {
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        metadata: metadata,
      },
    });
  } catch (error) {
    console.error("Error fetching payment transaction:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}









