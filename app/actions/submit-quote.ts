"use server";

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
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // TODO: Store in database if needed
    
    // For now, log the submission (in production, this would send an email)
    console.log("Quote Request Received:", {
      ...data,
      submittedAt: new Date().toISOString(),
    });

    // Simulate email sending
    // In production, replace this with actual email service:
    // await sendEmail({
    //   to: 'support@shalean.com',
    //   subject: `New Quote Request from ${data.firstName} ${data.lastName}`,
    //   body: formatQuoteEmail(data),
    // });

    return {
      success: true,
      message: "Quote request submitted successfully! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error submitting quote:", error);
    return {
      success: false,
      message: "An error occurred while submitting your quote. Please try again.",
    };
  }
}
