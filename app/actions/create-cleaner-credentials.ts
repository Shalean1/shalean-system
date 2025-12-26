"use server";

import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Cleaner } from "@/lib/supabase/booking-data";
import { constructCleanerEmail, normalizePhoneNumber } from "@/lib/utils/phone";

export interface CreateCleanerCredentialsData {
  cleanerId: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface CreateCleanerCredentialsResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  userId?: string;
}

/**
 * Create login credentials for a cleaner
 * This creates a Supabase auth account and links it to the cleaner record
 */
export async function createCleanerCredentials(
  data: CreateCleanerCredentialsData
): Promise<CreateCleanerCredentialsResult> {
  const errors: Record<string, string> = {};

  // Validate cleaner_id
  if (!data.cleanerId || data.cleanerId.trim().length === 0) {
    errors.cleanerId = "Cleaner selection is required";
  }

  // Validate phone
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  } else {
    // Basic phone validation - allow various formats
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  // Validate email if provided
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
  }

  // Validate password
  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Return early if validation errors
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return {
        success: false,
        message: "Server configuration error: Service role key is missing. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. You can find it in Supabase Dashboard → Settings → API → service_role key (secret).",
        errors: { cleanerId: "Server configuration error" },
      };
    }

    const supabaseAdmin = createServiceRoleClient();


    // Step 1: Verify cleaner exists
    const { data: cleaner, error: cleanerError } = await supabaseAdmin
      .from("cleaners")
      .select("cleaner_id, name")
      .eq("cleaner_id", data.cleanerId.trim())
      .single();

    if (cleanerError || !cleaner) {
      return {
        success: false,
        message: "Invalid cleaner selected",
        errors: { cleanerId: "Cleaner not found" },
      };
    }

    // Step 2: Check if cleaner already has credentials
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id, phone, email")
      .eq("cleaner_id", data.cleanerId.trim())
      .single();

    // Check if error is due to missing column
    if (existingProfileError) {
      if (existingProfileError.code === "42703" || existingProfileError.message?.includes("column") && existingProfileError.message?.includes("does not exist")) {
        return {
          success: false,
          message: "Database schema error: The 'cleaner_id' column does not exist in the profiles table. Please run the migration file: supabase/migrations/017_cleaner_dashboard.sql in your Supabase SQL Editor.",
          errors: { cleanerId: "Missing database column. Please run the migration." },
        };
      }
      // If it's a "not found" error (PGRST116), that's fine - cleaner doesn't have credentials yet
      if (existingProfileError.code !== "PGRST116") {
        console.error("Error checking existing profile:", existingProfileError);
        // Continue anyway - this might be a transient error
      }
    }

    if (existingProfile) {
      return {
        success: false,
        message: "This cleaner already has login credentials",
        errors: { cleanerId: "Credentials already exist for this cleaner" },
      };
    }

    // Step 3: Check if phone is already in use by another cleaner
    const { data: phoneInUse } = await supabaseAdmin
      .from("profiles")
      .select("id, cleaner_id")
      .eq("phone", data.phone.trim())
      .not("cleaner_id", "is", null)
      .single();

    if (phoneInUse) {
      return {
        success: false,
        message: "This phone number is already registered to another cleaner",
        errors: { phone: "Phone number already in use" },
      };
    }

    // Step 4: Create auth user
    // BYPASS: Always use email authentication to avoid requiring phone auth in Supabase
    // If no email provided, generate email from phone number using domain bokkie.co.za
    const email = data.email?.trim() || constructCleanerEmail(data.phone.trim());
    const isEmail = true; // Always use email auth to bypass phone auth requirement

    let authUser;
    let authError;

    // Always create user with email authentication (bypasses phone auth requirement)
    // Don't pass phone to createUser - store it only in metadata to avoid phone auth requirement
    // Note: We set email_confirm to true to bypass email verification for cleaners
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: data.password,
      // Note: Not passing phone here to avoid requiring phone auth in Supabase
      email_confirm: true, // Auto-confirm email for cleaners
      user_metadata: {
        cleaner_id: data.cleanerId.trim(),
        name: cleaner.name,
        phone: data.phone.trim(), // Store phone in metadata for trigger access
        normalized_phone: normalizePhoneNumber(data.phone.trim()), // Store normalized phone for consistency
        // Flag to indicate this is a phone-based account using email auth
        auth_method: data.email ? 'email' : 'phone_via_email',
      },
    });
    authUser = authData?.user;
    authError = error;
    
    if (authError || !authUser) {
      // Log full error details for debugging
      const fullErrorDetails = {
        error: authError,
        errorMessage: authError?.message,
        errorStatus: authError?.status,
        errorCode: (authError as any)?.code,
        errorDetails: (authError as any)?.details,
        errorHint: (authError as any)?.hint,
        email,
        phone: data.phone.trim(),
        cleanerId: data.cleanerId.trim(),
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      };
      console.error("Error creating auth user:", JSON.stringify(fullErrorDetails, null, 2));
      
      // Provide more specific error messages
      let errorMessage = "Failed to create user account";
      let errorField = "password";
      
      if (authError) {
        const errorMsg = authError.message || "";
        const errorCode = (authError as any)?.code;
        const errorDetails = (authError as any)?.details || "";
        const errorHint = (authError as any)?.hint || "";
        
        // Combine all error information for better diagnostics
        const fullErrorText = [errorMsg, errorDetails, errorHint].filter(Boolean).join(" ");
        
        // Check for common Supabase auth errors
        if (errorMsg.includes("already registered") || errorMsg.includes("already exists") || errorCode === "user_already_registered" || fullErrorText.includes("already registered")) {
          errorMessage = "This email or phone number is already registered";
          errorField = data.email ? "email" : "phone";
        } else if (errorMsg.includes("invalid") || errorCode === "invalid_email" || fullErrorText.includes("invalid email")) {
          errorMessage = errorMsg || "Invalid email address";
          errorField = data.email ? "email" : "phone";
        } else if (errorMsg.includes("password") || errorCode === "weak_password" || fullErrorText.includes("password")) {
          errorMessage = errorMsg || "Password does not meet requirements";
          errorField = "password";
        } else if (errorMsg.includes("JWT") || errorMsg.includes("permission") || authError.status === 403 || errorCode === "invalid_jwt" || fullErrorText.includes("permission")) {
          errorMessage = "Permission denied. Please check that SUPABASE_SERVICE_ROLE_KEY is correctly configured in your .env.local file. You can find it in Supabase Dashboard → Settings → API → service_role key (secret).";
          errorField = "cleanerId";
        } else if (errorMsg.includes("Database error") || authError.status === 500 || errorCode === "unexpected_failure" || fullErrorText.includes("trigger") || fullErrorText.includes("function")) {
          // Database error - likely trigger or constraint issue
          // Check if it's a specific constraint violation
          if (fullErrorText.includes("unique constraint") || fullErrorText.includes("23505") || fullErrorText.includes("idx_profiles_cleaner_phone_unique") || fullErrorText.includes("duplicate key")) {
            errorMessage = "This phone number is already registered to another cleaner";
            errorField = "phone";
          } else if (fullErrorText.includes("foreign key") || fullErrorText.includes("23503") || fullErrorText.includes("violates foreign key")) {
            errorMessage = `Invalid cleaner selected. The cleaner "${data.cleanerId}" does not exist in the database.`;
            errorField = "cleanerId";
          } else {
            // Show the actual error message for better debugging
            const displayError = fullErrorText || errorMsg || "Unknown database error";
            errorMessage = `Database error creating user: ${displayError}. This may be due to a trigger failure. Please check: 1) Migration 021_simple_robust_trigger.sql has been run, 2) Check Supabase logs for detailed error, 3) Verify SUPABASE_SERVICE_ROLE_KEY is correct.`;
            errorField = "email";
          }
        } else {
          // Show the full error message for any other errors
          errorMessage = fullErrorText || errorMsg || "Failed to create user account";
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        errors: { [errorField]: errorMessage },
      };
    }

    // Step 5: Create or update profile with cleaner_id link
    // Note: A trigger may have already created a profile, so we use upsert
    // Small delay to ensure trigger has completed if it exists
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if profile was created by trigger
    const { data: existingProfileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id, cleaner_id, phone")
      .eq("id", authUser.id)
      .single();
    
    // If profile exists but is missing cleaner_id or phone, update it
    if (existingProfileCheck) {
      const needsUpdate = 
        existingProfileCheck.cleaner_id !== data.cleanerId.trim() ||
        existingProfileCheck.phone !== data.phone.trim();
      
      if (needsUpdate) {
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            phone: data.phone.trim(),
            email: email,
            cleaner_id: data.cleanerId.trim(),
          })
          .eq("id", authUser.id);
        
        if (updateError) {
          console.error("Error updating profile created by trigger:", {
            error: updateError,
            errorMessage: updateError.message,
            errorCode: updateError.code,
            authUserId: authUser.id,
          });
          // Continue - profile exists, just missing some fields
        }
      }
    } else {
      // Profile doesn't exist, create it (trigger may have failed)
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: authUser.id,
          phone: data.phone.trim(),
          email: email,
          cleaner_id: data.cleanerId.trim(),
        });

      if (profileError) {
        console.error("Error creating profile (trigger may have failed):", {
          error: profileError,
          errorMessage: profileError.message,
          errorCode: profileError.code,
          errorDetails: profileError.details,
          authUserId: authUser.id,
          cleanerId: data.cleanerId.trim(),
          phone: data.phone.trim(),
        });
        
        // Try to clean up auth user if profile creation fails
        // But only if it's a critical error (not just a duplicate)
        if (profileError.code !== "23505" && profileError.code !== "PGRST116") {
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            console.log("Cleaned up auth user due to profile creation failure");
          } catch (deleteError) {
            console.error("Error cleaning up auth user:", deleteError);
          }
        }
        
        // Provide more specific error messages based on error code
        let errorMessage = "Failed to create profile";
        let errorField = "cleanerId";
        
        if (profileError.code === "23503") {
          // Foreign key violation - cleaner_id doesn't exist
          errorMessage = `Invalid cleaner selected. The cleaner "${data.cleanerId}" does not exist in the database.`;
          errorField = "cleanerId";
        } else if (profileError.code === "23505") {
          // Unique constraint violation - profile might already exist
          if (profileError.message?.includes("phone") || profileError.message?.includes("idx_profiles_cleaner_phone_unique")) {
            errorMessage = "This phone number is already registered to another cleaner";
            errorField = "phone";
          } else {
            // Profile might have been created between check and insert
            // Verify it exists and has correct data
            const { data: verifyProfile } = await supabaseAdmin
              .from("profiles")
              .select("id, cleaner_id, phone")
              .eq("id", authUser.id)
              .single();
            
            if (verifyProfile && verifyProfile.cleaner_id === data.cleanerId.trim()) {
              // Profile exists with correct cleaner_id, success!
              console.log("Profile already exists with correct data, continuing");
            } else {
              errorMessage = "A profile with these details already exists but data doesn't match";
            }
          }
        } else if (profileError.code === "PGRST116") {
          // Not found - shouldn't happen here, but if it does, profile doesn't exist
          errorMessage = "Profile was not created. Please try again.";
        } else if (profileError.message) {
          errorMessage = profileError.message;
        }
        
        // Only return error if it's critical
        if (profileError.code !== "23505" || !profileError.message?.includes("phone")) {
          return {
            success: false,
            message: errorMessage,
            errors: { [errorField]: errorMessage },
          };
        }
      }
    }

    return {
      success: true,
      message: `Credentials created successfully for ${cleaner.name}!`,
      userId: authUser.id,
    };
  } catch (error) {
    console.error("Error creating cleaner credentials:", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      formData: {
        cleanerId: data.cleanerId,
        phone: data.phone,
        email: data.email,
      },
    });
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyMessage = "Failed to create credentials";
    let errorField = "cleanerId";
    
    // Check if it's a Supabase error with more details
    const supabaseError = error as any;
    if (supabaseError?.code) {
      // Handle specific Supabase error codes
      if (supabaseError.code === "23503") {
        userFriendlyMessage = `Database error: The cleaner "${data.cleanerId}" does not exist in the database. Please refresh the page and try again.`;
        errorField = "cleanerId";
      } else if (supabaseError.code === "23505") {
        if (supabaseError.message?.includes("phone") || supabaseError.message?.includes("idx_profiles_cleaner_phone_unique")) {
          userFriendlyMessage = "This phone number is already registered to another cleaner";
          errorField = "phone";
        } else {
          userFriendlyMessage = "A profile with these details already exists";
        }
      } else if (supabaseError.code === "42P01") {
        userFriendlyMessage = "Database error: The 'cleaner_id' column does not exist in the profiles table. Please run the migration: supabase/migrations/017_cleaner_dashboard.sql";
        errorField = "cleanerId";
      } else {
        userFriendlyMessage = `Database error (${supabaseError.code}): ${supabaseError.message || errorMessage}`;
      }
    } else {
      // Provide more helpful error messages for common issues
      if (errorMessage.includes("foreign key") || errorMessage.includes("23503")) {
        userFriendlyMessage = "Database error: The selected cleaner does not exist. Please refresh the page and try again.";
        errorField = "cleanerId";
      } else if (errorMessage.includes("unique constraint") || errorMessage.includes("23505")) {
        userFriendlyMessage = "Database error: A record with these details already exists.";
      } else if (errorMessage.includes("permission") || errorMessage.includes("JWT") || errorMessage.includes("403")) {
        userFriendlyMessage = "Permission error: Please check that SUPABASE_SERVICE_ROLE_KEY is correctly configured in your .env.local file.";
        errorField = "cleanerId";
      } else if (errorMessage.includes("column") && errorMessage.includes("does not exist")) {
        userFriendlyMessage = "Database error: Missing column 'cleaner_id' in profiles table. Please run the migration: supabase/migrations/017_cleaner_dashboard.sql";
        errorField = "cleanerId";
      } else {
        userFriendlyMessage = `Database error creating new user: ${errorMessage}`;
      }
    }

    return {
      success: false,
      message: userFriendlyMessage,
      errors: { [errorField]: userFriendlyMessage },
    };
  }
}

