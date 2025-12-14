import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Create a Supabase client for middleware use
 * This ensures auth sessions are refreshed on each request
 */
export async function updateSession(request: NextRequest) {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are missing, return next response without auth
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refreshing the auth token
    // Wrap in try-catch to handle any auth errors gracefully
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Optionally protect certain routes
      // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      //   const url = request.nextUrl.clone();
      //   url.pathname = '/auth/login';
      //   return NextResponse.redirect(url);
      // }
    } catch (authError) {
      // Log auth error but don't fail the request
      console.error('Auth error in middleware:', authError);
      // Continue with the request even if auth fails
    }

    return supabaseResponse;
  } catch (error) {
    // Log the error but return a valid response to prevent 500 errors
    console.error('Middleware error:', error);
    return NextResponse.next({
      request,
    });
  }
}





