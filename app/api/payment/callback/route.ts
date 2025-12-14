import { NextRequest, NextResponse } from "next/server";
import { submitBooking } from "@/app/actions/submit-booking";
import { updateRebookedBookingPayment } from "@/app/actions/rebook-payment";
import { addCreditsAfterPayment } from "@/app/actions/credits";
import { BookingFormData } from "@/lib/types/booking";
import { verifyWebhookSignature, verifyPayment } from "@/lib/paystack";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Paystack webhook handler for payment verification
 * This endpoint handles Paystack webhook events and creates bookings when payment is successful
 * 
 * Webhook URL: https://yourdomain.com/api/payment/callback
 * Configure this URL in your Paystack dashboard under Settings > Webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature for security
    const signature = request.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { success: false, message: "Webhook secret key not configured" },
        { status: 500 }
      );
    }

    // Verify signature if provided (Paystack always sends it for webhooks)
    if (signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, secretKey);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody);
    
    // Paystack sends events like: charge.success, charge.failed, etc.
    // We're interested in charge.success events
    if (event.event === "charge.success" && event.data) {
      const transaction = event.data;
      const reference = transaction.reference;
      const metadata = transaction.metadata || {};

      // Verify payment status
      if (transaction.status === "success" && reference) {
        // Double verify payment with Paystack API
        const verified = await verifyPayment(reference, secretKey);
        
        if (!verified) {
          console.error("Payment verification failed for reference:", reference);
          return NextResponse.json(
            { success: false, message: "Payment verification failed" },
            { status: 400 }
          );
        }

        // Check if this is a voucher purchase (reference starts with "voucher-")
        const isVoucherPurchase = reference.startsWith("voucher-");

        if (isVoucherPurchase) {
          // Get pending purchase record using service role client (webhooks don't have user context)
          const supabase = createServiceRoleClient();
          const { data: pendingPurchase, error: pendingError } = await supabase
            .from("pending_voucher_purchases")
            .select("user_id, voucher_id, amount")
            .eq("payment_reference", reference)
            .eq("status", "pending")
            .single();

          if (pendingError || !pendingPurchase) {
            console.error("Pending voucher purchase not found:", reference, pendingError);
            return NextResponse.json(
              { success: false, message: "Pending purchase not found" },
              { status: 400 }
            );
          }

          // Complete voucher purchase using database function directly
          // Use service role client since webhooks don't have user authentication
          const { data: voucherResult, error: voucherError } = await supabase.rpc("purchase_voucher", {
            p_user_id: pendingPurchase.user_id,
            p_voucher_id: pendingPurchase.voucher_id,
            p_payment_reference: reference,
          });

          if (voucherError) {
            console.error("Error completing voucher purchase:", voucherError);
            return NextResponse.json(
              { success: false, message: voucherError.message || "Failed to complete voucher purchase" },
              { status: 400 }
            );
          }

          if (!voucherResult || voucherResult.length === 0 || !voucherResult[0].success) {
            console.error("Failed to complete voucher purchase:", voucherResult?.[0]?.message || "Unknown error");
            return NextResponse.json(
              { success: false, message: voucherResult?.[0]?.message || "Failed to complete voucher purchase" },
              { status: 400 }
            );
          }

          console.log("Voucher purchased successfully via webhook:", reference, voucherResult[0]);
          return NextResponse.json({
            success: true,
            message: "Voucher purchase confirmed",
            reference: reference,
          });
        }

        // Check if this is a credit purchase
        const isCreditPurchase = metadata.type === "credit_purchase";
        
        if (isCreditPurchase) {
          // Get user ID from customer email
          const customerEmail = transaction.customer?.email || transaction.email;
          if (!customerEmail) {
            console.error("Customer email not found in transaction for credit purchase:", reference);
            return NextResponse.json(
              { success: false, message: "Customer email not found" },
              { status: 400 }
            );
          }

          const supabase = await createClient();
          
          // Try to find user by email in auth.users
          // Note: This requires admin access, so we'll use a different approach
          // Get user from profiles table first
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", customerEmail)
            .single();

          let userId: string | null = profileData?.id || null;

          // If not found in profiles, try to get from auth.users via admin API
          // For now, we'll log and handle gracefully
          if (!userId) {
            console.warn("User not found in profiles for email:", customerEmail);
            // In production, you might want to use Supabase Admin API here
            // For now, we'll return an error and handle it manually
            return NextResponse.json(
              { success: false, message: "User account not found. Please contact support." },
              { status: 400 }
            );
          }

          // Get amount from transaction (convert from cents to Rands)
          const amount = transaction.amount ? transaction.amount / 100 : 0;

          // Add credits
          const creditsResult = await addCreditsAfterPayment(
            userId,
            amount,
            "card",
            reference,
            {
              type: "credit_purchase",
              amount: amount,
              paystack_reference: reference,
            }
          );

          if (creditsResult.success) {
            console.log("Credits added successfully via webhook:", reference);
            return NextResponse.json({
              success: true,
              message: "Credit purchase confirmed",
              reference: reference,
            });
          } else {
            console.error("Failed to add credits:", creditsResult.error);
            return NextResponse.json(
              { success: false, message: creditsResult.error || "Failed to add credits" },
              { status: 400 }
            );
          }
        }

        // Check if this is a rebook payment (has booking_reference in metadata)
        const bookingReference = metadata.booking_reference as string | undefined;

        if (bookingReference) {
          // This is a rebook payment - update existing booking
          const result = await updateRebookedBookingPayment(bookingReference, reference);

          if (result.success) {
            console.log("Rebook payment updated successfully via webhook:", bookingReference);
            return NextResponse.json({
              success: true,
              message: "Rebook payment confirmed",
              bookingReference: result.bookingReference,
            });
          } else {
            console.error("Failed to update rebook payment:", result.message);
            return NextResponse.json(
              { success: false, message: result.message || "Failed to update rebook payment" },
              { status: 400 }
            );
          }
        }

        // Extract booking data from metadata (for new bookings)
        const bookingData = metadata.booking_data as BookingFormData | undefined;

        if (bookingData) {
          // Submit booking with payment reference
          // Note: Referral rewards will be processed automatically in submitBooking
          const result = await submitBooking(bookingData, reference);

          if (result.success) {
            console.log("Booking created successfully via webhook:", result.bookingReference);
            return NextResponse.json({
              success: true,
              message: "Booking confirmed",
              bookingReference: result.bookingReference,
            });
          } else {
            console.error("Failed to create booking:", result.message);
            return NextResponse.json(
              { success: false, message: result.message || "Failed to create booking" },
              { status: 400 }
            );
          }
        } else {
          console.error("Payment type not identified for reference:", reference);
          return NextResponse.json(
            { success: false, message: "Payment type not identified" },
            { status: 400 }
          );
        }
      }
    }

    // For other events or if payment wasn't successful, return success to acknowledge receipt
    // Paystack expects a 200 response for all webhook events
    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
