import { Resend } from "resend";
import { Booking } from "./types/booking";
import { getServiceName, getFrequencyName, formatPrice, calculatePrice } from "./pricing";
import { fetchPricingConfig } from "./pricing-server";
import { validateDiscountCode } from "../app/actions/discount";

export interface QuoteEmailData {
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

const serviceNames: Record<string, string> = {
  "standard-cleaning": "Standard Cleaning",
  "deep-cleaning": "Deep Cleaning",
  "moving-cleaning": "Moving Cleaning",
  "airbnb-cleaning": "Airbnb Cleaning",
};

const additionalServiceNames: Record<string, string> = {
  "inside-fridge": "Inside Fridge",
  "inside-oven": "Inside Oven",
  "inside-cabinets": "Inside Cabinets",
  "interior-windows": "Interior Windows",
  "interior-walls": "Interior Walls",
  "ironing": "Ironing",
  "laundry": "Laundry",
};

/**
 * Validate Resend API key format
 */
function validateApiKey(apiKey: string | undefined): void {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured in environment variables");
  }
  
  // Resend API keys typically start with "re_" and are around 40+ characters
  if (!apiKey.startsWith("re_")) {
    console.warn("Warning: RESEND_API_KEY doesn't start with 're_'. This might indicate an invalid API key format.");
  }
  
  if (apiKey.length < 20) {
    console.warn("Warning: RESEND_API_KEY seems too short. Valid Resend API keys are typically 40+ characters.");
  }
}

/**
 * Validate and get the from email address
 */
function getFromEmail(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "bookings@bokkiecleaning.co.za";
  
  // Prevent using Resend's test email
  if (fromEmail.includes("onboarding@resend.dev") || fromEmail.includes("delivered@resend.dev")) {
    throw new Error(
      `Invalid from email: "${fromEmail}". You cannot use Resend's test email addresses.\n` +
      `Please set RESEND_FROM_EMAIL to an email from your verified domain (e.g., bookings@bokkiecleaning.co.za).\n` +
      `Make sure your domain is verified in Resend dashboard: https://resend.com/domains`
    );
  }
  
  // Warn if using a non-verified domain email
  const domain = fromEmail.split('@')[1];
  if (!domain || domain === 'resend.dev' || domain === 'example.com') {
    console.warn(`Warning: From email "${fromEmail}" may not be from a verified domain. Ensure "${domain}" is verified in Resend.`);
  }
  
  return fromEmail;
}

/**
 * Helper function to handle Resend API errors with better diagnostics
 */
function handleResendError(error: any, context: string): Error {
  // Check for validation errors about test emails or unverified domains
  const isValidationError = 
    error?.name === "validation_error" ||
    error?.message?.toLowerCase().includes("testing emails") ||
    error?.message?.toLowerCase().includes("verify a domain") ||
    error?.message?.toLowerCase().includes("onboarding@resend.dev");
  
  if (isValidationError) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "bookings@bokkiecleaning.co.za";
    const domain = fromEmail.split('@')[1] || "unknown";
    
    console.error("Resend Domain Verification Error:", {
      context,
      fromEmail,
      domain,
      errorMessage: error?.message,
      errorDetails: JSON.stringify(error, null, 2),
    });

    return new Error(
      `Resend validation error: ${error?.message || JSON.stringify(error)}\n\n` +
      `This error means your domain "${domain}" is not verified in Resend.\n\n` +
      `To fix this:\n` +
      `1. Go to https://resend.com/domains\n` +
      `2. Verify your domain "${domain}" by adding the required DNS records\n` +
      `3. Wait for verification (can take up to 48 hours)\n` +
      `4. Once verified, ensure RESEND_FROM_EMAIL is set to an email from this domain\n` +
      `5. Restart your application\n\n` +
      `Current from email: ${fromEmail}`
    );
  }

  // Check if it's a 403 Forbidden error
  const is403Error = 
    error?.status === 403 || 
    error?.statusCode === 403 ||
    error?.message?.includes("403") || 
    error?.message?.toLowerCase().includes("forbidden") ||
    (typeof error === 'string' && error.includes("403"));
  
  if (is403Error) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = getFromEmail();
    const domain = fromEmail.split('@')[1] || "unknown";
    
    console.error("Resend 403 Forbidden Error Details:", {
      context,
      fromEmail,
      domain,
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10),
      apiKeyLength: apiKey?.length,
      apiKeyFormat: apiKey?.startsWith("re_") ? "valid format" : "invalid format",
      errorMessage: error?.message,
      errorStatus: error?.status || error?.statusCode,
      errorDetails: JSON.stringify(error, null, 2),
    });

    return new Error(
      `Resend API returned 403 Forbidden. This usually means:\n` +
      `1. Invalid or expired API key - Check your RESEND_API_KEY in environment variables\n` +
      `2. Domain not verified - Verify the domain "${domain}" in Resend dashboard\n` +
      `3. From email not allowed - Ensure "${fromEmail}" is from a verified domain\n` +
      `4. API key permissions - Ensure your API key has permission to send emails\n\n` +
      `Please check:\n` +
      `- Resend Dashboard: https://resend.com/domains (verify domain status)\n` +
      `- Resend API Keys: https://resend.com/api-keys (verify API key is active)\n` +
      `- Environment variables: Ensure RESEND_API_KEY is set correctly\n\n` +
      `Original error: ${error?.message || JSON.stringify(error)}`
    );
  }

  // For other errors, return a generic error
  return new Error(
    `Failed to send email (${context}): ${error?.message || JSON.stringify(error)}`
  );
}

