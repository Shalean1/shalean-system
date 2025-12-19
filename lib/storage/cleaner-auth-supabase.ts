import { createClient } from "@/lib/supabase/server";
import { CleanerLoginData, CleanerProfile } from "@/lib/types/cleaner";

export interface CleanerAuthResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  cleanerId?: string;
}

/**
 * Find cleaner profile by phone number
 */
export async function getCleanerByPhone(phone: string): Promise<CleanerProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, cleaner_id, phone, email")
    .eq("phone", phone)
    .not("cleaner_id", "is", null)
    .single();

  if (error || !data) {
    return null;
  }

  // Get cleaner details from cleaners table
  const { data: cleanerData } = await supabase
    .from("cleaners")
    .select("name")
    .eq("cleaner_id", data.cleaner_id)
    .single();

  return {
    id: data.id,
    cleanerId: data.cleaner_id,
    name: cleanerData?.name || "",
    phone: data.phone || "",
    email: data.email || undefined,
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

    // Find cleaner by phone
    const cleaner = await getCleanerByPhone(data.phone.trim());
    
    if (!cleaner) {
      return {
        success: false,
        message: "Invalid phone number or password",
        errors: { phone: "No cleaner account found with this phone number" },
      };
    }

    // If cleaner has email, use email for auth, otherwise use phone
    const identifier = cleaner.email || cleaner.phone;
    const isEmail = identifier.includes("@");

    // Sign in with password - use conditional object
    const { error: authError } = await supabase.auth.signInWithPassword(
      isEmail
        ? {
            email: identifier,
            password: data.password!,
          }
        : {
            phone: identifier,
            password: data.password!,
          }
    );

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

    // Verify cleaner exists
    const cleaner = await getCleanerByPhone(phone.trim());
    
    if (!cleaner) {
      return {
        success: false,
        message: "No cleaner account found with this phone number",
        errors: { phone: "Invalid phone number" },
      };
    }

    // Send OTP via Supabase
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
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

    // Verify cleaner exists
    const cleaner = await getCleanerByPhone(phone.trim());
    
    if (!cleaner) {
      return {
        success: false,
        message: "No cleaner account found with this phone number",
        errors: { phone: "Invalid phone number" },
      };
    }

    // Verify OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
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

/**
 * Get current cleaner profile from authenticated session
 */
export async function getCurrentCleaner(): Promise<CleanerProfile | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, cleaner_id, phone, email")
    .eq("id", user.id)
    .not("cleaner_id", "is", null)
    .single();

  if (!profile) {
    return null;
  }

  // Get cleaner details
  const { data: cleanerData } = await supabase
    .from("cleaners")
    .select("name")
    .eq("cleaner_id", profile.cleaner_id)
    .single();

  return {
    id: profile.id,
    cleanerId: profile.cleaner_id,
    name: cleanerData?.name || "",
    phone: profile.phone || "",
    email: profile.email || undefined,
  };
}
