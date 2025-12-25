"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isPhoneNumber, constructCleanerEmail, normalizePhoneNumber } from "@/lib/utils/phone";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function login(
  data: LoginFormData
): Promise<AuthResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  // Check if input is empty
  if (!data.email || data.email.trim().length === 0) {
    errors.email = "Email or phone number is required";
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

    // Detect if input is phone number or email
    let emailToUse: string;
    
    if (isPhoneNumber(data.email.trim())) {
      // Input is a phone number - normalize it and construct email
      // Note: We use service role client to check profiles because RLS blocks
      // unauthenticated users from viewing profiles
      const normalizedPhone = normalizePhoneNumber(data.email.trim());
      const constructedEmail = constructCleanerEmail(data.email.trim());
      
      // Try to find profile using service role client (bypasses RLS)
      // This helps us determine the correct email format if profile exists
      emailToUse = constructedEmail; // Default to constructed email
      
      try {
        const { createServiceRoleClient } = await import("@/lib/supabase/server");
        const supabaseAdmin = createServiceRoleClient();
        
        // Check profiles by phone (normalized comparison)
        const { data: phoneProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, cleaner_id, phone, email")
          .not("phone", "is", null);
        
        const matchingProfile = phoneProfiles?.find(profile => {
          if (!profile.phone) return false;
          const profilePhoneNormalized = normalizePhoneNumber(profile.phone);
          return profilePhoneNormalized === normalizedPhone;
        });

        // If no match by phone, try by email
        if (!matchingProfile) {
          const { data: emailProfiles } = await supabaseAdmin
            .from("profiles")
            .select("id, cleaner_id, phone, email")
            .eq("email", constructedEmail)
            .limit(1);
          
          if (emailProfiles && emailProfiles.length > 0) {
            emailToUse = emailProfiles[0].email && emailProfiles[0].email.includes("@")
              ? emailProfiles[0].email
              : constructedEmail;
          }
        } else {
          // Found profile by phone - use its email if available
          emailToUse = matchingProfile.email && matchingProfile.email.includes("@")
            ? matchingProfile.email
            : constructedEmail;
        }
      } catch (error) {
        // If service role lookup fails, just use constructed email
        // This is safe because cleaner accounts are created with this format
        console.warn("Could not check profiles during login, using constructed email:", error);
        emailToUse = constructedEmail;
      }
    } else {
      // Input is an email - validate format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = "Please enter a valid email address or phone number";
        return {
          success: false,
          message: "Please fix the errors in the form",
          errors,
        };
      }
      emailToUse = data.email.trim();
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: data.password,
    });

    if (error) {
      // Provide more helpful error messages
      let errorMessage = error.message;
      
      // If login failed with phone number, check if account exists
      if (isPhoneNumber(data.email.trim())) {
        if (error.message?.includes("Invalid login credentials") || 
            error.message?.includes("Email not confirmed") ||
            error.message?.includes("Invalid password") ||
            error.message?.includes("incorrect")) {
          
          // Use service role client to check if account/profile exists
          // This helps us determine if it's "account doesn't exist" vs "wrong password"
          try {
            const { createServiceRoleClient } = await import("@/lib/supabase/server");
            const supabaseAdmin = createServiceRoleClient();
            const normalizedPhone = normalizePhoneNumber(data.email.trim());
            const constructedEmail = constructCleanerEmail(data.email.trim());
            
            // Check if profile exists with this phone or email
            const { data: phoneProfiles } = await supabaseAdmin
              .from("profiles")
              .select("id, cleaner_id, phone, email")
              .not("phone", "is", null);
            
            const hasPhoneMatch = phoneProfiles?.some(profile => {
              if (!profile.phone) return false;
              const profilePhoneNormalized = normalizePhoneNumber(profile.phone);
              return profilePhoneNormalized === normalizedPhone;
            });
            
            const { data: emailProfiles } = await supabaseAdmin
              .from("profiles")
              .select("id, cleaner_id, phone, email")
              .eq("email", constructedEmail)
              .limit(1);
            
            const hasEmailMatch = (emailProfiles?.length ?? 0) > 0;
            const accountExists = hasPhoneMatch || hasEmailMatch;
            
            if (!accountExists) {
              // No profile found - account likely doesn't exist
              errorMessage = "Invalid phone number or password";
              return {
                success: false,
                message: errorMessage,
                errors: { email: "No cleaner account found with this phone number" },
              };
            } else {
              // Profile exists but auth failed - likely wrong password
              errorMessage = "Invalid phone number or password";
              return {
                success: false,
                message: errorMessage,
                errors: { password: "Invalid password" },
              };
            }
          } catch (checkError) {
            // If we can't check, just show generic error
            console.warn("Could not verify account existence:", checkError);
            errorMessage = "Invalid phone number or password";
            return {
              success: false,
              message: errorMessage,
              errors: { password: "Invalid password" },
            };
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: true,
      message: "Login successful!",
    };
  } catch (error) {
    console.error("Error during login:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Login failed: ${errorMessage}`,
    };
  }
}

export async function signup(
  data: SignupFormData,
  referralCode?: string
): Promise<AuthResult> {
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

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    console.log("Signup attempt:", {
      email: data.email,
      siteUrl,
      redirectTo: `${siteUrl}/auth/callback`,
    });
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log("Signup successful:", {
      userId: authData.user?.id,
      email: authData.user?.email,
      emailConfirmed: authData.user?.email_confirmed_at ? "Yes" : "No",
      sessionCreated: !!authData.session,
    });

    // Process referral code if provided
    if (authData.user && referralCode && referralCode.trim()) {
      try {
        const { createServiceRoleClient } = await import("@/lib/supabase/server");
        const supabaseAdmin = createServiceRoleClient();
        
        // Create referral relationship using database function
        const { error: referralError } = await supabaseAdmin.rpc(
          "create_referral_relationship",
          {
            p_referee_id: authData.user.id,
            p_referral_code: referralCode.trim().toUpperCase(),
          }
        );

        if (referralError) {
          // Log error but don't fail signup if referral fails
          console.error("Failed to create referral relationship:", referralError);
        } else {
          console.log("Referral relationship created successfully");
        }
      } catch (error) {
        // Log error but don't fail signup if referral fails
        console.error("Error processing referral code:", error);
      }
    }

    // Create profile manually (trigger may be disabled)
    if (authData.user) {
      try {
        const { ensureUserProfile } = await import("@/lib/utils/profile-creation");
        await ensureUserProfile(authData.user.id, {
          email: authData.user.email || null,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
        });
      } catch (profileError) {
        // Log but don't fail signup - profile can be created later
        console.error("Error creating profile during signup:", profileError);
      }
    }

    // Send confirmation emails via Resend (to user and admin)
    if (authData.user && !authData.session) {
      try {
        // Generate confirmation link using Supabase admin API
        const { createServiceRoleClient } = await import("@/lib/supabase/server");
        const supabaseAdmin = createServiceRoleClient();
        
        const confirmationLinkResult = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: data.email,
          options: {
            redirectTo: `${siteUrl}/auth/callback`,
          },
        });

        if (confirmationLinkResult.error) {
          console.error("Error generating confirmation link:", confirmationLinkResult.error);
          // Continue without sending email - user can still use resend feature
        } else if (confirmationLinkResult.data?.properties?.action_link) {
          const confirmationLink = confirmationLinkResult.data.properties.action_link;
          
          // Send confirmation email to user
          try {
            const { sendSignupConfirmationEmail, sendSignupNotificationEmail } = await import("@/lib/email");
            await sendSignupConfirmationEmail({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              confirmationLink: confirmationLink,
            });
            console.log("Signup confirmation email sent to user via Resend");
          } catch (emailError) {
            console.error("Failed to send signup confirmation email (non-critical):", emailError);
            // Don't fail signup if email fails
          }

          // Send notification email to admin
          try {
            const { sendSignupNotificationEmail } = await import("@/lib/email");
            await sendSignupNotificationEmail({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              confirmationLink: confirmationLink,
            });
            console.log("Signup notification email sent to admin via Resend");
          } catch (adminEmailError) {
            console.error("Failed to send signup notification email to admin (non-critical):", adminEmailError);
            // Don't fail signup if admin email fails
          }
        }
      } catch (emailError) {
        console.error("Error sending confirmation emails via Resend (non-critical):", emailError);
        // Don't fail signup if email sending fails
      }
    }

    // Check if email confirmation is required
    if (authData.user && !authData.session) {
      return {
        success: true,
        message: "Account created! Please check your email to verify your account.",
      };
    }

    return {
      success: true,
      message: "Account created successfully!",
    };
  } catch (error) {
    console.error("Error during signup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Signup failed: ${errorMessage}`,
    };
  }
}

