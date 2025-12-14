import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    if (data.session) {
      // Successfully verified and logged in
      // Redirect to dashboard or home page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
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

    if (data.session) {
      // Successfully verified and logged in
      // Redirect to dashboard or home page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If we get here, something went wrong
  // Redirect to login page
  return NextResponse.redirect(
    new URL("/auth/login?error=Verification failed. Please try again.", requestUrl.origin)
  );
}