function formatQuoteEmail(data: QuoteEmailData): string {
  const serviceName = data.service ? serviceNames[data.service] || data.service : "Not specified";
  const location = data.location === "other" 
    ? (data.customLocation || "Not specified")
    : data.location;
  
  const additionalServicesList = data.additionalServices.length > 0
    ? data.additionalServices
        .map(id => additionalServiceNames[id] || id)
        .join(", ")
    : "None";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Quote Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Quote Request</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #0C53ED; margin-top: 0;">Contact Information</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Service Details</h2>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Bedrooms:</strong> ${data.bedrooms}</p>
          <p><strong>Bathrooms:</strong> ${data.bathrooms}</p>
          
          ${data.additionalServices.length > 0 ? `
          <h2 style="color: #0C53ED; margin-top: 30px;">Additional Services</h2>
          <p>${additionalServicesList}</p>
          ` : ''}
          
          ${data.note && data.note.trim() ? `
          <h2 style="color: #0C53ED; margin-top: 30px;">Additional Notes</h2>
          <p style="white-space: pre-wrap;">${data.note}</p>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              This quote request was submitted from the Bokkie Cleaning Services website.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatCustomerConfirmationEmail(data: QuoteEmailData): string {
  const serviceName = data.service ? serviceNames[data.service] || data.service : "Not specified";
  const location = data.location === "other" 
    ? (data.customLocation || "Not specified")
    : data.location;
  
  const additionalServicesList = data.additionalServices.length > 0
    ? data.additionalServices
        .map(id => additionalServiceNames[id] || id)
        .join(", ")
    : "None";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Request Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Thank You for Your Quote Request!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p>Dear ${data.firstName},</p>
          
          <p>Thank you for requesting a quote from Bokkie Cleaning Services. We have received your request and will get back to you shortly.</p>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Your Quote Request Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Bedrooms:</strong> ${data.bedrooms}</p>
            <p><strong>Bathrooms:</strong> ${data.bathrooms}</p>
            ${data.additionalServices.length > 0 ? `<p><strong>Additional Services:</strong> ${additionalServicesList}</p>` : ''}
            ${data.note && data.note.trim() ? `<p><strong>Notes:</strong><br><span style="white-space: pre-wrap;">${data.note}</span></p>` : ''}
          </div>
          
          <p>Our team will review your request and contact you at <strong>${data.email}</strong> or <strong>${data.phone}</strong> within 24 hours.</p>
          
          <p>If you have any questions in the meantime, please don't hesitate to reach out to us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>The Bokkie Cleaning Services Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendQuoteEmail(data: QuoteEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Validate API key format
  validateApiKey(process.env.RESEND_API_KEY);

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Get and validate from email
  const fromEmail = getFromEmail();
  
  // Always send business notifications to the configured business email
  const toEmail = process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za";

  console.log("Sending notification email to business:", {
    from: fromEmail,
    to: toEmail,
    customerEmail: data.email,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `New Quote Request from ${data.firstName} ${data.lastName}`,
      html: formatQuoteEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendQuoteEmail");
    }

    console.log("Notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending notification email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendQuoteEmail");
  }
}

export async function sendCustomerConfirmationEmail(data: QuoteEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use verified domain email - bookings@bokkiecleaning.co.za is the verified sender
  const fromEmail = getFromEmail();
  
  // Always send to customer's actual email address (domain is verified)
  const toEmail = data.email;

  console.log("Sending confirmation email to customer:", {
    from: fromEmail,
    to: toEmail,
    originalCustomerEmail: data.email,
    customerName: `${data.firstName} ${data.lastName}`,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Quote Request Confirmation - Bokkie Cleaning Services`,
      html: formatCustomerConfirmationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendCustomerConfirmationEmail");
    }

    console.log("Confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending confirmation email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendCustomerConfirmationEmail");
  }
}