export async function forgotPassword(
  data: ForgotPasswordFormData
): Promise<AuthResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email is required";
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

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    };
  } catch (error) {
    console.error("Error during password reset:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Password reset failed: ${errorMessage}`,
    };
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error during logout:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Logout failed: ${errorMessage}`,
    };
  }
}

/**
 * Resend email confirmation using Resend
 */
export async function resendConfirmationEmail(email: string): Promise<AuthResult> {
  // Server-side validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      message: "Valid email is required",
      errors: { email: "Valid email is required" },
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Get user info to personalize the email
    const { createServiceRoleClient } = await import("@/lib/supabase/server");
    const supabaseAdmin = createServiceRoleClient();
    
    // Get user by email from profiles table (more reliable than auth.users)
    let firstName = "User";
    let lastName = "";
    
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name")
        .eq("email", email)
        .single();
      
      if (profile) {
        firstName = profile.first_name || firstName;
        lastName = profile.last_name || lastName;
      }
    } catch (profileError) {
      console.warn("Could not fetch user profile for email personalization:", profileError);
      // Continue with default values
    }

    // Generate new confirmation link
    const confirmationLinkResult = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (confirmationLinkResult.error) {
      console.error("Error generating confirmation link:", confirmationLinkResult.error);
      return {
        success: false,
        message: `Failed to generate confirmation link: ${confirmationLinkResult.error.message}`,
      };
    }

    const confirmationLink = confirmationLinkResult.data?.properties?.action_link;
    
    if (!confirmationLink) {
      return {
        success: false,
        message: "Failed to generate confirmation link",
      };
    }

    // Send confirmation email via Resend
    const { sendSignupConfirmationEmail } = await import("@/lib/email");

    await sendSignupConfirmationEmail({
      firstName: firstName,
      lastName: lastName,
      email: email,
      confirmationLink: confirmationLink,
    });

    return {
      success: true,
      message: "Confirmation email sent! Please check your inbox.",
    };
  } catch (error) {
    console.error("Error resending confirmation email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to resend confirmation email: ${errorMessage}`,
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the redirect path after login based on user role
 * Returns "/admin" for admins, "/dashboard" for regular users
 */
export async function getLoginRedirectPath(): Promise<string> {
  try {
    const { isUserAdmin } = await import("@/lib/storage/profile-supabase");
    const isAdmin = await isUserAdmin();
    return isAdmin ? "/admin" : "/dashboard";
  } catch (error) {
    console.error("Error checking admin status:", error);
    // Default to dashboard if check fails
    return "/dashboard";
  }
}
