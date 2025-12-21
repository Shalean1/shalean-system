import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/storage/profile-supabase";

/**
 * Auth callback route to handle email verification
 * Supabase redirects users here after they click the verification link in their email
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/";

  if (token_hash && type) {
    const supabase = await createClient();

    // Verify the token and exchange it for a session
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      console.error("Email verification error:", error);
      // Redirect to login with error message
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    if (data.session && data.user) {
      // Ensure profile exists (trigger may be disabled)
      try {
        const { ensureUserProfile } = await import("@/lib/utils/profile-creation");
        await ensureUserProfile(data.user.id, {
          email: data.user.email || null,
          firstName: data.user.user_metadata?.first_name || null,
          lastName: data.user.user_metadata?.last_name || null,
          fullName: data.user.user_metadata?.full_name || null,
        });
      } catch (profileError) {
        // Log but don't fail - profile can be created later
        console.error("Error ensuring profile in callback:", profileError);
      }
      
      // Check if user is admin and redirect accordingly
      const isAdmin = await isUserAdmin();
      const redirectPath = isAdmin ? "/admin" : (next === "/" ? "/dashboard" : next);
      
      // Successfully verified and logged in
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }
  }

  // If no token_hash, try to get the session from the code parameter
  // This handles the standard Supabase email confirmation flow
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Email verification error:", error);
      // Redirect to login with error message
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    if (data.session && data.user) {
      // Ensure profile exists (trigger may be disabled)
      try {
        const { ensureUserProfile } = await import("@/lib/utils/profile-creation");
        await ensureUserProfile(data.user.id, {
          email: data.user.email || null,
          firstName: data.user.user_metadata?.first_name || null,
          lastName: data.user.user_metadata?.last_name || null,
          fullName: data.user.user_metadata?.full_name || null,
        });
      } catch (profileError) {
        // Log but don't fail - profile can be created later
        console.error("Error ensuring profile in callback:", profileError);
      }
      
      // Check if user is admin and redirect accordingly
      const isAdmin = await isUserAdmin();
      const redirectPath = isAdmin ? "/admin" : (next === "/" ? "/dashboard" : next);
      
      // Successfully verified and logged in
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }
  }

  // If we get here, something went wrong
  // Redirect to login page
  return NextResponse.redirect(
    new URL("/auth/login?error=Verification failed. Please try again.", requestUrl.origin)
  );
}
