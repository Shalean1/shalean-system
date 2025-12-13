"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email is required";
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
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
  data: SignupFormData
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

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
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
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
