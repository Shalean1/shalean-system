"use server";

import { createClient } from "@/lib/supabase/server";
import { CreditTransaction, mapDatabaseToCreditTransaction } from "@/lib/storage/credits-supabase";
import { EFTPaymentSubmission } from "@/lib/storage/eft-supabase";
import { submitEFTPayment, verifyEFTPayment, getUserEFTSubmissions } from "@/lib/storage/eft-supabase";

export interface CreditActionResult {
  success: boolean;
  error?: string;
  balance?: number;
  transactionId?: string;
}

export interface GetCreditTransactionsResult {
  success: boolean;
  error?: string;
  transactions?: CreditTransaction[];
}

export interface CreditPurchaseInitResult {
  success: boolean;
  message?: string;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
}

export interface GetCreditBalanceResult {
  success: boolean;
  error?: string;
  balance?: number;
}

export interface EFTPaymentResult {
  success: boolean;
  error?: string;
  submissionId?: string;
}

export interface GetEFTSubmissionsResult {
  success: boolean;
  error?: string;
  submissions?: EFTPaymentSubmission[];
}

export interface VerifyEFTPaymentResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Get credit transactions for the current user
 */
export async function getCreditTransactionsAction(
  limit: number = 50
): Promise<GetCreditTransactionsResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view transactions",
      };
    }

    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch credit transactions:", error);
      return {
        success: false,
        error: `Failed to fetch transactions: ${error.message}`,
      };
    }

    const transactions = (data || []).map(mapDatabaseToCreditTransaction);

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching credit transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

/**
 * Use credits for a booking
 */
export async function useCreditsForBooking(
  amount: number,
  bookingReference: string
): Promise<CreditActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to use credits",
      };
    }

    // Get balance BEFORE updating to ensure accurate transaction record
    const { data: balanceBeforeData, error: balanceBeforeError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const balanceBefore = balanceBeforeError || !balanceBeforeData 
      ? 0 
      : parseFloat(balanceBeforeData.balance || "0");

    // Call the database function to update balance atomically
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      "update_credit_balance",
      {
        p_user_id: user.id,
        p_amount: amount,
        p_transaction_type: "usage",
      }
    );

    if (balanceError) {
      console.error("Failed to update credit balance:", balanceError);
      return {
        success: false,
        error: balanceError.message || "Failed to use credits",
      };
    }

    const newBalance = balanceData as number;
    
    // Verify the balance was actually updated correctly
    if (Math.abs(newBalance - (balanceBefore - amount)) > 0.01) {
      console.error(
        `Balance mismatch: expected ${balanceBefore - amount}, got ${newBalance}. ` +
        `This may indicate a race condition or concurrent transaction.`
      );
    }

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "usage",
        amount: amount,
        balance_before: balanceBefore, // Use the actual balance before deduction
        balance_after: newBalance,
        payment_reference: bookingReference,
        status: "completed",
        metadata: {
          booking_reference: bookingReference,
          type: "booking_payment",
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      // Balance was already updated, so we still return success
      return {
        success: true,
        balance: newBalance,
      };
    }

    return {
      success: true,
      balance: newBalance,
      transactionId: transactionData.id,
    };
  } catch (error) {
    console.error("Error using credits for booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to use credits",
    };
  }
}

/**
 * Add credits after payment
 * For Paystack (card) payments: status is "completed" and balance is updated immediately
 * For EFT payments: status is "pending" initially, balance is updated when admin approves
 */
