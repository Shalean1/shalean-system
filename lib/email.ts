import { Resend } from "resend";
import { Booking } from "./types/booking";
import { getServiceName, getFrequencyName, formatPrice, calculatePrice, fetchPricingConfig } from "./pricing";
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
              This quote request was submitted from the Shalean Cleaning Services website.
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
          
          <p>Thank you for requesting a quote from Shalean Cleaning Services. We have received your request and will get back to you shortly.</p>
          
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
              <strong>The Shalean Cleaning Services Team</strong>
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

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  
  // When using Resend testing domain, only send to verified email address
  // Otherwise, use the configured email or default to hello@shalean.com
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain 
    ? "hello@shalean.com" 
    : (process.env.RESEND_TO_EMAIL || "hello@shalean.com");

  console.log("Sending notification email to business:", {
    from: fromEmail,
    to: toEmail,
    customerEmail: data.email,
    isTestingDomain,
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
      throw new Error(`Failed to send notification email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending notification email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send notification email: ${error.message}`);
    }
    throw error;
  }
}

export async function sendCustomerConfirmationEmail(data: QuoteEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  
  // When using Resend testing domain, only send to verified email address
  // Otherwise, send to the customer's email
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain ? "hello@shalean.com" : data.email;

  console.log("Sending confirmation email to customer:", {
    from: fromEmail,
    to: toEmail,
    originalCustomerEmail: data.email,
    isTestingDomain,
    customerName: `${data.firstName} ${data.lastName}`,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Quote Request Confirmation - Shalean Cleaning Services`,
      html: formatCustomerConfirmationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw new Error(`Failed to send confirmation email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending confirmation email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
    throw error;
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
          
          <p>Thank you for booking with Shalean Cleaning Services! Your booking has been confirmed and payment has been received.</p>
          
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
            <p style="color: #28a745; font-weight: bold;">✓ Payment Confirmed</p>
            ${priceBreakdown && (priceBreakdown.frequencyDiscount > 0 || priceBreakdown.discountCodeDiscount > 0) ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
              <p style="margin-bottom: 10px;"><strong>Discounts Applied:</strong></p>
              ${priceBreakdown.frequencyDiscount > 0 ? `
              <div style="margin-bottom: 8px;">
                <p style="margin: 0;">
                  <span>${frequencyName} Discount:</span>
                  <span style="color: #28a745; font-weight: bold; margin-left: 10px;">-${formatPrice(priceBreakdown.frequencyDiscount)}</span>
                </p>
                <p style="color: #28a745; font-size: 12px; margin: 5px 0 0 0;">✓ Frequency Discount Applied</p>
              </div>
              ` : ''}
              ${priceBreakdown.discountCodeDiscount > 0 ? `
              <div>
                <p style="margin: 0;">
                  <span>Discount Code ${booking.discountCode ? `(${booking.discountCode.toUpperCase()})` : ''}:</span>
                  <span style="color: #28a745; font-weight: bold; margin-left: 10px;">-${formatPrice(priceBreakdown.discountCodeDiscount)}</span>
                </p>
                <p style="color: #28a745; font-size: 12px; margin: 5px 0 0 0;">✓ Discount Code Applied</p>
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
              <strong>Email:</strong> hello@shalean.com<br>
              <strong>Phone:</strong> +27 12 345 6789
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Shalean Cleaning Services Team</strong>
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain ? "hello@shalean.com" : booking.email;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Booking Confirmation - ${booking.bookingReference} | Shalean Cleaning Services`,
      html: await formatBookingConfirmationEmail(booking),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw new Error(`Failed to send booking confirmation email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Booking confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending booking confirmation email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send booking confirmation email: ${error.message}`);
    }
    throw error;
  }
}

export async function sendBookingNotificationEmail(booking: Booking): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain 
    ? "hello@shalean.com" 
    : (process.env.RESEND_TO_EMAIL || "hello@shalean.com");

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
      throw new Error(`Failed to send booking notification email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Booking notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending booking notification email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send booking notification email: ${error.message}`);
    }
    throw error;
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
              This contact form submission was received from the Shalean Cleaning Services dashboard.
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
          
          <p>Thank you for reaching out to Shalean Cleaning Services. We have received your message and will get back to you as soon as possible.</p>
          
          <h2 style="color: #0C53ED; margin-top: 30px;">Your Message</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p style="white-space: pre-wrap; margin-top: 15px;">${data.message}</p>
          </div>
          
          <p>Our team typically responds within 24 hours. If your inquiry is urgent, please call us at <strong>+27 87 153 5250</strong>.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-radius: 5px; border-left: 4px solid #0C53ED;">
            <p style="margin: 0;"><strong>Need Immediate Assistance?</strong></p>
            <p style="margin: 5px 0 0 0;">Call us at <strong>+27 87 153 5250</strong> or email us at <strong>support@shalean.com</strong></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>The Shalean Cleaning Services Team</strong>
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

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  
  // When using Resend testing domain, only send to verified email address
  // Otherwise, use the configured email or default to hello@shalean.com
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain 
    ? "hello@shalean.com" 
    : (process.env.RESEND_TO_EMAIL || "hello@shalean.com");

  console.log("Sending contact form notification email to business:", {
    from: fromEmail,
    to: toEmail,
    customerEmail: data.email,
    isTestingDomain,
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
      throw new Error(`Failed to send contact notification email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Contact notification email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending contact notification email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send contact notification email: ${error.message}`);
    }
    throw error;
  }
}

export async function sendContactConfirmationEmail(data: ContactEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Initialize Resend client with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  
  // When using Resend testing domain, only send to verified email address
  // Otherwise, send to the customer's email
  const isTestingDomain = fromEmail.includes("@resend.dev");
  const toEmail = isTestingDomain ? "hello@shalean.com" : data.email;

  console.log("Sending contact confirmation email to customer:", {
    from: fromEmail,
    to: toEmail,
    originalCustomerEmail: data.email,
    isTestingDomain,
    customerName: data.name,
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `We've Received Your Message - Shalean Cleaning Services`,
      html: formatContactConfirmationEmail(data),
    });

    if (result.error) {
      console.error("Resend API error:", JSON.stringify(result.error, null, 2));
      throw new Error(`Failed to send contact confirmation email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log("Contact confirmation email sent successfully:", result.data?.id);
  } catch (error) {
    console.error("Exception while sending contact confirmation email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send contact confirmation email: ${error.message}`);
    }
    throw error;
  }
}
