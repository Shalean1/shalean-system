"use server";

import { sendQuoteEmail, sendCustomerConfirmationEmail } from "@/lib/email";

export interface QuoteFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  customLocation?: string;
  service: string | null;
  bedrooms: number;
  bathrooms: number;
  additionalServices: string[];
  note?: string;
}

export interface SubmitQuoteResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitQuote(
  data: QuoteFormData
): Promise<SubmitQuoteResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = "Last name is required";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.location = "Location is required";
  }

  if (data.location === "other" && (!data.customLocation || data.customLocation.trim().length === 0)) {
    errors.customLocation = "Please specify your location";
  }

  if (!data.service) {
    errors.service = "Please select a service";
  }

  if (data.bedrooms < 0) {
    errors.bedrooms = "Invalid number of bedrooms";
  }

  if (data.bathrooms < 1) {
    errors.bathrooms = "At least one bathroom is required";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    // Log the submission for debugging
    console.log("Quote Request Received:", {
      ...data,
      submittedAt: new Date().toISOString(),
    });

    // Send notification email to business
    await sendQuoteEmail(data);
    console.log("Business notification email sent successfully");

    // Send confirmation email to customer
    try {
      await sendCustomerConfirmationEmail(data);
      console.log("Customer confirmation email sent successfully");
    } catch (customerEmailError) {
      // Log error but don't fail the entire submission if customer email fails
      console.error("Failed to send customer confirmation email (non-critical):", customerEmailError);
      // Still return success since the business was notified
    }

    return {
      success: true,
      message: "Quote request submitted successfully! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error submitting quote:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    
    // Return more specific error message to help with debugging
    return {
      success: false,
      message: errorMessage.includes("RESEND_API_KEY") 
        ? "Email service is not configured. Please contact support."
        : `An error occurred: ${errorMessage}`,
    };
  }
}
