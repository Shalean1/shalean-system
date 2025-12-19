"use server";

import { createClient } from "@/lib/supabase/server";
import { CleanerLoginData, CleanerProfile } from "@/lib/types/cleaner";
import { normalizePhoneNumber, extractPhoneNumber } from "@/lib/utils/phone";

export interface CleanerAuthResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  cleanerId?: string;
}

/**
 * Find cleaner profile by phone number
 * Handles phone numbers in various formats by normalizing them for comparison
 * Uses service role client to bypass RLS since user isn't authenticated yet
 */
async function getCleanerByPhone(phone: string): Promise<CleanerProfile | null> {
  // Extract phone number (in case email format was entered)
  const phoneOnly = extractPhoneNumber(phone);
  // Normalize the input phone number
  const normalizedPhone = normalizePhoneNumber(phoneOnly);
  
  // Use service role client to bypass RLS (user isn't authenticated yet)
  const { createServiceRoleClient } = await import("@/lib/supabase/server");
  const supabaseAdmin = createServiceRoleClient();
  
  // Query all cleaner profiles (those with cleaner_id)
  const { data: cleanerProfiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, cleaner_id, phone, email")
    .not("cleaner_id", "is", null);

  if (error || !cleanerProfiles || cleanerProfiles.length === 0) {
    return null;
  }

  // Find matching profile by comparing normalized phone numbers
  const matchingProfile = cleanerProfiles.find(profile => {
    if (!profile.phone) return false;
    const profilePhoneNormalized = normalizePhoneNumber(profile.phone);
    return profilePhoneNormalized === normalizedPhone;
  });

  if (!matchingProfile) {
    return null;
  }

  // Get cleaner details from cleaners table
  const { data: cleanerData } = await supabaseAdmin
    .from("cleaners")
    .select("name")
    .eq("cleaner_id", matchingProfile.cleaner_id)
    .single();

  return {
    id: matchingProfile.id,
    cleanerId: matchingProfile.cleaner_id,
    name: cleanerData?.name || "",
    phone: matchingProfile.phone || "",
    email: matchingProfile.email || undefined,
  };
}

/**
 * Authenticate cleaner with phone and password
 */
export async function authenticateCleanerWithPassword(
  data: CleanerLoginData
): Promise<CleanerAuthResult> {
  const errors: Record<string, string> = {};

  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  }

  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    const supabase = await createClient();

    // Extract and normalize phone number (handles cases where email format was entered)
    const phoneOnly = extractPhoneNumber(data.phone.trim());
    
    // Find cleaner by phone
    const cleaner = await getCleanerByPhone(phoneOnly);
    
    if (!cleaner) {
      return {
        success: false,
        message: "Invalid phone number or password",
        errors: { phone: "No cleaner account found with this phone number" },
      };
    }

    // Construct email from phone if cleaner doesn't have email stored
    // Cleaners are created with email constructed from phone (e.g., 27792022648@shalean.co.za)
    let emailToUse: string;
    if (cleaner.email && cleaner.email.includes("@")) {
      emailToUse = cleaner.email;
    } else {
      // Construct email from phone number (same format used in credential creation)
      const { constructCleanerEmail } = await import("@/lib/utils/phone");
      emailToUse = constructCleanerEmail(cleaner.phone);
    }

    // Sign in with password using the email
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: data.password!,
    });

    if (authError) {
      return {
        success: false,
        message: authError.message || "Invalid phone number or password",
        errors: { password: "Invalid password" },
      };
    }

    return {
      success: true,
      message: "Login successful!",
      cleanerId: cleaner.cleanerId,
    };
  } catch (error) {
    console.error("Error during cleaner login:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Login failed: ${errorMessage}`,
    };
  }
}

/**
 * Send SMS code for cleaner authentication
 */
export async function sendCleanerSMSCode(phone: string): Promise<CleanerAuthResult> {
  const errors: Record<string, string> = {};

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    const supabase = await createClient();

    // Extract and normalize phone number (handles cases where email format was entered)
    const phoneOnly = extractPhoneNumber(phone.trim());
    
    // Verify cleaner exists
    const cleaner = await getCleanerByPhone(phoneOnly);
    
    if (!cleaner) {
      return {
        success: false,
        message: "No cleaner account found with this phone number",
        errors: { phone: "Invalid phone number" },
      };
    }

    // Send OTP via Supabase
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phoneOnly,
      options: {
        channel: "sms",
      },
    });

    if (otpError) {
      return {
        success: false,
        message: otpError.message || "Failed to send SMS code",
        errors: { phone: "Failed to send SMS code" },
      };
    }

    return {
      success: true,
      message: "SMS code sent successfully!",
      cleanerId: cleaner.cleanerId,
    };
  } catch (error) {
    console.error("Error sending SMS code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to send SMS code: ${errorMessage}`,
    };
  }
}

/**
 * Verify SMS code and authenticate cleaner
 */
export async function verifyCleanerSMSCode(
  phone: string,
  smsCode: string
): Promise<CleanerAuthResult> {
  const errors: Record<string, string> = {};

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  }

  if (!smsCode || smsCode.trim().length === 0) {
    errors.smsCode = "SMS code is required";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    const supabase = await createClient();

    // Extract and normalize phone number (handles cases where email format was entered)
    const phoneOnly = extractPhoneNumber(phone.trim());
    
    // Verify cleaner exists
    const cleaner = await getCleanerByPhone(phoneOnly);
    
    if (!cleaner) {
      return {
        success: false,
        message: "No cleaner account found with this phone number",
        errors: { phone: "Invalid phone number" },
      };
    }

    // Verify OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phoneOnly,
      token: smsCode.trim(),
      type: "sms",
    });

    if (verifyError) {
      return {
        success: false,
        message: verifyError.message || "Invalid SMS code",
        errors: { smsCode: "Invalid or expired SMS code" },
      };
    }

    return {
      success: true,
      message: "Login successful!",
      cleanerId: cleaner.cleanerId,
    };
  } catch (error) {
    console.error("Error verifying SMS code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Verification failed: ${errorMessage}`,
    };
  }
}
