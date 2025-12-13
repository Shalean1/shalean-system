"use server";

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
    // TODO: Implement actual authentication logic
    // - Check user credentials against database
    // - Create session/token
    // - Return success with user data
    
    console.log("Login attempt:", {
      email: data.email,
      timestamp: new Date().toISOString(),
    });

    // Placeholder response
    return {
      success: true,
      message: "Login successful! (Backend integration pending)",
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
    // TODO: Implement actual signup logic
    // - Check if user already exists
    // - Hash password
    // - Create user in database
    // - Create session/token
    // - Send verification email (optional)
    
    console.log("Signup attempt:", {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      timestamp: new Date().toISOString(),
    });

    // Placeholder response
    return {
      success: true,
      message: "Account created successfully! (Backend integration pending)",
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
    // TODO: Implement actual password reset logic
    // - Check if user exists
    // - Generate reset token
    // - Store token with expiration
    // - Send password reset email with token link
    
    console.log("Password reset request:", {
      email: data.email,
      timestamp: new Date().toISOString(),
    });

    // Placeholder response
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