/**
 * Get all cleaners with their credentials status
 * Returns cleaners with a flag indicating if they have login credentials
 */
export interface CleanerWithCredentialsStatus extends Cleaner {
  hasCredentials: boolean;
}

export async function getCleanersWithCredentialsStatus(): Promise<CleanerWithCredentialsStatus[]> {
  try {
    const supabase = createServiceRoleClient();

    // Get all active cleaners
    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (cleanersError) {
      console.error("Error fetching cleaners:", cleanersError);
      return [];
    }

    if (!cleaners || cleaners.length === 0) {
      return [];
    }

    // Get all profiles with cleaner_id
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("cleaner_id")
      .not("cleaner_id", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue without profile data
    }

    // Create a set of cleaner_ids that have credentials
    const cleanerIdsWithCredentials = new Set(
      (profiles || []).map((p) => p.cleaner_id).filter((id): id is string => !!id)
    );

    // Map cleaners with credentials status
    return cleaners.map((cleaner) => ({
      id: cleaner.id,
      cleaner_id: cleaner.cleaner_id,
      name: cleaner.name,
      bio: cleaner.bio,
      rating: cleaner.rating ? Number(cleaner.rating) : undefined,
      total_jobs: cleaner.total_jobs || 0,
      avatar_url: cleaner.avatar_url,
      display_order: cleaner.display_order || 0,
      is_active: cleaner.is_active,
      is_available: cleaner.is_available,
      availability_days: cleaner.availability_days || undefined,
      hasCredentials: cleanerIdsWithCredentials.has(cleaner.cleaner_id),
    }));
  } catch (error) {
    console.error("Error in getCleanersWithCredentialsStatus:", error);
    return [];
  }
}