export async function addCreditsAfterPayment(
  userId: string,
  amount: number,
  paymentMethod: "card" | "eft",
  paymentReference: string,
  metadata?: Record<string, any>,
  status: "pending" | "completed" = "completed"
): Promise<CreditActionResult> {
  try {
    const supabase = await createClient();

    // Get balance BEFORE updating to ensure accurate transaction record
    const { data: balanceBeforeData, error: balanceBeforeError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const balanceBefore = balanceBeforeError || !balanceBeforeData 
      ? 0 
      : parseFloat(balanceBeforeData.balance || "0");

    let newBalance = balanceBefore;
    
    // Only update balance if status is "completed"
    // For EFT payments with "pending" status, balance will be updated when admin approves
    if (status === "completed") {
      // Call the database function to update balance atomically
      const { data: balanceData, error: balanceError } = await supabase.rpc(
        "update_credit_balance",
        {
          p_user_id: userId,
          p_amount: amount,
          p_transaction_type: "purchase",
        }
      );

      if (balanceError) {
        console.error("Failed to update credit balance:", balanceError);
        return {
          success: false,
          error: balanceError.message || "Failed to add credits",
        };
      }

      newBalance = balanceData as number;
      
      // Verify the balance was actually updated correctly
      if (Math.abs(newBalance - (balanceBefore + amount)) > 0.01) {
        console.error(
          `Balance mismatch: expected ${balanceBefore + amount}, got ${newBalance}. ` +
          `This may indicate a race condition or concurrent transaction.`
        );
      }
    } else {
      // For pending transactions, balance_after should equal balance_before
      newBalance = balanceBefore;
    }

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        transaction_type: "purchase",
        amount: amount,
        balance_before: balanceBefore,
        balance_after: newBalance,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        status: status,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      // If status was completed, balance was already updated, so we still return success
      if (status === "completed") {
        return {
          success: true,
          balance: newBalance,
        };
      }
      return {
        success: false,
        error: transactionError.message || "Failed to create transaction",
      };
    }

    return {
      success: true,
      balance: newBalance,
      transactionId: transactionData.id,
    };
  } catch (error) {
    console.error("Error adding credits after payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add credits",
    };
  }
}

/**
 * Initialize credit purchase payment
 */
