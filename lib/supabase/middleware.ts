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
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] Missing Supabase environment variables - auth checks disabled');
    }
    return NextResponse.next({
      request,
    });
  }

  // Validate Supabase URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co') && !url.hostname.includes('supabase')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Middleware] Supabase URL does not appear to be a valid Supabase URL:', supabaseUrl);
      }
    }
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] Invalid Supabase URL format:', supabaseUrl);
    }
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
      // Add timeout to prevent hanging requests (5 second timeout)
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );

      const result = await Promise.race([authPromise, timeoutPromise]);
      const { data: { user } } = result as Awaited<ReturnType<typeof supabase.auth.getUser>>;

      // Optionally protect certain routes
      // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      //   const url = request.nextUrl.clone();
      //   url.pathname = '/auth/login';
      //   return NextResponse.redirect(url);
      // }
    } catch (authError: unknown) {
      // Check if it's a network/connection error
      const error = authError as { message?: string; code?: string; cause?: unknown };
      const isNetworkError = 
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('aborted') ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT' ||
        error?.message?.includes('timeout') ||
        (error?.cause && typeof error.cause === 'object' && 'code' in error.cause && 
         (error.cause.code === 'ECONNRESET' || error.cause.code === 'ETIMEDOUT'));

      // Suppress network errors in production to reduce log noise
      // Only log them in development or if they're not network errors
      if (process.env.NODE_ENV === 'development') {
        if (isNetworkError) {
          // Log network errors in dev but as warnings
          console.warn('[Middleware] Supabase network error (this is normal if Supabase is unreachable):', 
            error?.message || 'Network connection failed');
        } else {
          console.error('[Middleware] Auth error:', authError);
        }
      } else if (!isNetworkError) {
        // In production, only log non-network errors
        console.error('[Middleware] Auth error:', authError);
      }
      // Continue with the request even if auth fails
    }

    // Set pathname header for use in layouts
    supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname);

    return supabaseResponse;
  } catch (error) {
    // Log the error but return a valid response to prevent 500 errors
    console.error('Middleware error:', error);
    const response = NextResponse.next({
      request,
    });
    // Set pathname header even on error
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }
}