// Booking email templates
async function formatBookingConfirmationEmail(booking: Booking): Promise<string> {
  const serviceName = getServiceName(booking.service);
  const frequencyName = getFrequencyName(booking.frequency);
  const address = `${booking.streetAddress}${booking.aptUnit ? `, ${booking.aptUnit}` : ""}, ${booking.suburb}, ${booking.city}`;
  
  const extrasNames: Record<string, string> = {
    "inside-fridge": "Inside Fridge",
    "inside-oven": "Inside Oven",
    "inside-cabinets": "Inside Cabinets",
    "interior-windows": "Interior Windows",
    "interior-walls": "Interior Walls",
    "laundry": "Laundry & Ironing",
    "ironing": "Laundry & Ironing",
  };
  
  const extrasList = booking.extras.length > 0
    ? booking.extras.map(id => extrasNames[id] || id).join(", ")
    : "None";

  const scheduledDate = booking.scheduledDate 
    ? new Date(booking.scheduledDate).toLocaleDateString("en-ZA", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : "Not scheduled";
  
  const scheduledTime = booking.scheduledTime || "Not specified";

  // Calculate price breakdown to get discount information
  let priceBreakdown = null;
  try {
    const pricingConfig = await fetchPricingConfig();
    const initialPriceBreakdown = calculatePrice(booking, pricingConfig, 0);
    
    // Validate and apply discount code if provided
    let discountCodeAmount = 0;
    if (booking.discountCode && booking.discountCode.trim()) {
      try {
        const discountResult = await validateDiscountCode(
          booking.discountCode.trim(),
          initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
        );
        if (discountResult.success) {
          discountCodeAmount = discountResult.discountAmount;
        }
      } catch (error) {
        console.error("Error validating discount code in email:", error);
      }
    }
    
    priceBreakdown = calculatePrice(booking, pricingConfig, discountCodeAmount);
  } catch (error) {
    console.error("Error calculating price breakdown in email:", error);
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${booking.bookingReference}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p>Dear ${booking.firstName},</p>
          
          <p>Thank you for booking with Bokkie Cleaning Services! Your booking has been confirmed and payment has been received.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0C53ED;">
            <h2 style="color: #0C53ED; margin-top: 0;">Booking Reference: ${booking.bookingReference}</h2>
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Service Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Frequency:</strong> ${frequencyName}</p>
            <p><strong>Bedrooms:</strong> ${booking.bedrooms}</p>
            <p><strong>Bathrooms:</strong> ${booking.bathrooms}</p>
            ${extrasList !== "None" ? `<p><strong>Additional Services:</strong> ${extrasList}</p>` : ''}
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Schedule</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Date:</strong> ${scheduledDate}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Service Address</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p>${address}</p>
          </div>
          
          ${booking.specialInstructions ? `
          <h2 style="color: #0C53ED; margin-top: 30px;">Special Instructions</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="white-space: pre-wrap;">${booking.specialInstructions}</p>
          </div>
          ` : ''}
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Payment Summary</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Total Amount Paid:</strong> ${formatPrice(booking.totalAmount)}</p>
            ${booking.paymentReference ? `<p><strong>Payment Reference:</strong> ${booking.paymentReference}</p>` : ''}
            <p style="color: #3b82f6; font-weight: bold;">✓ Payment Confirmed</p>
            ${priceBreakdown && (priceBreakdown.frequencyDiscount > 0 || priceBreakdown.discountCodeDiscount > 0) ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
              <p style="margin-bottom: 10px;"><strong>Discounts Applied:</strong></p>
              ${priceBreakdown.frequencyDiscount > 0 ? `
              <div style="margin-bottom: 8px;">
                <p style="margin: 0;">
                  <span>${frequencyName} Discount:</span>
                  <span style="color: #3b82f6; font-weight: bold; margin-left: 10px;">-${formatPrice(priceBreakdown.frequencyDiscount)}</span>
                </p>
                <p style="color: #3b82f6; font-size: 12px; margin: 5px 0 0 0;">✓ Frequency Discount Applied</p>
              </div>
              ` : ''}
              ${priceBreakdown.discountCodeDiscount > 0 ? `
              <div>
                <p style="margin: 0;">
                  <span>Discount Code ${booking.discountCode ? `(${booking.discountCode.toUpperCase()})` : ''}:</span>
                  <span style="color: #3b82f6; font-weight: bold; margin-left: 10px;">-${formatPrice(priceBreakdown.discountCodeDiscount)}</span>
                </p>
                <p style="color: #3b82f6; font-size: 12px; margin: 5px 0 0 0;">✓ Discount Code Applied</p>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-radius: 5px; border-left: 4px solid #0C53ED;">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 5px 0 0 0;">Our team will contact you before your scheduled service date to confirm details and answer any questions.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              If you have any questions or need to make changes to your booking, please contact us at:<br>
              <strong>Email:</strong> info@bokkiecleaning.co.za<br>
              <strong>Phone:</strong> +27 12 345 6789
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Bokkie Cleaning Services Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatBookingNotificationEmail(booking: Booking): string {
  const serviceName = getServiceName(booking.service);
  const frequencyName = getFrequencyName(booking.frequency);
  const address = `${booking.streetAddress}${booking.aptUnit ? `, ${booking.aptUnit}` : ""}, ${booking.suburb}, ${booking.city}`;
  
  const extrasNames: Record<string, string> = {
    "inside-fridge": "Inside Fridge",
    "inside-oven": "Inside Oven",
    "inside-cabinets": "Inside Cabinets",
    "interior-windows": "Interior Windows",
    "interior-walls": "Interior Walls",
    "laundry": "Laundry & Ironing",
    "ironing": "Laundry & Ironing",
  };
  
  const extrasList = booking.extras.length > 0
    ? booking.extras.map(id => extrasNames[id] || id).join(", ")
    : "None";

  const scheduledDate = booking.scheduledDate 
    ? new Date(booking.scheduledDate).toLocaleDateString("en-ZA", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : "Not scheduled";
  
  const scheduledTime = booking.scheduledTime || "Not specified";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking - ${booking.bookingReference}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Booking Received</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0C53ED;">
            <h2 style="color: #0C53ED; margin-top: 0;">Booking Reference: ${booking.bookingReference}</h2>
            <p><strong>Total Amount:</strong> ${formatPrice(booking.totalAmount)}</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus === "completed" ? "✓ Paid" : "Pending"}</p>
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 0;">Customer Information</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${booking.email}">${booking.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${booking.phone}">${booking.phone}</a></p>
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Service Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Frequency:</strong> ${frequencyName}</p>
            <p><strong>Bedrooms:</strong> ${booking.bedrooms}</p>
            <p><strong>Bathrooms:</strong> ${booking.bathrooms}</p>
            ${extrasList !== "None" ? `<p><strong>Additional Services:</strong> ${extrasList}</p>` : ''}
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Schedule</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Date:</strong> ${scheduledDate}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
          </div>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Service Address</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p>${address}</p>
          </div>
          
          ${booking.specialInstructions ? `
          <h2 style="color: #0C53ED; margin-top: 30px;">Special Instructions</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="white-space: pre-wrap;">${booking.specialInstructions}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              Booking created: ${new Date(booking.createdAt).toLocaleString("en-ZA")}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendBookingConfirmationEmail(booking: Booking): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // Use verified domain email - bookings@bokkiecleaning.co.za is the verified sender
  const fromEmail = getFromEmail();
  // Always send to customer's actual email address (domain is verified)
  const toEmail = booking.email;

  console.log("Sending booking confirmation email:", {
    from: fromEmail,
    to: toEmail,
    bookingReference: booking.bookingReference,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Booking Confirmation - ${booking.bookingReference} | Bokkie Cleaning Services`,
      html: await formatBookingConfirmationEmail(booking),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendBookingConfirmationEmail");
    }

    console.log("Booking confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending booking confirmation email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendBookingConfirmationEmail");
  }
}

export async function sendBookingNotificationEmail(booking: Booking): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // Get and validate from email
  const fromEmail = getFromEmail();
  // Always send business notifications to the configured business email
  const toEmail = process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za";

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: booking.email,
      subject: `New Booking - ${booking.bookingReference} | ${booking.firstName} ${booking.lastName}`,
      html: formatBookingNotificationEmail(booking),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendBookingNotificationEmail");
    }

    console.log("Booking notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending booking notification email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendBookingNotificationEmail");
  }
}

// Contact form email interfaces and functions
export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

function formatContactEmail(data: ContactEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Contact Form Submission</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #0C53ED; margin-top: 0;">Contact Information</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Message</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p style="white-space: pre-wrap; margin-top: 15px;">${data.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              This contact form submission was received from the Bokkie Cleaning Services dashboard.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatContactConfirmationEmail(data: ContactEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p>Dear ${data.name},</p>
          
          <p>Thank you for reaching out to Bokkie Cleaning Services. We have received your message and will get back to you as soon as possible.</p>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Your Message</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p style="white-space: pre-wrap; margin-top: 15px;">${data.message}</p>
          </div>
          
          <p>Our team typically responds within 24 hours. If your inquiry is urgent, please call us at <strong>+27 87 153 5250</strong>.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-radius: 5px; border-left: 4px solid #0C53ED;">
            <p style="margin: 0;"><strong>Need Immediate Assistance?</strong></p>
            <p style="margin: 5px 0 0 0;">Call us at <strong>+27 72 416 2547</strong> or email us at <strong>info@bokkiecleaning.co.za</strong></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>The Bokkie Cleaning Services Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use verified domain email - bookings@bokkiecleaning.co.za is the verified sender
  const fromEmail = getFromEmail();
  
  // Always send business notifications to the configured business email
  const toEmail = process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za";

  console.log("Sending contact form notification email to business:", {
    from: fromEmail,
    to: toEmail,
    customerEmail: data.email,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: formatContactEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendContactEmail");
    }

    console.log("Contact notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending contact notification email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendContactEmail");
  }
}

export async function sendContactConfirmationEmail(data: ContactEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use verified domain email - bookings@bokkiecleaning.co.za is the verified sender
  const fromEmail = getFromEmail();
  
  // Always send to customer's actual email address (domain is verified)
  const toEmail = data.email;

  console.log("Sending contact confirmation email to customer:", {
    from: fromEmail,
    to: toEmail,
    originalCustomerEmail: data.email,
    customerName: data.name,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `We've Received Your Message - Bokkie Cleaning Services`,
      html: formatContactConfirmationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendContactConfirmationEmail");
    }

    console.log("Contact confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending contact confirmation email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendContactConfirmationEmail");
  }
}

/**
 * Format payment link email for failed payment bookings
 */
async function formatPaymentLinkEmail(booking: Booking): Promise<string> {
  const serviceName = getServiceName(booking.service);
  const frequencyName = getFrequencyName(booking.frequency);
  const address = `${booking.streetAddress}${booking.aptUnit ? `, ${booking.aptUnit}` : ""}, ${booking.suburb}, ${booking.city}`;
  
  // Get base URL from environment or use default
  // Try NEXT_PUBLIC_BASE_URL first, then VERCEL_URL, then default to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  
  const paymentLink = `${baseUrl}/booking/pay/${booking.bookingReference}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Payment - ${booking.bookingReference}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Complete Your Payment</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p>Dear ${booking.firstName},</p>
          
          <p>We noticed that your payment for booking <strong>${booking.bookingReference}</strong> was not completed successfully.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0C53ED;">
            <h2 style="color: #0C53ED; margin-top: 0;">Booking Reference: ${booking.bookingReference}</h2>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Total Amount:</strong> ${formatPrice(booking.totalAmount)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="display: inline-block; background-color: #0C53ED; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Complete Payment Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${paymentLink}" style="color: #0C53ED; word-break: break-all;">${paymentLink}</a>
          </p>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Booking Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Frequency:</strong> ${frequencyName}</p>
            <p><strong>Address:</strong> ${address}</p>
            ${booking.scheduledDate ? `<p><strong>Scheduled Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>` : ''}
            ${booking.scheduledTime ? `<p><strong>Scheduled Time:</strong> ${booking.scheduledTime}</p>` : ''}
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Important:</strong> Please complete your payment to confirm your booking. Your booking will be confirmed once payment is received.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              If you have any questions or need assistance, please contact us at:<br>
              <strong>Email:</strong> info@bokkiecleaning.co.za<br>
              <strong>Phone:</strong> +27 12 345 6789
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Bokkie Cleaning Services Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send payment link email to customer for failed payment
 */
export async function sendPaymentLinkEmail(booking: Booking): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // Use verified domain email - bookings@bokkiecleaning.co.za is the verified sender
  const fromEmail = getFromEmail();
  // Always send to customer's actual email address (domain is verified)
  const toEmail = booking.email;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Complete Your Payment - ${booking.bookingReference} | Bokkie Cleaning Services`,
      html: await formatPaymentLinkEmail(booking),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendPaymentLinkEmail");
    }

    console.log("Payment link email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending payment link email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendPaymentLinkEmail");
  }
}

// Email confirmation interfaces and functions
export interface SignupConfirmationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  confirmationLink: string;
}

function formatSignupConfirmationEmail(data: SignupConfirmationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account - Bokkie Cleaning Services</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Welcome to Bokkie Cleaning Services!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p>Dear ${data.firstName},</p>
          
          <p>Thank you for signing up with Bokkie Cleaning Services! We're excited to have you on board.</p>
          
          <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.confirmationLink}" style="display: inline-block; background-color: #0C53ED; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${data.confirmationLink}" style="color: #0C53ED; word-break: break-all;">${data.confirmationLink}</a>
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Important:</strong> This verification link will expire after 24 hours. If you didn't create an account, please ignore this email.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              If you have any questions, please contact us at:<br>
              <strong>Email:</strong> info@bokkiecleaning.co.za<br>
              <strong>Phone:</strong> +27 87 153 5250
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Bokkie Cleaning Services Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatSignupNotificationEmail(data: SignupConfirmationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Signup - Bokkie Cleaning Services</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0C53ED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New User Signup</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #0C53ED; margin-top: 0;">New Account Created</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Status:</strong> <span style="color: #ffc107; font-weight: bold;">Pending Email Verification</span></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              A new user has signed up and is awaiting email verification. They will be able to access their account once they verify their email address.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email confirmation to user after signup using Resend
 */
export async function sendSignupConfirmationEmail(data: SignupConfirmationEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = getFromEmail();
  const toEmail = data.email;

  console.log("Sending signup confirmation email to user:", {
    from: fromEmail,
    to: toEmail,
    userName: `${data.firstName} ${data.lastName}`,
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Verify Your Account - Bokkie Cleaning Services`,
      html: formatSignupConfirmationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendSignupConfirmationEmail");
    }

    console.log("Signup confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending signup confirmation email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendSignupConfirmationEmail");
  }
}

/**
 * Send notification email to admin about new user signup
 */
export async function sendSignupNotificationEmail(data: SignupConfirmationEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = getFromEmail();
  const toEmail = process.env.RESEND_TO_EMAIL || "info@bokkiecleaning.co.za";

  console.log("Sending signup notification email to admin:", {
    from: fromEmail,
    to: toEmail,
    newUser: `${data.firstName} ${data.lastName} (${data.email})`,
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New User Signup - ${data.firstName} ${data.lastName}`,
      html: formatSignupNotificationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw handleResendError(result.error, "sendSignupNotificationEmail");
    }

    console.log("Signup notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending signup notification email:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleResendError(error, "sendSignupNotificationEmail");
  }
}