export async function initializeCreditPurchase(
  amount: number
): Promise<CreditPurchaseInitResult> {
  try {
    if (!process.env.PAYSTACK_PUBLIC_KEY) {
      return {
        success: false,
        message: "Payment gateway is not configured",
      };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        success: false,
        message: "User must be logged in to purchase credits",
      };
    }

    // Validate amount
    if (amount < 20 || amount > 5000) {
      return {
        success: false,
        message: "Amount must be between R20 and R5000",
      };
    }

    // Generate payment reference
    const reference = `credit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    const amountInCents = amount * 100;

    return {
      success: true,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      amount: amountInCents,
      email: user.email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing credit purchase:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}

/**
 * Get user credit balance
 */
export async function getUserCreditBalanceAction(): Promise<GetCreditBalanceResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view balance",
      };
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no record exists, return 0 balance
      if (error.code === "PGRST116") {
        return {
          success: true,
          balance: 0,
        };
      }
      console.error("Failed to fetch credit balance:", error);
      return {
        success: false,
        error: `Failed to fetch balance: ${error.message}`,
      };
    }

    return {
      success: true,
      balance: parseFloat(data.balance || "0"),
    };
  } catch (error) {
    console.error("Error fetching credit balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch balance",
    };
  }
}

/**
 * Submit EFT payment for credit purchase
 * Creates a pending credit transaction that requires admin approval
 */
export async function submitEFTPaymentAction(
  amount: number,
  referenceNumber: string,
  proofUrl?: string
): Promise<EFTPaymentResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to submit EFT payment",
      };
    }

    // Validate amount
    if (amount < 20 || amount > 5000) {
      return {
        success: false,
        error: "Amount must be between R20 and R5000",
      };
    }

    // Submit EFT payment
    const result = await submitEFTPayment(
      user.id,
      amount,
      referenceNumber,
      proofUrl
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to submit EFT payment",
      };
    }

    // Create pending credit transaction (balance will be updated when admin approves)
    const creditsResult = await addCreditsAfterPayment(
      user.id,
      amount,
      "eft",
      referenceNumber,
      {
        type: "eft_credit_purchase",
        eft_submission_id: result.submissionId,
      },
      "pending" // Create as pending - admin needs to approve
    );

    if (!creditsResult.success) {
      console.error("Failed to create pending credit transaction:", creditsResult.error);
      // EFT submission was created, but transaction creation failed
      // This is not ideal, but we'll still return success for the submission
      // Admin can manually create the transaction if needed
    }

    return {
      success: true,
      submissionId: result.submissionId,
    };
  } catch (error) {
    console.error("Error submitting EFT payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit EFT payment",
    };
  }
}

/**
 * Get EFT payment submissions for current user
 */
export async function getEFTSubmissionsAction(): Promise<GetEFTSubmissionsResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view EFT submissions",
      };
    }

    const submissions = await getUserEFTSubmissions();

    return {
      success: true,
      submissions,
    };
  } catch (error) {
    console.error("Error fetching EFT submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch EFT submissions",
    };
  }
}

/**
 * Verify EFT payment (admin action)
 */
export async function verifyEFTPaymentAction(
  submissionId: string,
  approved: boolean,
  rejectionReason?: string
): Promise<VerifyEFTPaymentResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in",
      };
    }

    // Fetch submission details BEFORE verification to ensure we have the data
    // This prevents issues where verification succeeds but we can't fetch the data afterward
    const { data: submissionData, error: submissionError } = await supabase
      .from("eft_payment_submissions")
      .select("user_id, amount, reference_number, status")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submissionData) {
      return {
        success: false,
        error: submissionError?.message || "Failed to fetch EFT submission details",
      };
    }

    // Check if already processed
    if (submissionData.status !== "pending") {
      return {
        success: false,
        error: `Submission already ${submissionData.status}`,
      };
    }

    // Verify the EFT payment
    const verifyResult = await verifyEFTPayment(
      submissionId,
      user.id,
      approved,
      rejectionReason
    );

    if (!verifyResult.success) {
      return {
        success: false,
        error: verifyResult.error || "Failed to verify EFT payment",
      };
    }

    // If approved, update pending transaction to completed and allocate credits
    if (approved) {
      // Find the pending transaction for this EFT submission
      const { data: pendingTransaction, error: transactionError } = await supabase
        .from("credit_transactions")
        .select("id, balance_before, amount")
        .eq("user_id", submissionData.user_id)
        .eq("payment_reference", submissionData.reference_number)
        .eq("payment_method", "eft")
        .eq("status", "pending")
        .eq("transaction_type", "purchase")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (transactionError || !pendingTransaction) {
        console.error("Pending transaction not found for EFT approval:", transactionError);
        // Fallback: create a new completed transaction
        const creditsResult = await addCreditsAfterPayment(
          submissionData.user_id,
          parseFloat(submissionData.amount),
          "eft",
          submissionData.reference_number,
          {
            type: "eft_credit_purchase",
            eft_submission_id: submissionId,
          },
          "completed"
        );

        if (!creditsResult.success) {
          console.error("Failed to add credits after EFT verification:", creditsResult.error);
          return {
            success: false,
            error: creditsResult.error || "Failed to add credits",
          };
        }
      } else {
        // Update the pending transaction to completed and update balance
        const balanceBefore = parseFloat(pendingTransaction.balance_before || "0");
        const amount = parseFloat(pendingTransaction.amount || submissionData.amount);
        
        // Update balance atomically
        const { data: balanceData, error: balanceError } = await supabase.rpc(
          "update_credit_balance",
          {
            p_user_id: submissionData.user_id,
            p_amount: amount,
            p_transaction_type: "purchase",
          }
        );

        if (balanceError) {
          console.error("Failed to update credit balance:", balanceError);
          return {
            success: false,
            error: balanceError.message || "Failed to update balance",
          };
        }

        const newBalance = balanceData as number;

        // Update transaction status to completed
        const { error: updateError } = await supabase
          .from("credit_transactions")
          .update({
            status: "completed",
            balance_after: newBalance,
            metadata: {
              type: "eft_credit_purchase",
              eft_submission_id: submissionId,
              approved_at: new Date().toISOString(),
            },
          })
          .eq("id", pendingTransaction.id);

        if (updateError) {
          console.error("Failed to update transaction status:", updateError);
          // Balance was already updated, so we still return success
        }
      }
    }

    return {
      success: true,
      message: approved
        ? "EFT payment verified and credits added"
        : "EFT payment rejected",
    };
  } catch (error) {
    console.error("Error verifying EFT payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify EFT payment",
    };
  }
}
